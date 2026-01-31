import { EventEmitter } from 'events';
import { ApiClient } from '../utils/api-client';
import type { Network } from '../types/config';

/**
 * Agent capability definition
 */
export interface AgentCapability {
  name: string;
  version: string;
  description?: string;
}

/**
 * Agent author information
 */
export interface AgentAuthor {
  name: string;
  contactEmail?: string;
  website?: string;
}

/**
 * Pricing configuration
 */
export interface AgentPricing {
  pricingType: 'Fixed' | 'Variable' | 'Free';
  amounts?: Array<{
    amount: string; // in lovelace
    unit: string;
  }>;
  description?: string;
}

/**
 * Agent registration parameters
 */
export interface RegisterAgentParams {
  network: Network;
  name: string;
  description: string;
  apiBaseUrl: string;
  Capability: AgentCapability;
  Author: AgentAuthor;
  Pricing: AgentPricing;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Registered agent response
 */
export interface RegisteredAgent {
  agentIdentifier: string;
  state: 'Pending' | 'Active' | 'Suspended' | 'Inactive';
  network: Network;
  name: string;
  description: string;
  apiBaseUrl: string;
  Capability: AgentCapability;
  Author: AgentAuthor;
  Pricing: AgentPricing;
  tags?: string[];
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Agent search/filter options
 */
export interface AgentSearchOptions {
  network?: Network;
  capability?: string;
  tags?: string[];
  pricingType?: 'Fixed' | 'Variable' | 'Free';
  state?: 'Pending' | 'Active' | 'Suspended' | 'Inactive';
  limit?: number;
  offset?: number;
}

/**
 * Agent update parameters
 */
export interface UpdateAgentParams {
  agentIdentifier: string;
  network: Network;
  description?: string;
  apiBaseUrl?: string;
  Capability?: AgentCapability;
  Pricing?: AgentPricing;
  tags?: string[];
  metadata?: Record<string, unknown>;
  state?: 'Active' | 'Inactive';
}

/**
 * RegistryManager configuration
 */
export interface RegistryManagerConfig {
  network: Network;
  registryServiceUrl?: string;
  registryApiKey: string;
}

/**
 * RegistryManager Events
 */
export interface RegistryManagerEvents {
  'agent:registered': (agent: RegisteredAgent) => void;
  'agent:updated': (agent: RegisteredAgent) => void;
  'agent:state_changed': (data: { agentIdentifier: string; previousState: string; newState: string }) => void;
  'registry:error': (error: Error) => void;
}

/**
 * RegistryManager - Handles agent registration and discovery on Masumi network
 *
 * Features:
 * - Register agents on Masumi registry
 * - Get agent details
 * - Search and discover agents
 * - Update agent metadata
 * - Event-driven architecture
 *
 * @example
 * ```typescript
 * const registry = new RegistryManager({
 *   network: 'Preprod',
 *   registryApiKey: process.env.MASUMI_PAYMENT_API_KEY,
 * });
 *
 * // Register agent
 * const agent = await registry.registerAgent({
 *   network: 'Preprod',
 *   name: 'MyAgent',
 *   description: 'AI agent for data analysis',
 *   apiBaseUrl: 'https://myagent.com',
 *   Capability: { name: 'general-purpose', version: '1.0.0' },
 *   Author: { name: 'Agent Team', contactEmail: 'team@example.com' },
 *   Pricing: { pricingType: 'Fixed', amounts: [{ amount: '1000000', unit: 'lovelace' }] },
 * });
 *
 * console.log('Agent registered:', agent.agentIdentifier);
 * ```
 */
export class RegistryManager extends EventEmitter {
  private config: RegistryManagerConfig;
  private client: ApiClient;
  private registeredAgents: Map<string, RegisteredAgent> = new Map();

  constructor(config: RegistryManagerConfig) {
    super();

    // Set default registry service URL if not provided
    const registryServiceUrl = config.registryServiceUrl || 'https://payment.masumi.network/api/v1';

    this.config = {
      ...config,
      registryServiceUrl,
    };

    // Initialize API client
    this.client = new ApiClient({
      baseUrl: registryServiceUrl,
      apiKey: config.registryApiKey,
      additionalHeaders: {
        'token': config.registryApiKey,
      },
    });
  }

  /**
   * Register a new agent on the Masumi network
   *
   * @param params - Agent registration parameters
   * @returns Registered agent details including agentIdentifier
   *
   * @example
   * ```typescript
   * const agent = await registry.registerAgent({
   *   network: 'Preprod',
   *   name: 'DataAnalysisAgent',
   *   description: 'AI agent specialized in data analysis',
   *   apiBaseUrl: 'https://my-agent-api.com',
   *   Capability: {
   *     name: 'data-analysis',
   *     version: '1.0.0',
   *   },
   *   Author: {
   *     name: 'AI Team',
   *     contactEmail: 'team@example.com',
   *   },
   *   Pricing: {
   *     pricingType: 'Fixed',
   *     amounts: [{ amount: '1000000', unit: 'lovelace' }],
   *   },
   * });
   * ```
   */
  async registerAgent(params: RegisterAgentParams): Promise<RegisteredAgent> {
    try {
      const response = await this.client.post<{ data: RegisteredAgent }>('/registry', params);

      const agent = response.data;

      // Store in local cache
      this.registeredAgents.set(agent.agentIdentifier, agent);

      // Emit event
      this.emit('agent:registered', agent);

      return agent;
    } catch (error) {
      this.emit('registry:error', error as Error);
      throw error;
    }
  }

  /**
   * Get details of a specific agent
   *
   * @param agentIdentifier - The agent identifier
   * @param network - Network the agent is on (Preprod or Mainnet)
   * @returns Agent details
   *
   * @example
   * ```typescript
   * const agent = await registry.getAgent('agent_abc123xyz', 'Preprod');
   * console.log('Agent state:', agent.state);
   * ```
   */
  async getAgent(agentIdentifier: string, network: Network): Promise<RegisteredAgent> {
    try {
      const response = await this.client.get<{ data: RegisteredAgent }>(
        `/registry/${agentIdentifier}`,
        { network }
      );

      const agent = response.data;

      // Update local cache
      this.registeredAgents.set(agent.agentIdentifier, agent);

      return agent;
    } catch (error) {
      this.emit('registry:error', error as Error);
      throw error;
    }
  }

  /**
   * Search for agents on the network
   *
   * @param options - Search filters and pagination
   * @returns List of matching agents
   *
   * @example
   * ```typescript
   * // Search for data analysis agents
   * const agents = await registry.searchAgents({
   *   network: 'Preprod',
   *   capability: 'data-analysis',
   *   state: 'Active',
   *   limit: 10,
   * });
   *
   * agents.forEach(agent => {
   *   console.log(`${agent.name}: ${agent.description}`);
   * });
   * ```
   */
  async searchAgents(options: AgentSearchOptions = {}): Promise<RegisteredAgent[]> {
    try {
      const queryParams: Record<string, string> = {};

      if (options.network) queryParams.network = options.network;
      if (options.capability) queryParams.capability = options.capability;
      if (options.pricingType) queryParams.pricingType = options.pricingType;
      if (options.state) queryParams.state = options.state;
      if (options.limit) queryParams.limit = options.limit.toString();
      if (options.offset) queryParams.offset = options.offset.toString();
      if (options.tags) queryParams.tags = options.tags.join(',');

      const response = await this.client.get<{ data: RegisteredAgent[] }>(
        '/registry',
        queryParams
      );

      return response.data;
    } catch (error) {
      this.emit('registry:error', error as Error);
      throw error;
    }
  }

  /**
   * List all agents (paginated)
   *
   * @param network - Network to filter by
   * @param limit - Maximum number of agents to return
   * @param offset - Offset for pagination
   * @returns List of agents
   *
   * @example
   * ```typescript
   * const agents = await registry.listAgents('Preprod', 20, 0);
   * console.log(`Found ${agents.length} agents`);
   * ```
   */
  async listAgents(network: Network, limit = 10, offset = 0): Promise<RegisteredAgent[]> {
    return this.searchAgents({ network, limit, offset });
  }

  /**
   * Update agent metadata
   *
   * @param params - Update parameters
   * @returns Updated agent details
   *
   * @example
   * ```typescript
   * const updatedAgent = await registry.updateAgent({
   *   agentIdentifier: 'agent_abc123xyz',
   *   network: 'Preprod',
   *   description: 'Updated description',
   *   Pricing: {
   *     pricingType: 'Fixed',
   *     amounts: [{ amount: '2000000', unit: 'lovelace' }],
   *   },
   * });
   * ```
   */
  async updateAgent(params: UpdateAgentParams): Promise<RegisteredAgent> {
    try {
      const previousAgent = this.registeredAgents.get(params.agentIdentifier);

      const response = await this.client.patch<{ data: RegisteredAgent }>(
        `/registry/${params.agentIdentifier}`,
        {
          network: params.network,
          ...(params.description && { description: params.description }),
          ...(params.apiBaseUrl && { apiBaseUrl: params.apiBaseUrl }),
          ...(params.Capability && { Capability: params.Capability }),
          ...(params.Pricing && { Pricing: params.Pricing }),
          ...(params.tags && { tags: params.tags }),
          ...(params.metadata && { metadata: params.metadata }),
          ...(params.state && { state: params.state }),
        }
      );

      const agent = response.data;

      // Update local cache
      this.registeredAgents.set(agent.agentIdentifier, agent);

      // Emit events
      this.emit('agent:updated', agent);

      if (previousAgent && previousAgent.state !== agent.state) {
        this.emit('agent:state_changed', {
          agentIdentifier: agent.agentIdentifier,
          previousState: previousAgent.state,
          newState: agent.state,
        });
      }

      return agent;
    } catch (error) {
      this.emit('registry:error', error as Error);
      throw error;
    }
  }

  /**
   * Activate an agent (set state to Active)
   *
   * @param agentIdentifier - The agent identifier
   * @param network - Network the agent is on
   * @returns Updated agent
   */
  async activateAgent(agentIdentifier: string, network: Network): Promise<RegisteredAgent> {
    return this.updateAgent({
      agentIdentifier,
      network,
      state: 'Active',
    });
  }

  /**
   * Deactivate an agent (set state to Inactive)
   *
   * @param agentIdentifier - The agent identifier
   * @param network - Network the agent is on
   * @returns Updated agent
   */
  async deactivateAgent(agentIdentifier: string, network: Network): Promise<RegisteredAgent> {
    return this.updateAgent({
      agentIdentifier,
      network,
      state: 'Inactive',
    });
  }

  /**
   * Get locally cached agents
   *
   * @returns Map of cached agents
   */
  getCachedAgents(): Map<string, RegisteredAgent> {
    return new Map(this.registeredAgents);
  }

  /**
   * Clear local cache
   */
  clearCache(): void {
    this.registeredAgents.clear();
  }

  /**
   * Close the registry manager and clean up resources
   */
  async close(): Promise<void> {
    this.clearCache();
    this.removeAllListeners();
  }
}
