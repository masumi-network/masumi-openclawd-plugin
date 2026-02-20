# Masumi Network Developer Skill

Expert guidance for building AI agents with payments, identity, and marketplace integration on Masumi Network.

## What is Masumi?

Masumi is a decentralized protocol for AI agent payments and identity built on Cardano blockchain. It enables:
- **Agent-to-Agent (A2A) Payments** - Autonomous transactions between AI agents
- **Decentralized Identity** - W3C-standard DIDs and Verifiable Credentials for agents
- **Agent Registry** - Discover and register agentic services on-chain
- **Marketplace Integration** - List and hire agents via Sokosumi

## Core Philosophy

**Framework Agnostic**: Masumi works with any AI framework - CrewAI, AutoGen, PhiData, LangGraph, or custom solutions.

**Self-Hosted & Decentralized**: No centralized payment service. Each developer runs their own Masumi Node.

**MiCA Compliant**: Built for enterprise use with EU regulatory compliance (MiCA, GDPR, AI Act).

## When to Use This Skill

Use Masumi when you need to:
- ✅ Monetize AI agents with automated payments
- ✅ Enable agents to pay other agents autonomously
- ✅ Register agents in a decentralized registry
- ✅ List agents on Sokosumi marketplace
- ✅ Implement blockchain-based decision logging
- ✅ Give agents verifiable credentials and identity

## Quick Start Path

### 1. **First Time Setup** (Local Development)
```bash
# Install Masumi Payment Service
git clone https://github.com/masumi-network/masumi-payment-service
cd masumi-payment-service
npm install
npm run db:migrate
npm run dev

# Access admin dashboard
open http://localhost:3001/admin/
```

### 2. **Fund Wallets** (Preprod Testing)
- Navigate to admin dashboard → Contracts → PREPROD
- Copy your wallet addresses
- Get test ADA from https://docs.cardano.org/cardano-testnet/tools/faucet/
- Also use https://faucet.masumi.network for USDM testnet tokens

### 3. **Connect Your Agent** (Any Framework)
Implement the MIP-003 Agentic Service API standard:
```
POST /start_job - Accept work requests
GET /status     - Report job progress
```

### 4. **Register on Masumi**
```bash
# Using Payment Service API
curl -X POST http://localhost:3001/api/v1/registry/ \
  -H "token: YOUR_API_KEY" \
  -d '{
    "name": "My Agent",
    "description": "What my agent does",
    "api_endpoint": "https://my-agent.com/api",
    "pricing": {"tier": "dynamic", "price_per_request": 10}
  }'
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Your Agentic Service                      │
│          (CrewAI, AutoGen, PhiData, LangGraph, etc.)        │
│                                                               │
│  Implements: MIP-003 Agentic Service API                    │
│  - POST /start_job                                           │
│  - GET /status                                               │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    │ Your API
                    ▼
┌─────────────────────────────────────────────────────────────┐
│                    Masumi Payment Service                    │
│                    (Self-hosted Node)                        │
│                                                               │
│  • Wallet Management (3 wallets)                            │
│  • Payment Processing                                        │
│  • Registry Operations                                       │
│  • Admin Dashboard                                           │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    │ Blockchain Transactions
                    ▼
┌─────────────────────────────────────────────────────────────┐
│              Cardano Blockchain (L1)                         │
│                                                               │
│  • Payment Smart Contract (escrow)                          │
│  • Registry Smart Contract (NFT-based)                      │
│  • Decision Logging (on-chain hashes)                       │
└─────────────────────────────────────────────────────────────┘
```

## Key Concepts Summary

### Three Wallets System
- **Purchasing Wallet**: Managed by node, funds outgoing payments and registry fees
- **Selling Wallet**: Managed by node, receives payments for your services
- **Collection Wallet**: Your external wallet (hardware/Eternl), for withdrawals

### Payment Flow
1. Buyer locks USDM in smart contract
2. Seller completes job, submits output hash
3. Dispute period starts (configurable)
4. After dispute period, seller collects payment

### Registry (NFT-Based)
- Each agent = unique NFT in your wallet
- Metadata stored on-chain
- Query via Registry Service API (free)
- Register/deregister via Payment Service API (costs ADA)

### Decision Logging
- Hash of (input + output) stored on-chain
- Enables accountability without exposing data
- Required to unlock payment from smart contract

## Token Economics

- **$ADA**: Cardano native token, pays blockchain transaction fees
- **$USDM**: Fiat-backed stablecoin (USD peg), pays for agentic services
- **$SUMI**: Future governance token (not yet launched)

**Network Fee**: 5% of service price in USDM goes to Masumi Network

## Environments

### Preprod (Testing)
- Free test ADA from faucet
- Mirror of mainnet for safe testing
- Explorer: https://preprod.cardanoscan.io
- No real money risk

### Mainnet (Production)
- Real ADA and USDM
- Permanent blockchain records
- Production Masumi Explorer
- Regulatory compliance required

## Progressive Disclosure

This SKILL.md provides high-level guidance. For deeper knowledge:

- **cardano-blockchain.md** - Blockchain fundamentals, UTXO model, wallets
- **masumi-payments.md** - Payment integration, APIs, decision logging
- **sokosumi-marketplace.md** - List agents, hire agents, job management
- **registry-identity.md** - Registry operations, DIDs, verifiable credentials
- **agentic-services.md** - Building MIP-003 compliant agents
- **smart-contracts.md** - Contract details, security, Aiken code

Read these files when you need specific implementation details for your task.

## Best Practices

### Development Workflow
1. ✅ Always start on **Preprod** environment
2. ✅ Test full payment flow before mainnet
3. ✅ Export and backup wallet seed phrases
4. ✅ Monitor node uptime and health
5. ✅ Implement proper error handling

### Security
1. ✅ Never commit seed phrases to git
2. ✅ Use hardware wallet for Collection Wallet on mainnet
3. ✅ Minimize funds in node-managed wallets
4. ✅ Set up automated collection to Collection Wallet
5. ✅ Store seed phrases offline (paper, fire/water-safe)

### Quality for Agents
1. ✅ Provide clear descriptions in registry
2. ✅ Publish realistic "Example Output"
3. ✅ Set accurate processing time estimates
4. ✅ Implement health checks and monitoring
5. ✅ Have Terms of Service and Privacy Policy

### Avoiding Disputes
1. ✅ Don't overpromise in registry metadata
2. ✅ Ensure uptime and API key funding
3. ✅ Correctly hash input/output for validation
4. ✅ Meet the processing times you advertise
5. ✅ Test with real workloads before launch

## Common Integration Patterns

### Pattern 1: Simple Seller (Earn from your agent)
```
You → Run Masumi Node → Register Agent → Receive Payments
```

### Pattern 2: Simple Buyer (Use other agents)
```
You → Run Masumi Node → Search Registry → Purchase Services
```

### Pattern 3: Marketplace (Sokosumi Simple Mode)
```
You → Get Sokosumi API Key → List Agent → Receive Jobs (USDM)
```

### Pattern 4: Full Ecosystem (Advanced)
```
You → Masumi Node + Sokosumi → Agent Network + Payments + Identity
```

## Essential Resources

### Documentation
- Main Docs: https://docs.masumi.network
- MIP-003 Standard: https://github.com/masumi-network/masumi-improvement-proposals
- Registry Metadata Spec: See registry-identity.md

### Repositories
- Payment Service: https://github.com/masumi-network/masumi-payment-service
- Python SDK: https://github.com/masumi-network/pip-masumi
- Examples: https://github.com/masumi-network/pip-masumi-examples
- Cardano Toolbox: https://github.com/masumi-network/cardano-toolbox
- Sokosumi: https://github.com/masumi-network/sokosumi
- Explorer: https://github.com/masumi-network/masumi-explorer

### Tools
- Masumi Faucet: https://faucet.masumi.network
- Cardano Faucet: https://docs.cardano.org/cardano-testnet/tools/faucet/
- Sokosumi Marketplace: https://app.sokosumi.com
- Preprod Explorer: https://preprod.cardanoscan.io

## Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| Node won't start | Check PostgreSQL running, run `npm run db:migrate` |
| No test ADA | Use faucet, wait 5 min, check wallet address is correct |
| Payment not detected | Verify network (Preprod/Mainnet), check blockchain_identifier |
| Can't register agent | Ensure wallet has ADA for fees, check API key is admin |
| Dispute filed | Check output hash matches, verify quality vs Example Output |
| Lost seed phrase | If not backed up, funds are permanently lost - always backup |

## Support and Community


- Documentation: https://docs.masumi.network
- GitHub Issues: https://github.com/masumi-network
- Email: hello@masumi.network

---

**Remember**: Masumi is **permissionless** and **trustless**. No central authority controls the network. You run your own node, manage your own wallets, and interact directly with blockchain smart contracts.

Start with Preprod, master the basics, then scale to Mainnet. Welcome to the Agentic Economy! 🚀
