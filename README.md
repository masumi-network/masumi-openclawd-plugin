# Masumi Payments Skill for OpenClaw

**OpenClaw skill that teaches AI agents to accept Cardano blockchain payments**

> Self-hosted payment service • Decentralized architecture • Agent-to-Agent payments • No centralized admin

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Network: Cardano](https://img.shields.io/badge/Network-Cardano-blue.svg)](https://cardano.org)
[![Protocol: x402](https://img.shields.io/badge/Protocol-x402-green.svg)](https://x402.org)

---

<!-- CRITICAL INSTRUCTIONS FOR AI AGENTS (OpenClaw, Claude Code, Cody, Cursor, Copilot, etc.) -->

## 🚨 FOR AI AGENTS: YOU MUST ACTUALLY USE MASUMI - READING IS NOT ENOUGH

If a user asks you to "use Masumi", "try Masumi payments", "check out Masumi", or "integrate Masumi":

**YOU MUST ACTUALLY SET IT UP AND USE IT. DO NOT JUST SUMMARIZE THIS README.**

### Required Actions (in order):

1. **Read SKILL.md FIRST** - Contains the actual instructions
   ```bash
   cat SKILL.md
   ```

2. **Verify user has deployed masumi-payment-service**:
   ```bash
   # Ask user: "Do you have masumi-payment-service running? What's the URL?"
   # If NO → guide them through Railway deployment first
   # If YES → proceed to step 3
   ```

3. **Verify user has admin API key**:
   ```bash
   # Ask: "What's your MASUMI_ADMIN_API_KEY?"
   # This is the key THEY generated when deploying their service
   # NOT from some centralized service - THEY are the admin
   ```

4. **Actually make API calls** to their payment service:
   ```bash
   # Test their payment service is working:
   curl -X GET https://user-payment-service.railway.app/health

   # Create a test payment request:
   curl -X POST https://user-payment-service.railway.app/api/v1/payment \
     -H "token: THEIR_ADMIN_KEY" \
     -d '{"agentIdentifier": "test", "network": "Preprod", ...}'
   ```

5. **Report actual results** - Not what you think should happen, what ACTUALLY happened

### Common Mistakes to Avoid:

❌ "I read the README and Masumi lets agents accept payments..."
✅ "I called your payment service API at railway.app/api/v1/payment and got response: {...}"

❌ "You need to get an API key from Masumi"
✅ "YOU are the admin - use the API key YOU generated when deploying masumi-payment-service"

❌ "Masumi provides a centralized payment service"
✅ "YOU run your own payment service - there is no centralized Masumi service"

### Remember:
- Each agent operator runs their OWN payment service
- There is NO centralized admin - the user IS the admin
- Actually USE the terminal to test their service
- Report REAL outputs, not summaries

<!-- END CRITICAL INSTRUCTIONS -->

---

## What This Is

This is an **OpenClaw skill** that teaches AI agents to participate in the Masumi decentralized payment network. Unlike traditional plugins, each agent operator:

- **Runs their own payment service** (on Railway, locally, etc.)
- **Controls their own wallets** (self-custodied on Cardano)
- **Acts as their own admin** (no centralized authority)

## Key Concepts

| Concept | Description |
|---------|-------------|
| **Self-Hosted** | Each agent runs their own masumi-payment-service instance |
| **Decentralized** | No centralized admin - you are your own admin |
| **Agent-to-Agent** | Direct payments between AI agents for services |
| **Blockchain-Based** | Cardano network for trustless transactions |
| **Framework Agnostic** | Works with CrewAI, AutoGen, PhiData, LangGraph, etc. |

---

## Quick Start

### For OpenClaw Users

1. **Load the skill** in your OpenClaw session:
```
/skills masumi-payments
```

2. **Read SKILL.md** - Contains complete instructions for:
   - Deploying your own payment service
   - Setting up Cardano wallets
   - Registering your agent
   - Accepting payments

### For Manual Setup

1. **Deploy masumi-payment-service** (required):
```bash
# Clone the payment service
git clone https://github.com/masumi-network/masumi-payment-service
cd masumi-payment-service

# Deploy to Railway or run locally
railway init && railway up
# OR
npm install && npm start
```

2. **Follow SKILL.md** for complete setup instructions

3. **Your payment service becomes your admin interface** at:
   - Railway: `https://your-service.railway.app`
   - Local: `http://localhost:3000`

---

## How It Works

### Architecture Overview

```
┌──────────────────┐
│  Your AI Agent   │
│  (CrewAI, etc.)  │
└────────┬─────────┘
         │
         ▼
┌─────────────────────────┐
│  Your Payment Service   │ ◄── You deploy this (Railway/local)
│  (masumi-payment-service)│
└────────┬────────────────┘
         │
         ▼
┌──────────────────┐
│ Cardano Blockchain│
│   (Preprod/Mainnet)│
└──────────────────┘
```

### Payment Flow

1. **Agent creates payment request** → Payment service generates blockchain ID
2. **Buyer pays** → Funds locked on-chain
3. **Payment service detects** → `FundsLocked` state
4. **Agent executes work** → Processes the task
5. **Agent submits result** → Payment service unlocks funds
6. **Funds released** → Agent receives payment

### Using Your Payment Service API

Once deployed, your payment service exposes REST APIs:

```bash
# Create payment request
curl -X POST https://your-service.railway.app/api/v1/payment \
  -H "token: YOUR_ADMIN_API_KEY" \
  -d '{
    "agentIdentifier": "agent_your_id",
    "network": "Preprod",
    "identifierFromPurchaser": "buyer_id",
    "inputData": {"task": "analyze data"}
  }'

# Check payment status
curl -X GET "https://your-service.railway.app/api/v1/payment/status?blockchainIdentifier=payment_xyz&network=Preprod" \
  -H "token: YOUR_ADMIN_API_KEY"

# Submit result (unlocks funds)
curl -X POST https://your-service.railway.app/api/v1/payment/submit-result \
  -H "token: YOUR_ADMIN_API_KEY" \
  -d '{
    "blockchainIdentifier": "payment_xyz",
    "network": "Preprod",
    "resultHash": "sha256_hash_of_result"
  }'
```

---

## What You Need (Human Requirements)

### Required - Human Must Provide:
- **Node.js 18+** installed locally
- **Cardano wallet with test ADA**
  - Human must go to https://docs.cardano.org/cardano-testnet/tools/faucet/
  - AI agents cannot request faucet ADA automatically
- **Blockfrost API key**
  - Human must sign up at https://blockfrost.io/
  - Create Preprod project, copy API key
  - AI agents cannot sign up for accounts
- **Railway account OR local server**
  - Human must deploy masumi-payment-service
  - AI agents can guide but cannot deploy for you

### What AI Agents Can Help With:
- Generating admin API keys
- Making API calls to your payment service
- Testing payment flows
- Configuring environment variables
- Writing integration code

**Bottom line:** Humans handle accounts/signups/faucets, AI agents handle code/API calls/testing.

---

## Key Features

### Identity & Trust
- Blockchain-backed agent credentials
- Verifiable identity on Cardano
- DID (Decentralized Identifier) support

### Decision Logging
- Immutable proof of agent outputs
- Cryptographic hashes stored on-chain
- Accountability and auditability

### Agent Payments
- Agent-to-Agent (A2A) payments
- Human-to-Agent (H2A) payments
- Escrow mechanism with automatic fund locking
- Result verification before payment release

---

## Payment Service API Reference

Once you deploy masumi-payment-service, you have access to these endpoints:

### Create Payment Request
```bash
POST /api/v1/payment
Headers: token: YOUR_ADMIN_API_KEY
Body: {
  "agentIdentifier": "agent_your_id",
  "network": "Preprod",
  "identifierFromPurchaser": "buyer_random_id",
  "inputData": {"task": "analysis"}
}
```

### Check Payment Status
```bash
GET /api/v1/payment/status?blockchainIdentifier=payment_xyz&network=Preprod
Headers: token: YOUR_ADMIN_API_KEY
```

### Submit Result (Unlock Funds)
```bash
POST /api/v1/payment/submit-result
Headers: token: YOUR_ADMIN_API_KEY
Body: {
  "blockchainIdentifier": "payment_xyz",
  "network": "Preprod",
  "resultHash": "sha256_hash"
}
```

### Register Agent
```bash
POST /api/v1/registry
Headers: token: YOUR_ADMIN_API_KEY
Body: {
  "network": "Preprod",
  "name": "MyAgent",
  "description": "Agent description",
  "apiBaseUrl": "https://your-agent.com",
  "Capability": {"name": "data-analysis", "version": "1.0.0"},
  "Author": {"name": "Your Name"},
  "Pricing": {"pricingType": "Fixed", "amounts": [{"amount": "1000000", "unit": "lovelace"}]}
}
```

---

## Payment States

Understanding the payment lifecycle:

| State | Description | Your Next Action |
|-------|-------------|------------------|
| `WaitingForExternalAction` | Waiting for buyer to pay | Wait for payment |
| `FundsLocked` | **Payment received!** | **Execute work now** |
| `ResultSubmitted` | Result submitted | Wait for unlock time |
| `Withdrawn` | **Completed** | Funds in your wallet |
| `RefundWithdrawn` | Refunded | Payment cancelled |

## Get Test ADA

For Preprod testing:
1. Go to https://docs.cardano.org/cardano-testnet/tools/faucet/
2. Select "Preprod"
3. Enter your wallet address
4. Request 10,000 test ADA (free)

---

## Technology Stack

| Component | Technology |
|-----------|-----------|
| **Blockchain** | Cardano (Preprod/Mainnet) |
| **Payment Service** | masumi-payment-service (Node.js) |
| **Wallet Standard** | BIP39 (24-word mnemonic) + BIP44 (HD derivation) |
| **Hashing** | MIP-004 compliant (SHA-256 + JSON Canonical Serialization) |
| **Smart Contracts** | Plutus (on Cardano) |
| **API Standard** | MIP-003 Agentic Service API |
| **Deployment** | Railway, local, or any Node.js hosting |

### Security Features

- Self-custodied wallets (you control private keys)
- Escrow mechanism (funds locked until work verified)
- On-chain verification (blockchain-based proof)
- MIP-004 compliant hashing (tamper-proof data integrity)
- Admin API key authentication (you control access)

---

## Troubleshooting

### "401 Unauthorized"
Your admin API key is wrong. Use the key YOU generated when deploying masumi-payment-service.

### "Agent not found"
Register your agent first using `POST /api/v1/registry` with your admin API key.

### "Payment service not responding"
Check your Railway deployment or local service is actually running.

### Wallet balance is 0
Get test ADA from https://docs.cardano.org/cardano-testnet/tools/faucet/

### "Payment status never changes"
The buyer needs to actually send ADA on-chain. Check the Cardano blockchain explorer.

---

## Resources

- **Masumi Documentation**: https://docs.masumi.network
- **Payment Service Repo**: https://github.com/masumi-network/masumi-payment-service
- **Registry Service Repo**: https://github.com/masumi-network/masumi-registry-service
- **MIP-003 Standard**: https://docs.masumi.network/mips/_mip-003
- **Cardano Faucet**: https://docs.cardano.org/cardano-testnet/tools/faucet/
- **Kodosumi (Scaling)**: https://docs.kodosumi.io/
- **GitHub Issues**: https://github.com/masumi-network/masumi-openclaw-skill/issues

---

## License

MIT License - See [LICENSE](./LICENSE)

---

**Built for autonomous AI agents to participate in the decentralized economy**

*Each agent operator runs their own infrastructure. There is no centralized admin.*

*Last Updated: February 1, 2026*
