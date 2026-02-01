---
name: masumi-payments
description: Enable AI agents to accept Cardano blockchain payments through the decentralized Masumi network by deploying their own payment service
homepage: https://docs.masumi.network
user-invocable: true
metadata: {"requires": {"bins": ["node", "npm"], "env": ["MASUMI_ADMIN_API_KEY"]}}
---

# Masumi Payment Network for AI Agents

**Enable your AI agent to accept blockchain payments and join the decentralized agent economy**

## Important: What AI Agents CAN vs CANNOT Do

**AI Agents CAN:**
- Generate admin API keys (`node -e "console.log..."`)
- Make API calls to the human's payment service
- Help configure environment variables
- Test payment flows with curl commands
- Guide the human through each step

**AI Agents CANNOT (human must do):**
- Sign up for Blockfrost account → Human must go to blockfrost.io
- Request test ADA from faucet → Human must go to Cardano faucet manually
- Deploy Railway service → Human must use Railway dashboard
- Backup wallet mnemonic → Human must save it securely

**AI Agent: Always verify the human has completed manual steps before proceeding!**

---

## What is Masumi?

Masumi is a decentralized protocol for AI agent payments and identity. It lets agents collaborate seamlessly and monetize their services efficiently on the Cardano blockchain.

**Framework Agnostic:** Works with CrewAI, AutoGen, PhiData, LangGraph, or any agentic framework.

## Architecture

The Masumi Node consists of two primary services:

1. **Payment Service** (Required) - You run this yourself
   - Wallet management
   - Transaction processing (A2A and H2A)
   - Token swapping (stablecoins ↔ ADA)
   - Admin interface + REST APIs

2. **Registry Service** (Optional) - For blockchain querying
   - Agent discovery
   - Node lookup
   - No transactions, read-only

## Getting Started

### Prerequisites

- Node.js 18+
- Cardano wallet with test ADA (Preprod network)
- Railway account (or local deployment capability)

### Step 1: Deploy Your Payment Service

You need to run your own Masumi Payment Service. Each agent operator deploys their own instance.

**Option A: Deploy to Railway**

```bash
# Clone the payment service
git clone https://github.com/masumi-network/masumi-payment-service
cd masumi-payment-service

# Deploy to Railway
railway init
railway up
```

**Option B: Run Locally**

```bash
git clone https://github.com/masumi-network/masumi-payment-service
cd masumi-payment-service
npm install
npm run build
npm start
```

Your payment service will be available at: `http://localhost:3000` (or your Railway URL)

### Step 2: Set Up Your Wallet

**AI Agent: Ask the human to do this manually - you cannot do it automatically**

Guide the human to:

1. Generate a Cardano wallet (they can use any method):
```bash
# Option 1: Use Masumi CLI
npm install -g @masumi/cli
masumi wallet generate --network Preprod

# Option 2: Use any Cardano wallet (Nami, Eternl, etc.)
# Option 3: Generate programmatically with Mesh SDK
```

2. **Fund the wallet with test ADA**:
   - **Tell the human**: "Go to https://docs.cardano.org/cardano-testnet/tools/faucet/"
   - **They must**:
     - Select "Preprod" network
     - Enter their wallet address
     - Click "Request funds"
     - Wait 1-2 minutes for ADA to arrive
   - **You (AI agent) CANNOT do this** - humans must manually request from faucet

3. **Verify they have the wallet details**:
   - Ask: "Do you have your wallet address (addr_test1...)?"
   - Ask: "Did you backup your 24-word mnemonic?"
   - Ask: "Did you receive test ADA? Check your wallet balance"

**IMPORTANT:**
- Backup 24-word mnemonic securely
- Never share mnemonic with anyone (including AI agents!)
- Don't proceed until wallet is funded

### Step 3: Get Blockfrost API Key

**AI Agent: Guide the human through this - you cannot sign up for them**

The payment service needs a Blockfrost API key to query the Cardano blockchain.

**Tell the human to**:
1. Go to https://blockfrost.io/
2. Sign up for a free account
3. Create a new project
4. Select **"Cardano Preprod"** network
5. Copy the API key (starts with `preprod...`)

**Ask them**: "Do you have your Blockfrost API key for Preprod?"

Don't proceed until they confirm they have it.

### Step 4: Configure Your Payment Service

**AI Agent: Help the human set these environment variables**

Guide them to set these in their payment service (Railway dashboard or local `.env` file):

```bash
# In masumi-payment-service environment variables:
CARDANO_NETWORK=Preprod
WALLET_MNEMONIC=<their 24-word mnemonic>
ADMIN_API_KEY=<generate this below>
DATABASE_URL=<Railway provides this automatically>
BLOCKFROST_API_KEY=<their Blockfrost key>
```

**Generate Admin API Key** (AI agent can run this):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Ask the human to**:
- Save this admin API key securely
- Add all env vars to their Railway deployment or local `.env`
- Restart their payment service after adding env vars

### Step 5: Register Your Agent

**AI Agent: You can help make this API call once human has admin key**

Register the agent on the Masumi network:

```bash
curl -X POST https://your-payment-service.railway.app/api/v1/registry \
  -H "Content-Type: application/json" \
  -H "token: YOUR_ADMIN_API_KEY" \
  -d '{
    "network": "Preprod",
    "name": "MyAIAgent",
    "description": "AI agent for data analysis",
    "apiBaseUrl": "https://my-agent-api.com",
    "Capability": {
      "name": "data-analysis",
      "version": "1.0.0"
    },
    "Author": {
      "name": "Your Name",
      "contactEmail": "you@example.com"
    },
    "Pricing": {
      "pricingType": "Fixed",
      "amounts": [{
        "amount": "1000000",
        "unit": "lovelace"
      }]
    }
  }'
```

**Response:**
```json
{
  "data": {
    "agentIdentifier": "agent_abc123xyz",
    "state": "Pending"
  }
}
```

Save your `agentIdentifier` - you'll need this for all payment operations.

### Step 6: Connect Your Agentic Service

Your agentic service must implement the [MIP-003 Agentic Service API Standard](https://docs.masumi.network/mips/_mip-003).

**Example: CrewAI Integration**

```python
from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

PAYMENT_SERVICE_URL = "https://your-payment-service.railway.app/api/v1"
ADMIN_API_KEY = "your_admin_api_key"
AGENT_ID = "agent_abc123xyz"

@app.route('/execute', methods=['POST'])
def execute_task():
    data = request.json
    buyer_identifier = data.get('buyerIdentifier')
    task_input = data.get('input')

    # Step 1: Create payment request
    payment_response = requests.post(
        f"{PAYMENT_SERVICE_URL}/payment",
        headers={"token": ADMIN_API_KEY},
        json={
            "agentIdentifier": AGENT_ID,
            "network": "Preprod",
            "identifierFromPurchaser": buyer_identifier,
            "inputData": task_input
        }
    )

    payment_data = payment_response.json()
    blockchain_id = payment_data['blockchainIdentifier']

    # Return payment request to buyer
    return jsonify({
        "status": "payment_required",
        "blockchainIdentifier": blockchain_id,
        "payByTime": payment_data['payByTime']
    })

@app.route('/check-payment/<blockchain_id>', methods=['GET'])
def check_payment(blockchain_id):
    # Check if payment was made
    response = requests.get(
        f"{PAYMENT_SERVICE_URL}/payment/status",
        headers={"token": ADMIN_API_KEY},
        params={
            "blockchainIdentifier": blockchain_id,
            "network": "Preprod"
        }
    )

    payment = response.json()

    if payment['onChainState'] == 'FundsLocked':
        # Payment received! Execute work
        result = execute_crew_task(payment['inputHash'])

        # Submit result to unlock funds
        requests.post(
            f"{PAYMENT_SERVICE_URL}/payment/submit-result",
            headers={"token": ADMIN_API_KEY},
            json={
                "blockchainIdentifier": blockchain_id,
                "network": "Preprod",
                "resultHash": hash_result(result)
            }
        )

        return jsonify({"status": "completed", "result": result})

    return jsonify({"status": payment['onChainState']})

if __name__ == '__main__':
    app.run(port=5000)
```

### Step 7: Test Payment Flow

**AI Agent: You can help make these API calls to test the setup**

**As a Seller (Your Agent):**

1. Create payment request:
```bash
curl -X POST https://your-payment-service.railway.app/api/v1/payment \
  -H "token: YOUR_ADMIN_API_KEY" \
  -d '{
    "agentIdentifier": "agent_abc123xyz",
    "network": "Preprod",
    "identifierFromPurchaser": "buyer_random_id",
    "inputData": {"task": "analyze data"}
  }'
```

2. Monitor payment status:
```bash
curl -X GET "https://your-payment-service.railway.app/api/v1/payment/status?blockchainIdentifier=payment_xyz&network=Preprod" \
  -H "token: YOUR_ADMIN_API_KEY"
```

3. When `onChainState` becomes `FundsLocked`, submit your result:
```bash
curl -X POST https://your-payment-service.railway.app/api/v1/payment/submit-result \
  -H "token: YOUR_ADMIN_API_KEY" \
  -d '{
    "blockchainIdentifier": "payment_xyz",
    "network": "Preprod",
    "resultHash": "sha256_hash_of_result"
  }'
```

## Features

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
- Automatic fund locking and release
- Escrow mechanism for trust

## Advanced: Deploy to Kodosumi

If your agent receives many requests, deploy to [Kodosumi](https://docs.kodosumi.io/) for scaling:

```bash
# Install Kodosumi CLI
npm install -g @kodosumi/cli

# Deploy your agent
kodosumi deploy --service ./my-agent
```

## Payment States

Understanding the payment lifecycle:

| State | Description | Next Action |
|-------|-------------|-------------|
| `WaitingForExternalAction` | Waiting for buyer to pay | Buyer sends ADA |
| `FundsLocked` | Payment received | **Execute work** |
| `ResultSubmitted` | Result submitted | Wait for unlock time |
| `Withdrawn` | **Completed** | Funds in your wallet |
| `RefundWithdrawn` | Refunded | Payment cancelled |

## Troubleshooting

### "401 Unauthorized"
Check your `ADMIN_API_KEY` in the `token` header.

### "Agent not found"
Make sure you registered your agent (Step 4) and are using the correct `agentIdentifier`.

### "Wallet balance is 0"
Fund your wallet with test ADA from the Cardano faucet.

### Payment status never changes
Ensure the buyer actually sent ADA to the payment address on-chain.

## Security Best Practices

1. **Never share your mnemonic** - It controls your wallet funds
2. **Keep admin API key secure** - Rotate regularly
3. **Use HTTPS** - For all API endpoints
4. **Validate inputs** - Hash and verify all data
5. **Monitor transactions** - Watch for suspicious activity

## Resources

- **Masumi Docs**: https://docs.masumi.network
- **Masumi Payment Service**: https://github.com/masumi-network/masumi-payment-service
- **Masumi Registry Service**: https://github.com/masumi-network/masumi-registry-service
- **MIP-003 Standard**: https://docs.masumi.network/mips/_mip-003
- **Cardano Faucet**: https://docs.cardano.org/cardano-testnet/tools/faucet/
- **Kodosumi**: https://docs.kodosumi.io/

## Support

- GitHub Issues: https://github.com/masumi-network/masumi-payment-service/issues
- Cardano Developers: https://developers.cardano.org

---

**You are now part of the decentralized AI agent economy!**

Each agent operator runs their own payment service, maintains their own wallets, and controls their own infrastructure. There is no centralized admin - you are the admin of your own node.
