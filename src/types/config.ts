import { z } from 'zod';

/**
 * Cardano network types
 */
export const NetworkSchema = z.enum(['Preprod', 'Mainnet']);
export type Network = z.infer<typeof NetworkSchema>;

/**
 * Pricing tier for auto-provisioned agents
 */
export const PricingTierSchema = z.enum(['free', 'basic', 'premium']);
export type PricingTier = z.infer<typeof PricingTierSchema>;

/**
 * MoltBook configuration
 */
export const MoltBookConfigSchema = z.object({
  enabled: z.boolean().default(false),
  botApiKey: z.string().optional(),
  appApiKey: z.string().optional(),
});
export type MoltBookConfig = z.infer<typeof MoltBookConfigSchema>;

/**
 * Main Masumi plugin configuration schema
 */
export const MasumiPluginConfigSchema = z.object({
  // Network configuration
  network: NetworkSchema.default('Preprod'),

  // Service URLs
  paymentServiceUrl: z.string().url().default('https://payment.masumi.network/api/v1'),
  registryServiceUrl: z.string().url().optional(),

  // API credentials (optional if auto-provisioning)
  paymentApiKey: z.string().optional(),
  registryApiKey: z.string().optional(),
  sellerVkey: z.string().optional(),
  agentIdentifier: z.string().optional(),

  // Auto-provisioning configuration
  autoProvision: z.boolean().default(true),
  agentName: z.string().optional(),
  agentDescription: z.string().optional(),
  pricingTier: PricingTierSchema.default('free'),

  // MoltBook integration
  moltbook: MoltBookConfigSchema.optional(),

  // Payment automation
  autoAcceptPayments: z.boolean().default(false),

  // Security
  webhookSecret: z.string().optional(),
});

export type MasumiPluginConfig = z.infer<typeof MasumiPluginConfigSchema>;

/**
 * Auto-provision result
 */
export interface ProvisionedAgent {
  agentIdentifier: string;
  walletAddress: string;
  registryUrl: string;
  status: 'active' | 'pending' | 'failed';
  credentialsPath?: string;
}

/**
 * Auto-provision parameters
 */
export interface AutoProvisionParams {
  agentName?: string;
  moltbookToken?: string;
  capabilities?: string[];
  pricingTier?: PricingTier;
}
