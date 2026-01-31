/**
 * Masumi Plugin for OpenClaw
 *
 * Enable your AI agent to accept blockchain payments in minutes
 *
 * @packageDocumentation
 */

// Managers
export { PaymentManager } from './managers/payment';
export { RegistryManager } from './managers/registry';

// Services
export { AutoProvisionService } from './services/auto-provision';

// Utilities - Wallet
export {
  generateWallet,
  restoreWallet,
} from './utils/wallet-generator';

// Utilities - Credentials
export {
  saveCredentials,
  loadCredentials,
  credentialsExist,
  deleteCredentials,
  listAllCredentials,
} from './utils/credential-store';

// Utilities - Encryption
export {
  encrypt,
  decrypt,
} from './utils/encryption';

// Utilities - Hashing
export {
  createMasumiInputHash,
  createMasumiOutputHash,
  generateRandomIdentifier,
} from './utils/hashing';

// API Client
export { ApiClient, ApiError } from './utils/api-client';

// Tools
export * from './tools';

// Types - Re-export main types
export type { Network, MasumiPluginConfig, PricingTier } from './types/config';
