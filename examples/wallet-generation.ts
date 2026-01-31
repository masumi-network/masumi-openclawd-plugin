/**
 * Example: Wallet Generation for Masumi Plugin
 *
 * This example demonstrates how to:
 * 1. Generate a new Cardano wallet
 * 2. Restore a wallet from mnemonic
 * 3. Store credentials securely
 * 4. Load credentials
 */

import { generateWallet, restoreWallet, validateMnemonic } from '../src/utils/wallet-generator';
import {
  saveCredentials,
  loadCredentials,
  credentialsExist,
  listAllCredentials,
} from '../src/utils/credential-store';
import { Network } from '../src/types/config';

async function example1_generateNewWallet() {
  console.log('\n📝 Example 1: Generate New Wallet\n');

  // Generate a new wallet for Preprod network
  const wallet = await generateWallet('Preprod');

  console.log('✓ Wallet Generated:');
  console.log(`  Address: ${wallet.address}`);
  console.log(`  VKey: ${wallet.vkey}`);
  console.log(`  Network: ${wallet.network}`);
  console.log(`  Mnemonic: ${wallet.mnemonic}`);
  console.log('\n⚠️  IMPORTANT: Backup your mnemonic securely!');

  return wallet;
}

async function example2_restoreWallet() {
  console.log('\n📝 Example 2: Restore Wallet from Mnemonic\n');

  // Example mnemonic (24 words) - DO NOT USE THIS IN PRODUCTION!
  const exampleMnemonic =
    'abandon abandon abandon abandon abandon abandon abandon abandon ' +
    'abandon abandon abandon abandon abandon abandon abandon abandon ' +
    'abandon abandon abandon abandon abandon abandon abandon art';

  // Restore wallet
  const wallet = await restoreWallet(exampleMnemonic, 'Preprod');

  console.log('✓ Wallet Restored:');
  console.log(`  Address: ${wallet.address}`);
  console.log(`  VKey: ${wallet.vkey}`);

  return wallet;
}

async function example3_validateMnemonic() {
  console.log('\n📝 Example 3: Validate Mnemonic\n');

  const validMnemonic =
    'abandon abandon abandon abandon abandon abandon abandon abandon ' +
    'abandon abandon abandon abandon abandon abandon abandon abandon ' +
    'abandon abandon abandon abandon abandon abandon abandon art';

  const invalidMnemonic = 'this is not a valid mnemonic phrase';

  console.log(`Valid mnemonic: ${validateMnemonic(validMnemonic)}`);
  console.log(`Invalid mnemonic: ${validateMnemonic(invalidMnemonic)}`);
}

async function example4_storeCredentials() {
  console.log('\n📝 Example 4: Store Credentials Securely\n');

  // Generate a wallet
  const wallet = await generateWallet('Preprod');

  // Store credentials (mnemonic will be encrypted)
  const path = await saveCredentials({
    agentIdentifier: 'agent_example_123',
    network: 'Preprod',
    walletAddress: wallet.address,
    walletVkey: wallet.vkey,
    mnemonic: wallet.mnemonic,
    apiKey: 'example_api_key',
    registryUrl: 'https://sokosumi.com/agents/agent_example_123',
  });

  console.log(`✓ Credentials saved to: ${path}`);
  console.log('  Mnemonic encrypted: ✓');
  console.log('  File permissions: 600 (owner only)');

  return path;
}

async function example5_loadCredentials() {
  console.log('\n📝 Example 5: Load Credentials\n');

  // Check if credentials exist
  const exists = await credentialsExist('agent_example_123', 'Preprod');

  if (!exists) {
    console.log('⚠️  Credentials not found. Run example 4 first.');
    return;
  }

  // Load credentials (mnemonic will be decrypted)
  const creds = await loadCredentials('agent_example_123', 'Preprod');

  console.log('✓ Credentials loaded:');
  console.log(`  Agent ID: ${creds.agentIdentifier}`);
  console.log(`  Address: ${creds.walletAddress}`);
  console.log(`  VKey: ${creds.walletVkey}`);
  console.log(`  Network: ${creds.network}`);
  console.log(`  Mnemonic: ${creds.mnemonic.slice(0, 20)}... (decrypted)`);
  console.log(`  Created: ${creds.createdAt}`);
}

async function example6_listAllCredentials() {
  console.log('\n📝 Example 6: List All Stored Credentials\n');

  const allCreds = await listAllCredentials();

  console.log(`Found ${allCreds.length} stored credential(s):`);

  allCreds.forEach((cred, index) => {
    console.log(`  ${index + 1}. ${cred.agentIdentifier} (${cred.network})`);
  });
}

async function example7_autoProvision() {
  console.log('\n📝 Example 7: Full Auto-Provision Flow\n');

  const { AutoProvisionService } = await import('../src/services/auto-provision');

  const config = {
    network: 'Preprod' as Network,
    paymentServiceUrl: 'https://payment.masumi.network/api/v1',
    autoProvision: true,
    agentName: 'MyTestAgent',
    pricingTier: 'basic' as const,
  };

  const service = new AutoProvisionService(config);

  // Check if already provisioned
  const isProvisioned = await service.isProvisioned();
  console.log(`Already provisioned: ${isProvisioned}`);

  if (!isProvisioned) {
    console.log('\nProvisioning new agent...');

    // Note: This will fail at the registry step without valid API credentials
    // But it will successfully generate the wallet
    try {
      const result = await service.provision({
        agentName: 'MyTestAgent',
        pricingTier: 'basic',
      });

      console.log('\n✓ Provision Complete:');
      console.log(`  Agent ID: ${result.agentIdentifier}`);
      console.log(`  Wallet: ${result.walletAddress}`);
      console.log(`  Registry: ${result.registryUrl}`);
      console.log(`  Credentials: ${result.credentialsPath}`);
    } catch (error) {
      console.error('⚠️  Provision failed (expected without API keys):', error);
      console.log('\nℹ️  Wallet generation works, but registry registration requires:');
      console.log('  1. Valid Masumi API key');
      console.log('  2. Network connectivity');
      console.log('  3. Registry service access');
    }
  }
}

async function runAllExamples() {
  console.log('═══════════════════════════════════════════');
  console.log('  Masumi Wallet Generation Examples');
  console.log('═══════════════════════════════════════════');

  try {
    await example1_generateNewWallet();
    await example2_restoreWallet();
    await example3_validateMnemonic();
    await example4_storeCredentials();
    await example5_loadCredentials();
    await example6_listAllCredentials();
    await example7_autoProvision();

    console.log('\n═══════════════════════════════════════════');
    console.log('✓ All examples completed!');
    console.log('═══════════════════════════════════════════\n');
  } catch (error) {
    console.error('\n❌ Error running examples:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}

export {
  example1_generateNewWallet,
  example2_restoreWallet,
  example3_validateMnemonic,
  example4_storeCredentials,
  example5_loadCredentials,
  example6_listAllCredentials,
  example7_autoProvision,
};
