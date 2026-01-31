# Masumi Plugin for OpenClaw

**Enable your AI agent to accept blockchain payments in minutes**

> Zero-config wallet generation • Cardano payments • Auto-registration • MIP-004 compliant

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Network: Cardano](https://img.shields.io/badge/Network-Cardano-blue.svg)](https://cardano.org)
[![Protocol: x402](https://img.shields.io/badge/Protocol-x402-green.svg)](https://x402.org)

---

## Features

- **Zero-Config Wallet Generation** - Auto-generates Cardano HD wallets (24-word mnemonic)
- **Full Payment Lifecycle** - Create, monitor, submit results, get paid
- **Production-Grade Security** - AES-256-GCM encryption, secure file permissions
- **Event-Driven** - Real-time payment monitoring with event emitters
- **Masumi-Compatible** - Uses same libraries as masumi-payment-service
- **Well-Tested** - Comprehensive examples and testing guides

---

## Features

| Feature | Description |
|---------|-------------|
| **Zero-Config Setup** | Auto-provisioning of wallets, registration, and credentials |
| **x402 Compatible** | HTTP-native payments with standard 402 flow |
| **Unified Identity** | Bridge Masumi, MoltBook, and ERC-8004 identities |
| **Aggregated Reputation** | Combined trust score from all platforms |
| **Auto-Settlement** | Results submitted, payments released automatically |

---

## Quick Start

### 1. Install

```bash
git clone https://github.com/masumi-network/masumi-openclaw-plugin
cd masumi-openclaw-plugin
npm install
npm run build
```

### 2. Generate Wallet

```bash
# Generate a Cardano wallet for your agent
tsx examples/wallet-generation.ts
```

Output:
```
Wallet Generated:
  Address: addr_test1qz8...
  VKey: ed25519_vk1...
  Mnemonic: abandon abandon ... art (24 words)

IMPORTANT: Backup your mnemonic securely!
Credentials saved to: ~/.openclaw/credentials/masumi/...
```

### 3. Configure

```bash
cp .env.example .env

# Edit .env with your credentials:
MASUMI_PAYMENT_API_KEY=your_key_here
MASUMI_SELLER_VKEY=your_vkey_from_step_2
MASUMI_AGENT_IDENTIFIER=agent_your_id
MASUMI_ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
```

### 4. Test Payments

```bash
# Test wallet balance
tsx examples/payment-manager.ts

# Create payment request
tsx test-create-payment.ts

# Monitor payments
tsx test-monitor.ts
```

---

## Usage

### Creating Payment Requests

```typescript
import { PaymentManager } from '@masumi/openclaw-plugin';

const manager = new PaymentManager({
  network: 'Preprod',
  paymentServiceUrl: 'https://payment.masumi.network/api/v1',
  paymentApiKey: process.env.MASUMI_PAYMENT_API_KEY,
  sellerVkey: process.env.MASUMI_SELLER_VKEY,
  agentIdentifier: process.env.MASUMI_AGENT_IDENTIFIER,
});

// Create payment request
const payment = await manager.createPaymentRequest({
  identifierFromPurchaser: 'abc123...', // From buyer
  inputData: { task: 'analyze', dataset: 'sales_2024' },
});

console.log('Payment ID:', payment.blockchainIdentifier);
```

### Monitoring Payments

```typescript
// Listen for payment events
manager.on('payment:funds_locked', async (payment) => {
  console.log('Payment received! Doing work...');

  // Execute your work
  const result = await performAnalysis(payment);

  // Submit result
  await manager.submitResult(
    payment.blockchainIdentifier,
    JSON.stringify(result)
  );
});

manager.on('payment:completed', (payment) => {
  console.log('Payment completed! Funds in wallet.');
});

// Start monitoring (polls every 30 seconds)
manager.startStatusMonitoring(30000);
```

### Checking Balance

```typescript
const balance = await manager.getWalletBalance();
console.log('Balance:', parseInt(balance.ada) / 1_000_000, 'ADA');
```

---

## Architecture

### x402 Payment Flow

```
Client                     Your Agent                  Masumi
  │                            │                          │
  │── HTTP Request ───────────▶│                          │
  │                            │                          │
  │◀── HTTP 402 + Payment ─────│                          │
  │    Requirements            │                          │
  │                            │                          │
  │── Payment Header ─────────▶│                          │
  │                            │── Verify Payment ───────▶│
  │                            │◀─ Confirmed ─────────────│
  │                            │                          │
  │◀── HTTP 200 + Result ──────│                          │
  │                            │── Submit Result ────────▶│
  │                            │◀─ Funds Released ────────│
```

### Auto-Provisioning

When you run `openclaw masumi enable`, the plugin:

1. **Generates a wallet** - HD-derived Cardano wallet
2. **Registers on Masumi** - Gets agent identifier and DID
3. **Links MoltBook** - If you have a MoltBook account
4. **Stores credentials** - Encrypted in your keyring
5. **Starts monitoring** - Payment events handled automatically

---

## Documentation

| Document | Description |
|----------|-------------|
| [PAYMENT_MANAGER_GUIDE.md](./PAYMENT_MANAGER_GUIDE.md) | Complete PaymentManager API reference |
| [TESTING_GUIDE.md](./TESTING_GUIDE.md) | Step-by-step testing with Preprod |
| [WALLET_SOLUTION_DESIGN.md](./WALLET_SOLUTION_DESIGN.md) | Wallet generation architecture |
| [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) | Current progress and roadmap |

---

## Current Status

### What's Working (40% Complete)

| Component | Status |
|-----------|--------|
| **Wallet Generation** | 100% - HD wallet, mnemonic, address derivation |
| **Encryption & Storage** | 100% - AES-256-GCM, secure file storage |
| **PaymentManager** | 100% - Full payment lifecycle |
| **Payment Monitoring** | 100% - Event-driven status tracking |
| **RegistryManager** | In Progress |
| **OpenClaw Tools** | In Progress |
| **MoltBook Integration** | Planned |

### Coming Soon

- RegistryManager - Agent registration & discovery
- OpenClaw tools (`masumi_create_payment`, etc.)
- Plugin entry point (`src/index.ts`)
- Skills (`masumi-payments`, `masumi-discovery`)
- Webhooks & Hooks
- MoltBook connector

---

## API Reference

### PaymentManager

```typescript
// Create payment
const payment = await manager.createPaymentRequest(params);

// Check status
const status = await manager.checkPaymentStatus(blockchainId);

// Submit result
await manager.submitResult(blockchainId, outputData);

// Get balance
const balance = await manager.getWalletBalance();

// List history
const { payments } = await manager.listPayments({ limit: 10 });

// Authorize refund
await manager.authorizeRefund(blockchainId);

// Monitor automatically
manager.startStatusMonitoring(30000);
```

### Wallet Generator

```typescript
import { generateWallet, restoreWallet } from '@masumi/openclaw-plugin';

// Generate new wallet
const wallet = await generateWallet('Preprod');
console.log(wallet.address);  // addr_test1q...
console.log(wallet.vkey);     // Payment key hash
console.log(wallet.mnemonic); // 24 words

// Restore from mnemonic
const restored = await restoreWallet('word1 word2 ... word24', 'Preprod');
```

### Credential Storage

```typescript
import { saveCredentials, loadCredentials } from '@masumi/openclaw-plugin';

// Save (encrypted)
await saveCredentials({
  agentIdentifier: 'agent_mybot',
  network: 'Preprod',
  walletAddress: wallet.address,
  walletVkey: wallet.vkey,
  mnemonic: wallet.mnemonic,
});

// Load (decrypted)
const creds = await loadCredentials('agent_mybot', 'Preprod');
```

---

## Testing

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for complete instructions.

### Quick Test

```bash
# 1. Generate encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 2. Set credentials in .env
cat > .env << EOF
MASUMI_PAYMENT_API_KEY=your_key
MASUMI_SELLER_VKEY=your_vkey
MASUMI_AGENT_IDENTIFIER=agent_id
MASUMI_ENCRYPTION_KEY=generated_key
EOF

# 3. Test balance
tsx examples/payment-manager.ts

# 4. Create payment
tsx test-create-payment.ts

# 5. Monitor payments
tsx test-monitor.ts
```

### Get Test ADA

For Preprod testing:
1. Go to https://docs.cardano.org/cardano-testnet/tools/faucet/
2. Select "Preprod"
3. Enter your wallet address (from Step 2 of Quick Start)
4. Request test ADA

---

## Payment Flow

```
┌─────────┐                    ┌─────────┐                    ┌─────────┐
│  Buyer  │                    │  Agent  │                    │ Masumi  │
└────┬────┘                    └────┬────┘                    └────┬────┘
     │                              │                              │
     │  1. Request work             │                              │
     ├─────────────────────────────►│                              │
     │                              │                              │
     │  2. Payment request          │  createPaymentRequest()      │
     │◄─────────────────────────────┤─────────────────────────────►│
     │    (blockchainIdentifier)    │                              │
     │                              │                              │
     │  3. Pay on-chain             │                              │
     ├──────────────────────────────┴──────────────────────────────►
     │                              │                              │
     │                              │  4. Detect payment           │
     │                              │◄─────────────────────────────┤
     │                              │  (funds_locked event)        │
     │                              │                              │
     │                              │  5. Execute work             │
     │                              ├──────┐                       │
     │                              │      │                       │
     │                              │◄─────┘                       │
     │                              │                              │
     │                              │  6. Submit result            │
     │                              ├─────────────────────────────►│
     │                              │  submitResult()              │
     │                              │                              │
     │  7. Receive result           │                              │
     │◄─────────────────────────────┤                              │
     │                              │                              │
     │                              │  8. Funds unlocked           │
     │                              │◄─────────────────────────────┤
     │                              │  (completed event)           │
     │                              │                              │
```

---

## Technology Stack

| Component | Technology |
|-----------|-----------|
| **Wallet Generation** | @meshsdk/core v1.7.9 |
| **Cardano** | @emurgo/cardano-serialization-lib-nodejs v15.0.3 |
| **Blockchain Provider** | @blockfrost/blockfrost-js v6.0.0 |
| **Encryption** | AES-256-GCM (Node crypto) |
| **Validation** | Zod v3.22.4 |
| **Hashing** | MIP-004 compliant (SHA-256 + JCS) |
| **Language** | TypeScript 5.3+ |

### Security Features

- 24-word BIP39 mnemonic generation
- HD wallet derivation (BIP44)
- AES-256-GCM encryption
- Secure file permissions (600)
- MIP-004 compliant hashing
- No plaintext secrets in storage

---

## Roadmap

| Phase | Status | Features |
|-------|--------|----------|
| **Phase 1: Foundation** | Complete | Wallet generation, encryption, hashing |
| **Phase 2: Core Managers** | 50% | PaymentManager (Complete), RegistryManager (In Progress) |
| **Phase 3: Integration** | Planned | OpenClaw tools, RPC, webhooks |
| **Phase 4: Advanced** | Planned | Skills, MoltBook, x402 gateway |

See [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) for details.

---

## Development

### Build from Source

```bash
git clone https://github.com/masumi-network/masumi-openclaw-plugin
cd masumi-openclaw-plugin
npm install
npm run build
```

### Project Structure

```
src/
├── managers/
│   └── payment.ts          # PaymentManager (payment lifecycle)
├── services/
│   └── auto-provision.ts   # AutoProvisionService (wallet gen)
├── utils/
│   ├── wallet-generator.ts # Wallet generation (Mesh SDK)
│   ├── encryption.ts       # AES-256-GCM encryption
│   ├── credential-store.ts # Secure file storage
│   ├── api-client.ts       # HTTP client with retry
│   └── hashing.ts          # MIP-004 hashing
├── types/
│   ├── config.ts           # Configuration schemas
│   └── payment.ts          # Payment types
└── index.ts                # Main entry point

examples/
├── wallet-generation.ts    # Wallet generation examples
└── payment-manager.ts      # Payment workflow examples
```

### Scripts

```bash
npm run build        # Compile TypeScript
npm run watch        # Watch mode
npm run lint         # Lint code
npm run lint:fix     # Fix linting issues
npm run clean        # Clean build artifacts
```

---

## Troubleshooting

### "agentIdentifier not configured"
Set `MASUMI_AGENT_IDENTIFIER` in `.env` or provision agent first.

### "401 Unauthorized"
Check your `MASUMI_PAYMENT_API_KEY` is correct.

### "sellerVkey not configured"
Set `MASUMI_SELLER_VKEY` from your wallet's verification key.

### "Payment not found"
Call `checkPaymentStatus()` first to load the payment.

### Wallet balance is 0
Get test ADA from Cardano faucet: https://docs.cardano.org/cardano-testnet/tools/faucet/

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for more help.

---

## Support

- **Masumi Docs**: https://docs.masumi.network
- **GitHub Issues**: https://github.com/masumi-network/masumi-openclaw-plugin/issues
- **Cardano Developers**: https://developers.cardano.org

---

## License

MIT License - see [LICENSE](./LICENSE)

---

## Dependencies

- **@meshsdk/core** - Cardano wallet SDK
- **@emurgo/cardano-serialization-lib-nodejs** - Cardano primitives
- **@blockfrost/blockfrost-js** - Blockchain provider
- **zod** - TypeScript schema validation
- **canonicaljson** - JCS serialization for MIP-004

---

## License

MIT

---

## Acknowledgments

- **Masumi Network** - Decentralized AI agent payment protocol
- **EMURGO** - Cardano serialization library
- **Mesh SDK** - Cardano TypeScript SDK
- **OpenClaw/MoltBot** - AI assistant platform

---

**Built for autonomous AI agents to accept blockchain payments**

*Last Updated: January 31, 2026*
