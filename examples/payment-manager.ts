/**
 * Example: Using PaymentManager
 *
 * This example demonstrates:
 * 1. Creating payment requests
 * 2. Checking payment status
 * 3. Submitting work results
 * 4. Monitoring payments with events
 * 5. Getting wallet balance
 */

import { PaymentManager } from '../src/managers/payment';
import { MasumiPluginConfig } from '../src/types/config';

// Example configuration
const config: MasumiPluginConfig = {
  network: 'Preprod',
  paymentServiceUrl: 'https://payment.masumi.network/api/v1',
  paymentApiKey: process.env.MASUMI_PAYMENT_API_KEY || 'your_api_key_here',
  sellerVkey: process.env.MASUMI_SELLER_VKEY || 'your_vkey_here',
  agentIdentifier: process.env.MASUMI_AGENT_IDENTIFIER || 'agent_example_123',
};

/**
 * Example 1: Create a payment request
 */
async function example1_createPayment() {
  console.log('\n Example 1: Create Payment Request\n');

  const manager = new PaymentManager(config);

  try {
    const payment = await manager.createPaymentRequest({
      identifierFromPurchaser: 'abc123def456789012345678', // 24-char hex
      inputData: {
        task: 'analyze_data',
        dataset: 'customer_behavior_2024',
        parameters: {
          timeframe: '30d',
          metrics: ['conversion', 'retention'],
        },
      },
      metadata: 'Job ID: 42, Priority: high',
    });

    console.log('OK Payment created:');
    console.log('  Blockchain ID:', payment.blockchainIdentifier);
    console.log('  Pay by:', new Date(payment.payByTime).toLocaleString());
    console.log('  Submit by:', new Date(payment.submitResultTime).toLocaleString());
    console.log('  Status:', payment.onChainState || 'Pending');
    console.log('  Next action:', payment.NextAction.requestedAction);

    await manager.close();
    return payment;
  } catch (error) {
    console.error('Error creating payment:', error);
    await manager.close();
    throw error;
  }
}

/**
 * Example 2: Check payment status
 */
async function example2_checkStatus(blockchainIdentifier: string) {
  console.log('\n Example 2: Check Payment Status\n');

  const manager = new PaymentManager(config);

  try {
    const payment = await manager.checkPaymentStatus(blockchainIdentifier);

    console.log('OK Payment status:');
    console.log('  Blockchain ID:', payment.blockchainIdentifier);
    console.log('  On-chain state:', payment.onChainState || 'Not yet on-chain');
    console.log('  Next action:', payment.NextAction.requestedAction);

    if (payment.requestedFunds) {
      console.log('  Requested funds:');
      payment.requestedFunds.forEach((fund) => {
        console.log(`    ${fund.amount} ${fund.unit}`);
      });
    }

    await manager.close();
    return payment;
  } catch (error) {
    console.error('Error checking status:', error);
    await manager.close();
    throw error;
  }
}

/**
 * Example 3: Submit work result
 */
async function example3_submitResult(blockchainIdentifier: string) {
  console.log('\n Example 3: Submit Work Result\n');

  const manager = new PaymentManager(config);

  try {
    // First, check if payment is in correct state
    const payment = await manager.checkPaymentStatus(blockchainIdentifier);

    if (payment.onChainState !== 'FundsLocked') {
      console.log('WARNING  Payment not in FundsLocked state. Current state:', payment.onChainState);
      console.log('   Cannot submit result yet. Wait for buyer to pay.');
      await manager.close();
      return;
    }

    // Submit result
    const result = {
      status: 'completed',
      analysis: {
        conversion_rate: 0.045,
        retention_rate: 0.78,
        trends: ['increasing_mobile', 'weekend_spike'],
      },
      timestamp: new Date().toISOString(),
    };

    const updated = await manager.submitResult(
      blockchainIdentifier,
      JSON.stringify(result)
    );

    console.log('OK Result submitted:');
    console.log('  Result hash:', updated.NextAction.resultHash || updated.resultHash);
    console.log('  Next action:', updated.NextAction.requestedAction);
    console.log('  Unlock time:', new Date(updated.unlockTime).toLocaleString());

    await manager.close();
    return updated;
  } catch (error) {
    console.error('Error submitting result:', error);
    await manager.close();
    throw error;
  }
}

/**
 * Example 4: Monitor payments with events
 */
async function example4_monitorPayments() {
  console.log('\n Example 4: Monitor Payments with Events\n');

  const manager = new PaymentManager(config);

  // Set up event listeners
  manager.on('payment:created', (payment) => {
    console.log('🆕 Payment created:', payment.blockchainIdentifier);
  });

  manager.on('payment:state_changed', (event) => {
    console.log('🔄 State changed:', {
      id: event.blockchainIdentifier,
      from: event.previousState,
      to: event.newState,
    });
  });

  manager.on('payment:funds_locked', (payment) => {
    console.log('PAYMENT Funds locked! Start work for:', payment.blockchainIdentifier);

    // In a real scenario, you would trigger your work here
    // For example:
    // await executeWork(payment);
  });

  manager.on('payment:result_submitted', (data) => {
    console.log('📤 Result submitted:', {
      id: data.blockchainIdentifier,
      hash: data.resultHash,
    });
  });

  manager.on('payment:completed', (payment) => {
    console.log('SUCCESS Payment completed:', payment.blockchainIdentifier);
  });

  manager.on('payment:monitor_error', (data) => {
    console.error('ERROR Monitoring error:', data);
  });

  // Start monitoring (polls every 30 seconds)
  manager.startStatusMonitoring(30000);

  console.log('OK Monitoring started (30s intervals)');
  console.log('  Listening for payment events...');
  console.log('  Press Ctrl+C to stop\n');

  // Keep running
  await new Promise((resolve) => {
    process.on('SIGINT', async () => {
      console.log('\nStopping monitoring...');
      await manager.close();
      resolve(null);
    });
  });
}

/**
 * Example 5: Get wallet balance
 */
async function example5_getBalance() {
  console.log('\n Example 5: Get Wallet Balance\n');

  const manager = new PaymentManager(config);

  try {
    const balance = await manager.getWalletBalance();

    console.log('OK Wallet balance:');
    console.log('  ADA:', balance.ada, 'lovelace');

    // Convert lovelace to ADA
    const adaAmount = parseInt(balance.ada) / 1_000_000;
    console.log('  ADA:', adaAmount.toFixed(6), 'ADA');

    if (Object.keys(balance.tokens).length > 0) {
      console.log('  Tokens:');
      Object.entries(balance.tokens).forEach(([token, amount]) => {
        console.log(`    ${token}: ${amount}`);
      });
    } else {
      console.log('  Tokens: None');
    }

    await manager.close();
    return balance;
  } catch (error) {
    console.error('Error getting balance:', error);
    await manager.close();
    throw error;
  }
}

/**
 * Example 6: List payment history
 */
async function example6_listPayments() {
  console.log('\n Example 6: List Payment History\n');

  const manager = new PaymentManager(config);

  try {
    const { payments, nextCursorId } = await manager.listPayments({
      limit: 10,
    });

    console.log(`OK Found ${payments.length} payment(s):\n`);

    payments.forEach((payment, index) => {
      console.log(`${index + 1}. ${payment.blockchainIdentifier}`);
      console.log(`   State: ${payment.onChainState || 'Pending'}`);
      console.log(`   Created: ${new Date(payment.payByTime).toLocaleDateString()}`);
      console.log('');
    });

    if (nextCursorId) {
      console.log('📄 More pages available. Use cursorId:', nextCursorId);
    }

    await manager.close();
    return { payments, nextCursorId };
  } catch (error) {
    console.error('Error listing payments:', error);
    await manager.close();
    throw error;
  }
}

/**
 * Example 7: Full workflow (create -> monitor -> submit)
 */
async function example7_fullWorkflow() {
  console.log('\n Example 7: Full Payment Workflow\n');

  const manager = new PaymentManager(config);

  try {
    // Step 1: Create payment
    console.log('Step 1: Creating payment request...');
    const payment = await manager.createPaymentRequest({
      identifierFromPurchaser: 'workflow' + Date.now().toString(36),
      inputData: { task: 'demo_workflow' },
    });

    console.log('OK Payment created:', payment.blockchainIdentifier);

    // Step 2: Set up monitoring
    console.log('\nStep 2: Setting up event listeners...');

    manager.on('payment:funds_locked', async (lockedPayment) => {
      console.log('\nPAYMENT Payment received! Executing work...');

      // Simulate work
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log('OK Work completed. Submitting result...');

      // Submit result
      await manager.submitResult(
        lockedPayment.blockchainIdentifier,
        JSON.stringify({ result: 'success', timestamp: Date.now() })
      );

      console.log('OK Result submitted. Waiting for unlock...');
    });

    manager.on('payment:completed', (completedPayment) => {
      console.log('\nSUCCESS Payment completed!');
      console.log('   Funds unlocked and withdrawn');
      console.log('   Workflow complete!');
    });

    // Step 3: Start monitoring
    console.log('OK Event listeners ready');
    console.log('\nStep 3: Starting payment monitor...');
    manager.startStatusMonitoring(10000); // Poll every 10 seconds

    console.log('OK Monitoring started');
    console.log('\n⏳ Waiting for buyer to pay...');
    console.log('   Blockchain ID:', payment.blockchainIdentifier);
    console.log('   Pay by:', new Date(payment.payByTime).toLocaleString());
    console.log('\n   Press Ctrl+C to stop\n');

    // Keep running
    await new Promise((resolve) => {
      process.on('SIGINT', async () => {
        console.log('\nStopping workflow...');
        await manager.close();
        resolve(null);
      });
    });
  } catch (error) {
    console.error('Error in workflow:', error);
    await manager.close();
    throw error;
  }
}

/**
 * Run all examples (except monitoring which runs indefinitely)
 */
async function runExamples() {
  console.log('═══════════════════════════════════════════');
  console.log('  Masumi PaymentManager Examples');
  console.log('═══════════════════════════════════════════');

  // Check if API key is configured
  if (!process.env.MASUMI_PAYMENT_API_KEY) {
    console.log('\nWARNING  MASUMI_PAYMENT_API_KEY not set!');
    console.log('   Set it in .env file or export it:');
    console.log('   export MASUMI_PAYMENT_API_KEY=your_key_here\n');
    console.log('   Examples will fail without valid credentials.\n');
  }

  try {
    // await example1_createPayment();
    // await example2_checkStatus('payment_xyz...');
    // await example3_submitResult('payment_xyz...');
    // await example4_monitorPayments(); // Runs indefinitely
    await example5_getBalance();
    await example6_listPayments();
    // await example7_fullWorkflow(); // Runs indefinitely

    console.log('\n═══════════════════════════════════════════');
    console.log('OK Examples completed!');
    console.log('═══════════════════════════════════════════\n');
  } catch (error) {
    console.error('\nERROR Error running examples:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  runExamples().catch(console.error);
}

export {
  example1_createPayment,
  example2_checkStatus,
  example3_submitResult,
  example4_monitorPayments,
  example5_getBalance,
  example6_listPayments,
  example7_fullWorkflow,
};
