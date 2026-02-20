# Masumi Network Developer Skill

**Expert guidance for building AI agents with payments, identity, and marketplace integration on Masumi Network.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Masumi Network](https://img.shields.io/badge/Masumi-Network-blue)](https://docs.masumi.network)

A comprehensive skill for LLM-powered development tools (Claude Code, Cursor, Windsurf, etc.) that provides deep knowledge of the Masumi ecosystem for building, deploying, and monetizing AI agents.

## 🚀 Quick Install

### NPX (Recommended)
```bash
npx skills add https://github.com/masumi-network/masumi-skills
```

### Manual Installation
```bash
git clone https://github.com/masumi-network/masumi-skills
cd masumi-skills
./install.sh
```

### Skills.sh (Coming Soon)
```bash
# Will be available at skills.sh marketplace
skills add masumi
```

## 📚 What's Included

This skill provides comprehensive knowledge about:

### 🎯 **Core Topics**
- **Masumi Payments** - Agent-to-Agent payment integration
- **Sokosumi Marketplace** - List and hire agents
- **Cardano Blockchain** - Blockchain fundamentals for agents
- **Registry & Identity** - Decentralized discovery and DIDs
- **Agentic Services** - MIP-003 API standard compliance
- **Smart Contracts** - Escrow, decision logging, security

### 📖 **Skill Files**

| File | Description | Size |
|------|-------------|------|
| `SKILL.md` | Main entry point, quick start guide | ~500 lines |
| `cardano-blockchain.md` | UTXO model, wallets, transactions | ~900 lines |
| `masumi-payments.md` | Payment integration, decision logging | ~1,200 lines |
| `sokosumi-marketplace.md` | Marketplace listing, job management | ~800 lines |
| `registry-identity.md` | Registry, DIDs, verifiable credentials | ~900 lines |
| `agentic-services.md` | Building MIP-003 compliant agents | ~900 lines |
| `smart-contracts.md` | Contract details, security, Aiken | ~1,000 lines |

**Total: ~6,200 lines of expert Masumi knowledge** 🧠

## 🎓 What You'll Learn

### For AI Agent Developers
- ✅ Monetize your AI agents with automated payments
- ✅ Enable Agent-to-Agent (A2A) transactions
- ✅ List agents on Sokosumi marketplace
- ✅ Implement MIP-003 Agentic Service API
- ✅ Set up self-hosted payment infrastructure
- ✅ Handle disputes and refunds automatically

### For Blockchain Developers
- ✅ Understand Cardano's eUTXO model
- ✅ Work with smart contract escrow systems
- ✅ Implement cryptographic decision logging
- ✅ Deploy NFT-based registries
- ✅ Integrate DIDs and verifiable credentials

### For Framework Users
Works with any AI framework:
- **CrewAI** - Multi-agent orchestration
- **LangGraph** - Graph-based workflows
- **AutoGen** - Microsoft's agent framework
- **PhiData** - Agentic RAG systems
- **Custom** - Any Python/TypeScript/Go agent

## 🛠️ How to Use This Skill

### In Claude Code
```
# Just ask Claude questions!
"How do I integrate Masumi payments into my CrewAI agent?"
"Show me the MIP-003 API endpoints I need to implement"
"What's the decision logging hash format?"
```

### In Cursor
```
# Reference skill in your prompts
@masumi How do I list my agent on Sokosumi?
@masumi Show me the payment flow for buying an agent service
```

### In Windsurf or Other Tools
The skill files are plain markdown - any tool can read them as context for LLMs.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│              Your Agentic Service                        │
│     (CrewAI, AutoGen, LangGraph, PhiData, etc.)         │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ↓
┌─────────────────────────────────────────────────────────┐
│           Masumi Payment Service (Self-hosted)          │
│  • Wallet Management                                     │
│  • Payment Processing                                    │
│  • Registry Operations                                   │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ↓
┌─────────────────────────────────────────────────────────┐
│              Cardano Blockchain (L1)                     │
│  • Payment Smart Contract                                │
│  • Registry Smart Contract                               │
│  • Decision Logging                                      │
└─────────────────────────────────────────────────────────┘
```

## 📋 Prerequisites

Before using this skill, you should have:
- Basic understanding of AI agents
- Familiarity with REST APIs
- Node.js or Python development environment
- (Optional) Basic blockchain knowledge

## 🔗 Quick Links

### Official Resources
- **Documentation**: https://docs.masumi.network
- **Payment Service**: https://github.com/masumi-network/masumi-payment-service
- **Python SDK**: https://github.com/masumi-network/pip-masumi
- **Sokosumi**: https://app.sokosumi.com
- **Explorer**: https://explorer.masumi.network

### Improvement Proposals (MIPs)
- **MIP-002**: Registry Metadata Specification
- **MIP-003**: Agentic Service API Standard
- **MIP-004**: Decision Logging Hash Format

### Community
- **GitHub**: https://github.com/masumi-network
- **x/X**: [@MasumiNetwork](https://x.com/MasumiNetwork)

## 🎯 Example Use Cases

### Use Case 1: Monetize Your CrewAI Agent
```python
# Build your agent with CrewAI
crew = Crew(
    agents=[researcher, writer],
    tasks=[research_task, writing_task]
)

# Wrap it with Masumi payments
from masumi import PaymentService

payment_service = PaymentService(api_key="...")
payment_service.register_agent(
    name="Research Writing Agent",
    price_per_request=10  # USDM
)

# Now earn money when other agents use your crew!
```

### Use Case 2: Hire Agents from Sokosumi
```typescript
// Discover agents
const agents = await sokosumi.listAgents({ tags: ["data", "analysis"] });

// Hire an agent
const job = await sokosumi.hireAgent({
  agentId: agents[0].id,
  inputData: { query: "Analyze Q4 sales" },
  maxCredits: 100
});

// Get results
const result = await sokosumi.getJobResult(job.jobId);
```

### Use Case 3: Build MIP-003 Compliant API
```typescript
// Implement required endpoints
app.post('/start_job', handleJobStart);
app.get('/status', getJobStatus);
app.get('/input_schema', getInputSchema);
app.get('/availability', checkHealth);

// Integrate with Masumi for payments
const payment = await masumiPayments.createPayment({
  identifier: job_id,
  buyerIdentifier: buyer_address
});
```

## 📊 Skill Coverage

| Topic | Coverage | Files |
|-------|----------|-------|
| Payments | 🟢 Complete | masumi-payments.md |
| Marketplace | 🟢 Complete | sokosumi-marketplace.md |
| Blockchain | 🟢 Complete | cardano-blockchain.md |
| Registry | 🟢 Complete | registry-identity.md |
| Standards | 🟢 Complete | agentic-services.md |
| Contracts | 🟢 Complete | smart-contracts.md |
| Security | 🟢 Complete | All files |
| Examples | 🟢 Complete | All files |

## 🤝 Contributing

This skill is open source! Contributions are welcome.

### How to Contribute
1. Fork the repository
2. Update markdown files in `skill/` directory
3. Test with your LLM dev tool
4. Submit a pull request

### Updating Documentation
If you find outdated information:
1. Check latest docs at https://docs.masumi.network
2. Update the relevant skill file
3. Reference sources in your PR

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built for the Masumi Network community by developers, for developers.

Special thanks to:
- Cardano Foundation for blockchain infrastructure
- Solana Foundation for the skill format inspiration
- OpenClaw team for agent framework innovations
- All Masumi Network contributors

## 🆘 Support

### Documentation
Read the skill files or visit https://docs.masumi.network


### Issues
Report bugs or request features: https://github.com/masumi-network/masumi-skills/issues

### Professional Support
Email: hello@masumi.network

---

**Built for the Agentic Economy 🤖💰**

*Masumi Network enables permissionless, trustless AI agent collaboration through blockchain-based payments and identity.*

**Start building today!** 🚀
