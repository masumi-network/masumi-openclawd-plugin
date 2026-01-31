import { EventEmitter } from 'events';
import { ApiClient } from '../utils/api-client';
import { createMasumiInputHash, createMasumiOutputHash } from '../utils/hashing';
import {
  PaymentRequest,
  CreatePaymentParams,
  PaymentState,
  WalletBalance,
  PaymentListResponse,
  PaymentStateChangeEvent,
} from '../types/payment';
import { MasumiPluginConfig } from '../types/config';

/**
 * Payment Manager Events
 */
export interface PaymentManagerEvents {
  'payment:created': (payment: PaymentRequest) => void;
  'payment:state_changed': (event: PaymentStateChangeEvent) => void;
  'payment:funds_locked': (payment: PaymentRequest) => void;
  'payment:result_submitted': (data: { blockchainIdentifier: string; resultHash: string }) => void;
  'payment:completed': (payment: PaymentRequest) => void;
  'payment:refund_authorized': (data: { blockchainIdentifier: string }) => void;
  'payment:monitor_error': (data: { id: string; error: unknown }) => void;
}

/**
 * Payment Manager
 *
 * Handles all payment-related operations:
 * - Creating payment requests
 * - Checking payment status
 * - Submitting work results
 * - Managing wallet balance
 * - Monitoring pending payments
 *
 * Follows Masumi Payment Service API v1 specification
 */
export class PaymentManager extends EventEmitter {
  private client: ApiClient;
  private config: MasumiPluginConfig;
  private pendingPayments: Map<string, PaymentRequest> = new Map();
  private statusMonitorInterval?: NodeJS.Timeout;
  private isMonitoring = false;

  constructor(config: MasumiPluginConfig) {
    super();
    this.config = config;

    // Initialize API client
    this.client = new ApiClient({
      baseUrl: config.paymentServiceUrl,
      apiKey: config.paymentApiKey,
      additionalHeaders: config.sellerVkey
        ? { 'X-Seller-Vkey': config.sellerVkey }
        : undefined,
    });
  }

  /**
   * Create a new payment request
   *
   * @param params - Payment creation parameters
   * @returns PaymentRequest with blockchain identifier
   *
   * @example
   * ```typescript
   * const payment = await paymentManager.createPaymentRequest({
   *   identifierFromPurchaser: 'abc123...',
   *   inputData: { task: 'analyze data' },
   *   metadata: 'Job ID: 42',
   * });
   *
   * console.log('Payment ID:', payment.blockchainIdentifier);
   * console.log('Pay by:', new Date(payment.payByTime));
   * ```
   */
  async createPaymentRequest(params: CreatePaymentParams): Promise<PaymentRequest> {
    if (!this.config.agentIdentifier) {
      throw new Error(
        'agentIdentifier not configured. Please provision agent first or set agentIdentifier in config.'
      );
    }

    const { identifierFromPurchaser, inputData, payByTime, submitResultTime, metadata } = params;

    // Calculate input hash if input data provided (MIP-004)
    let inputHash: string | undefined;
    if (inputData) {
      inputHash = createMasumiInputHash(inputData, identifierFromPurchaser);
    }

    // Set default times if not provided
    const payBy = payByTime || new Date(Date.now() + 12 * 60 * 60 * 1000); // 12 hours
    const submitBy = submitResultTime || new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const payload = {
      agentIdentifier: this.config.agentIdentifier,
      network: this.config.network,
      paymentType: 'Web3CardanoV1' as const,
      payByTime: payBy.toISOString(),
      submitResultTime: submitBy.toISOString(),
      identifierFromPurchaser,
      ...(inputHash && { inputHash }),
      ...(metadata && { metadata }),
    };

    console.log('Creating payment request...', {
      agentIdentifier: payload.agentIdentifier,
      network: payload.network,
      purchaserId: identifierFromPurchaser,
    });

    const response = await this.client.post<PaymentRequest>('/payment', payload);

    // Store in pending payments
    this.pendingPayments.set(response.blockchainIdentifier, response);

    // Emit event
    this.emit('payment:created', response);

    console.log('✓ Payment request created:', {
      blockchainIdentifier: response.blockchainIdentifier,
      payByTime: response.payByTime,
      submitResultTime: response.submitResultTime,
    });

    return response;
  }

  /**
   * Check payment status by blockchain identifier
   *
   * @param blockchainIdentifier - The blockchain identifier
   * @returns Updated payment request
   *
   * @example
   * ```typescript
   * const payment = await paymentManager.checkPaymentStatus('payment_xyz...');
   *
   * if (payment.onChainState === 'FundsLocked') {
   *   console.log('Payment received! Start work now.');
   * }
   * ```
   */
  async checkPaymentStatus(blockchainIdentifier: string): Promise<PaymentRequest> {
    const response = await this.client.post<PaymentRequest>(
      '/payment/resolve-blockchain-identifier',
      {
        blockchainIdentifier,
        network: this.config.network,
      }
    );

    const existing = this.pendingPayments.get(blockchainIdentifier);
    const previousState = existing?.onChainState;

    // Update stored payment
    this.pendingPayments.set(blockchainIdentifier, response);

    // Emit state change event if state changed
    if (previousState !== response.onChainState) {
      const event: PaymentStateChangeEvent = {
        blockchainIdentifier,
        previousState: previousState || null,
        newState: response.onChainState || null,
        payment: response,
      };

      this.emit('payment:state_changed', event);

      // Emit specific events
      if (response.onChainState === 'FundsLocked') {
        this.emit('payment:funds_locked', response);
        console.log('💰 Payment received (FundsLocked):', blockchainIdentifier);
      } else if (response.onChainState === 'Withdrawn') {
        this.emit('payment:completed', response);
        console.log('✓ Payment completed (Withdrawn):', blockchainIdentifier);
      }
    }

    return response;
  }

  /**
   * Submit result hash for a payment
   *
   * @param blockchainIdentifier - The blockchain identifier
   * @param outputData - The work output/result (will be hashed using MIP-004)
   * @returns Updated payment request
   *
   * @example
   * ```typescript
   * const result = { analysis: 'Complete', confidence: 0.95 };
   *
   * await paymentManager.submitResult(
   *   'payment_xyz...',
   *   JSON.stringify(result)
   * );
   *
   * console.log('Result submitted! Funds will unlock soon.');
   * ```
   */
  async submitResult(blockchainIdentifier: string, outputData: string): Promise<PaymentRequest> {
    const payment = this.pendingPayments.get(blockchainIdentifier);

    if (!payment) {
      throw new Error(
        `Payment not found: ${blockchainIdentifier}. ` +
        `Call checkPaymentStatus() first or ensure payment was created via this manager.`
      );
    }

    // Calculate output hash (MIP-004)
    const resultHash = createMasumiOutputHash(outputData, payment.identifierFromPurchaser);

    console.log('Submitting result...', {
      blockchainIdentifier,
      resultHash,
    });

    const response = await this.client.post<PaymentRequest>('/payment/submit-result', {
      blockchainIdentifier,
      network: this.config.network,
      resultHash,
    });

    // Update stored payment
    this.pendingPayments.set(blockchainIdentifier, response);

    // Emit event
    this.emit('payment:result_submitted', { blockchainIdentifier, resultHash });

    console.log('✓ Result submitted:', {
      blockchainIdentifier,
      resultHash,
      nextAction: response.NextAction.requestedAction,
    });

    return response;
  }

  /**
   * Authorize a refund request
   *
   * Use this when you need to issue a refund (e.g., unable to complete work)
   *
   * @param blockchainIdentifier - The blockchain identifier
   * @returns Updated payment request
   *
   * @example
   * ```typescript
   * await paymentManager.authorizeRefund('payment_xyz...');
   * console.log('Refund authorized. Buyer can withdraw.');
   * ```
   */
  async authorizeRefund(blockchainIdentifier: string): Promise<PaymentRequest> {
    console.log('Authorizing refund...', { blockchainIdentifier });

    const response = await this.client.post<PaymentRequest>('/payment/authorize-refund', {
      blockchainIdentifier,
      network: this.config.network,
    });

    // Update stored payment
    this.pendingPayments.set(blockchainIdentifier, response);

    // Emit event
    this.emit('payment:refund_authorized', { blockchainIdentifier });

    console.log('✓ Refund authorized:', blockchainIdentifier);

    return response;
  }

  /**
   * Get wallet balance
   *
   * @returns Wallet balance (ADA and tokens)
   *
   * @example
   * ```typescript
   * const balance = await paymentManager.getWalletBalance();
   * console.log('Balance:', balance.ada, 'lovelace');
   * console.log('Tokens:', balance.tokens);
   * ```
   */
  async getWalletBalance(): Promise<WalletBalance> {
    if (!this.config.sellerVkey) {
      throw new Error('sellerVkey not configured. Cannot query wallet balance.');
    }

    const response = await this.client.get<WalletBalance>('/wallet', {
      network: this.config.network,
    });

    return response;
  }

  /**
   * List payment history
   *
   * @param options - Pagination options
   * @returns List of payments with pagination
   *
   * @example
   * ```typescript
   * const { payments, nextCursorId } = await paymentManager.listPayments({
   *   limit: 10,
   * });
   *
   * console.log('Found', payments.length, 'payments');
   *
   * // Get next page
   * if (nextCursorId) {
   *   const nextPage = await paymentManager.listPayments({
   *     limit: 10,
   *     cursorId: nextCursorId,
   *   });
   * }
   * ```
   */
  async listPayments(options?: {
    limit?: number;
    cursorId?: string;
    filterSmartContractAddress?: string;
  }): Promise<PaymentListResponse> {
    const params: Record<string, string> = {
      network: this.config.network,
      limit: String(options?.limit || 10),
    };

    if (options?.cursorId) {
      params.cursorId = options.cursorId;
    }

    if (options?.filterSmartContractAddress) {
      params.filterSmartContractAddress = options.filterSmartContractAddress;
    }

    const response = await this.client.get<{
      data: PaymentRequest[];
      nextCursorId?: string;
    }>('/payment', params);

    return {
      payments: response.data || [],
      nextCursorId: response.nextCursorId,
    };
  }

  /**
   * Start monitoring payment statuses
   *
   * Automatically polls payment status for all pending payments
   * and emits events when state changes.
   *
   * @param intervalMs - Polling interval in milliseconds (default: 30 seconds)
   *
   * @example
   * ```typescript
   * // Listen for events
   * paymentManager.on('payment:funds_locked', (payment) => {
   *   console.log('Payment received!', payment.blockchainIdentifier);
   *   // Start work here
   * });
   *
   * paymentManager.on('payment:completed', (payment) => {
   *   console.log('Payment completed!', payment.blockchainIdentifier);
   * });
   *
   * // Start monitoring
   * paymentManager.startStatusMonitoring(30000); // 30 seconds
   * ```
   */
  startStatusMonitoring(intervalMs: number = 30000): void {
    if (this.isMonitoring) {
      console.warn('Payment monitoring already running');
      return;
    }

    if (this.statusMonitorInterval) {
      clearInterval(this.statusMonitorInterval);
    }

    this.isMonitoring = true;

    this.statusMonitorInterval = setInterval(async () => {
      for (const [id, payment] of this.pendingPayments) {
        // Skip completed payments
        const completedStates: PaymentState[] = ['Withdrawn', 'RefundWithdrawn', 'DisputedWithdrawn'];
        if (payment.onChainState && completedStates.includes(payment.onChainState)) {
          continue;
        }

        try {
          await this.checkPaymentStatus(id);
        } catch (error) {
          console.error('Payment status check failed:', { id, error });
          this.emit('payment:monitor_error', { id, error });
        }
      }
    }, intervalMs);

    console.log('✓ Payment status monitoring started', { intervalMs });
  }

  /**
   * Stop payment monitoring
   */
  stopStatusMonitoring(): void {
    if (this.statusMonitorInterval) {
      clearInterval(this.statusMonitorInterval);
      this.statusMonitorInterval = undefined;
      this.isMonitoring = false;
      console.log('✓ Payment status monitoring stopped');
    }
  }

  /**
   * Get all pending payments
   *
   * @returns Map of blockchain identifier to payment request
   */
  getPendingPayments(): Map<string, PaymentRequest> {
    return new Map(this.pendingPayments);
  }

  /**
   * Get payment by blockchain identifier
   *
   * @param blockchainIdentifier - The blockchain identifier
   * @returns PaymentRequest if found, undefined otherwise
   */
  getPayment(blockchainIdentifier: string): PaymentRequest | undefined {
    return this.pendingPayments.get(blockchainIdentifier);
  }

  /**
   * Remove completed payments from memory
   *
   * Cleans up payments that are in final states
   *
   * @returns Number of payments removed
   */
  cleanupCompletedPayments(): number {
    const completedStates: PaymentState[] = ['Withdrawn', 'RefundWithdrawn', 'DisputedWithdrawn'];
    let removed = 0;

    for (const [id, payment] of this.pendingPayments) {
      if (payment.onChainState && completedStates.includes(payment.onChainState)) {
        this.pendingPayments.delete(id);
        removed++;
      }
    }

    if (removed > 0) {
      console.log(`✓ Cleaned up ${removed} completed payment(s)`);
    }

    return removed;
  }

  /**
   * Close the payment manager
   *
   * Stops monitoring and clears pending payments
   */
  async close(): Promise<void> {
    this.stopStatusMonitoring();
    this.pendingPayments.clear();
    this.removeAllListeners();
    console.log('✓ PaymentManager closed');
  }
}
