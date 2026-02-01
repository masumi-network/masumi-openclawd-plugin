/**
 * RegistryManager Examples
 *
 * This file demonstrates how to use the RegistryManager to:
 * 1. Register agents on Masumi network
 * 2. Get agent details
 * 3. Search for agents
 * 4. Update agent metadata
 * 5. Listen for registry events
 *
 * Prerequisites:
 * - Set MASUMI_PAYMENT_API_KEY in .env
 * - Set MASUMI_NETWORK in .env (Preprod or Mainnet)
 */

import { RegistryManager } from '../src/managers/registry';
import type { Network } from '../src/types/config';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  network: (process.env.MASUMI_NETWORK || 'Preprod') as Network,
  registryApiKey: process.env.MASUMI_PAYMENT_API_KEY!,
};

/**
 * Example 1: Register a new agent
 */
async function example1_registerAgent() {
  console.log('\n=== Example 1: Register Agent ===\n');

  const registry = new RegistryManager(config);

  try {
    const agent = await registry.registerAgent({
      network: config.network,
      name: 'DataAnalysisAgent',
      description: 'AI agent specialized in data analysis and visualization',
      apiBaseUrl: 'https://my-agent-api.example.com',
      Capability: {
        name: 'data-analysis',
        version: '1.0.0',
        description: 'Analyzes datasets and generates insights',
      },
      Author: {
        name: 'AI Development Team',
        contactEmail: 'team@example.com',
        website: 'https://example.com',
      },
      Pricing: {
        pricingType: 'Fixed',
        amounts: [
          {
            amount: '1000000', // 1 ADA in lovelace
            unit: 'lovelace',
          },
        ],
        description: '1 ADA per analysis request',
      },
      tags: ['data', 'analysis', 'ai', 'visualization'],
    });

    console.log('OK Agent registered successfully!');
    console.log('  Identifier:', agent.agentIdentifier);
    console.log('  State:', agent.state);
    console.log('  Network:', agent.network);
    console.log('  Name:', agent.name);

    return agent;
  } catch (error: any) {
    console.error('ERROR Registration failed:', error.message);
    throw error;
  } finally {
    await registry.close();
  }
}

/**
 * Example 2: Get agent details
 */
async function example2_getAgent(agentIdentifier: string) {
  console.log('\n=== Example 2: Get Agent Details ===\n');

  const registry = new RegistryManager(config);

  try {
    const agent = await registry.getAgent(agentIdentifier, config.network);

    console.log('OK Agent details:');
    console.log('  Name:', agent.name);
    console.log('  Description:', agent.description);
    console.log('  State:', agent.state);
    console.log('  API URL:', agent.apiBaseUrl);
    console.log('  Capability:', agent.Capability.name, 'v' + agent.Capability.version);
    console.log('  Pricing:', agent.Pricing.pricingType);

    if (agent.Pricing.amounts) {
      agent.Pricing.amounts.forEach(price => {
        console.log(`    ${parseInt(price.amount) / 1_000_000} ADA (${price.amount} ${price.unit})`);
      });
    }

    console.log('  Author:', agent.Author.name);
    if (agent.tags) {
      console.log('  Tags:', agent.tags.join(', '));
    }

    return agent;
  } catch (error: any) {
    console.error('ERROR Failed to get agent:', error.message);
    throw error;
  } finally {
    await registry.close();
  }
}

/**
 * Example 3: Search for agents
 */
async function example3_searchAgents() {
  console.log('\n=== Example 3: Search Agents ===\n');

  const registry = new RegistryManager(config);

  try {
    // Search for data analysis agents
    const agents = await registry.searchAgents({
      network: config.network,
      capability: 'data-analysis',
      state: 'Active',
      limit: 10,
    });

    console.log(`OK Found ${agents.length} agent(s):\n`);

    agents.forEach((agent, index) => {
      console.log(`${index + 1}. ${agent.name}`);
      console.log(`   ID: ${agent.agentIdentifier}`);
      console.log(`   ${agent.description}`);
      console.log(`   Capability: ${agent.Capability.name}`);
      console.log(`   Pricing: ${agent.Pricing.pricingType}`);
      console.log('');
    });

    return agents;
  } catch (error: any) {
    console.error('ERROR Search failed:', error.message);
    throw error;
  } finally {
    await registry.close();
  }
}

/**
 * Example 4: List all agents
 */
async function example4_listAgents() {
  console.log('\n=== Example 4: List All Agents ===\n');

  const registry = new RegistryManager(config);

  try {
    const agents = await registry.listAgents(config.network, 20);

    console.log(`OK Found ${agents.length} agent(s) on ${config.network}:\n`);

    agents.forEach((agent, index) => {
      console.log(`${index + 1}. ${agent.name} (${agent.state})`);
      console.log(`   ${agent.agentIdentifier}`);
    });

    return agents;
  } catch (error: any) {
    console.error('ERROR List failed:', error.message);
    throw error;
  } finally {
    await registry.close();
  }
}

/**
 * Example 5: Update agent metadata
 */
async function example5_updateAgent(agentIdentifier: string) {
  console.log('\n=== Example 5: Update Agent ===\n');

  const registry = new RegistryManager(config);

  try {
    const updatedAgent = await registry.updateAgent({
      agentIdentifier,
      network: config.network,
      description: 'Updated: AI agent specialized in advanced data analysis',
      Pricing: {
        pricingType: 'Fixed',
        amounts: [
          {
            amount: '2000000', // 2 ADA in lovelace
            unit: 'lovelace',
          },
        ],
        description: '2 ADA per analysis request (updated pricing)',
      },
      tags: ['data', 'analysis', 'ai', 'visualization', 'advanced'],
    });

    console.log('OK Agent updated successfully!');
    console.log('  Identifier:', updatedAgent.agentIdentifier);
    console.log('  New Description:', updatedAgent.description);
    console.log('  New Pricing:', updatedAgent.Pricing.amounts?.[0].amount, 'lovelace');
    console.log('  New Tags:', updatedAgent.tags?.join(', '));

    return updatedAgent;
  } catch (error: any) {
    console.error('ERROR Update failed:', error.message);
    throw error;
  } finally {
    await registry.close();
  }
}

/**
 * Example 6: Activate/Deactivate agent
 */
async function example6_toggleAgentState(agentIdentifier: string) {
  console.log('\n=== Example 6: Toggle Agent State ===\n');

  const registry = new RegistryManager(config);

  try {
    // Deactivate agent
    console.log('Deactivating agent...');
    let agent = await registry.deactivateAgent(agentIdentifier, config.network);
    console.log('OK Agent state:', agent.state);

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Reactivate agent
    console.log('Reactivating agent...');
    agent = await registry.activateAgent(agentIdentifier, config.network);
    console.log('OK Agent state:', agent.state);

    return agent;
  } catch (error: any) {
    console.error('ERROR State change failed:', error.message);
    throw error;
  } finally {
    await registry.close();
  }
}

/**
 * Example 7: Event-driven registry monitoring
 */
async function example7_eventDriven() {
  console.log('\n=== Example 7: Event-Driven Monitoring ===\n');

  const registry = new RegistryManager(config);

  // Set up event listeners
  registry.on('agent:registered', (agent) => {
    console.log('🆕 Agent registered:', agent.agentIdentifier);
    console.log('   Name:', agent.name);
    console.log('   State:', agent.state);
  });

  registry.on('agent:updated', (agent) => {
    console.log('🔄 Agent updated:', agent.agentIdentifier);
    console.log('   Name:', agent.name);
  });

  registry.on('agent:state_changed', (data) => {
    console.log('🔀 Agent state changed:', data.agentIdentifier);
    console.log('   From:', data.previousState);
    console.log('   To:', data.newState);
  });

  registry.on('registry:error', (error) => {
    console.error('ERROR Registry error:', error.message);
  });

  try {
    console.log('Registering agent with event monitoring...\n');

    const agent = await registry.registerAgent({
      network: config.network,
      name: 'EventDrivenAgent',
      description: 'Testing event-driven registry',
      apiBaseUrl: 'https://example.com',
      Capability: {
        name: 'general-purpose',
        version: '1.0.0',
      },
      Author: {
        name: 'Test Team',
        contactEmail: 'test@example.com',
      },
      Pricing: {
        pricingType: 'Free',
      },
    });

    console.log('\nWaiting for events...\n');
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Updating agent...\n');
    await registry.updateAgent({
      agentIdentifier: agent.agentIdentifier,
      network: config.network,
      description: 'Updated description',
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    return agent;
  } catch (error: any) {
    console.error('ERROR Event-driven test failed:', error.message);
    throw error;
  } finally {
    await registry.close();
  }
}

/**
 * Main function - Run all examples
 */
async function main() {
  console.log('RegistryManager Examples\n');
  console.log('Network:', config.network);
  console.log('API Key:', config.registryApiKey ? 'OK Set' : 'MISSING Not set');

  if (!config.registryApiKey) {
    console.error('\nERROR Error: MASUMI_PAYMENT_API_KEY not set in .env');
    console.error('Please set your API key before running these examples.\n');
    process.exit(1);
  }

  try {
    // Example 1: Register agent
    const agent = await example1_registerAgent();

    // Example 2: Get agent details
    await example2_getAgent(agent.agentIdentifier);

    // Example 3: Search agents
    await example3_searchAgents();

    // Example 4: List agents
    await example4_listAgents();

    // Example 5: Update agent
    await example5_updateAgent(agent.agentIdentifier);

    // Example 6: Toggle state
    await example6_toggleAgentState(agent.agentIdentifier);

    // Example 7: Event-driven
    await example7_eventDriven();

    console.log('\nOK All examples completed successfully!\n');
  } catch (error: any) {
    console.error('\nERROR Examples failed:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

// Export for use in other files
export {
  example1_registerAgent,
  example2_getAgent,
  example3_searchAgents,
  example4_listAgents,
  example5_updateAgent,
  example6_toggleAgentState,
  example7_eventDriven,
};
