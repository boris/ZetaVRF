# 🎲 ZetaChain VRF

A Verifiable Random Function (VRF) implementation for ZetaChain that provides cryptographically secure random numbers that can be verified on-chain.

## 🌟 Motivation

Blockchain applications often need secure, unpredictable, and verifiable random numbers for various use cases:

- Gaming and NFT applications (loot distribution, character traits)
- Fair selection mechanisms (lottery, raffles)
- Random assignment of duties or responsibilities
- Unpredictable system behaviors

Traditional random number generation is challenging in blockchain environments because:

1. Blockchain operations are deterministic by design
2. On-chain sources of randomness can be manipulated or predicted
3. Off-chain solutions require trust in external entities

ZetaChain VRF addresses these challenges by:

- Using blockchain-based entropy (block hashes) for unpredictability
- Providing on-chain verification to prove fairness
- Making the generation process completely transparent
- Working natively on ZetaChain without external dependencies

## ✨ Features

- Generate random numbers with cryptographic security
- Verify the randomness on-chain
- Optional range specification (min/max values)
- Simple two-step request/fulfill process
- Fully compatible with ZetaChain testnet (Athens) and mainnet

## 📋 Prerequisites

- Node.js and npm installed
- A wallet with tokens for the target network
- Basic knowledge of Solidity and Hardhat

## 🚀 Getting Started

### Installation

1. Clone this repository:
```bash
git clone https://github.com/yourusername/zetachain-vrf.git
cd zetachain-vrf
```

2. Install dependencies:
```bash
make setup
```

3. Create a `.env` file with your private key:
```
PRIVATE_KEY=your_private_key_here
ZETACHAIN_TESTNET_URL=https://zetachain-athens-evm.blockpi.network/v1/rpc/public
ZETACHAIN_MAINNET_URL=https://zetachain.blockpi.network/v1/rpc/public
ETH_GOERLI_URL=https://eth-goerli.public.blastapi.io
ETH_MAINNET_URL=https://ethereum.publicnode.com
```

## 🌉 Using the Existing Deployed Contract

### Contract Addresses

- 🧪 **ZetaChain Testnet (Athens)**: `0x1CEbee87b3E780fbA2A56AfA8CA543830d0c84A5`

### Interacting with the Deployed Contract

You can use our existing deployed contract without deploying your own:

```bash
# Set the contract address in your .env file
echo "CONTRACT_ADDRESS=0x1CEbee87b3E780fbA2A56AfA8CA543830d0c84A5" >> .env

# Generate a random number (default range 0-100)
make random

# Generate a random number in custom range
make random MIN=1 MAX=1000
```

### Code Example

```javascript
// Example code to interact with the deployed contract
const { ethers } = require("ethers");
const zetaVRFAbi = require("./abis/ZetaVRF.json");

async function getRandomNumber(min, max) {
    // Connect to ZetaChain
    const provider = new ethers.providers.JsonRpcProvider("https://zetachain-athens-evm.blockpi.network/v1/rpc/public");
    const wallet = new ethers.Wallet("YOUR_PRIVATE_KEY", provider);
    
    // Contract address on ZetaChain testnet
    const contractAddress = "0x1CEbee87b3E780fbA2A56AfA8CA543830d0c84A5";
    const contract = new ethers.Contract(contractAddress, zetaVRFAbi, wallet);
    
    // Request a random number
    const tx = await contract.requestRandomNumber();
    const receipt = await tx.wait();
    
    // Find the request ID from the event
    const requestId = receipt.events[0].args.requestId;
    
    // Wait for next block
    await new Promise(resolve => setTimeout(resolve, 15000));
    
    // Fulfill the request
    const fulfillTx = await contract.fulfillRandomNumber(requestId);
    await fulfillTx.wait();
    
    // Get the generated random number
    const randomValue = await contract.getRandomNumber(requestId);
    
    // Map to desired range
    const range = max - min + 1;
    const result = min + (randomValue % range);
    
    return result;
}
```

## 🛠️ Deployment

### Deploy to ZetaChain Testnet

```bash
make deploy
```

### Deploy to ZetaChain Mainnet

Update your `hardhat.config.js` to include ZetaChain mainnet:

```javascript
zetachainMainnet: {
  url: process.env.ZETACHAIN_MAINNET_URL || "https://zetachain.blockpi.network/v1/rpc/public",
  accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
  chainId: 7000, // ZetaChain mainnet chain ID
},
```

Then deploy with:

```bash
npx hardhat run scripts/deploy.js --network zetachainMainnet
```

### Deploy to Ethereum Networks

To deploy to Ethereum networks, add their configuration to `hardhat.config.js`:

```javascript
goerli: {
  url: process.env.ETH_GOERLI_URL,
  accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
  chainId: 5,
},
mainnet: {
  url: process.env.ETH_MAINNET_URL,
  accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
  chainId: 1,
}
```

Deploy to Ethereum Goerli:
```bash
npx hardhat run scripts/deploy.js --network goerli
```

Deploy to Ethereum Mainnet:
```bash
npx hardhat run scripts/deploy.js --network mainnet
```

### Cross-Chain Considerations

When deploying to different networks, consider these differences:

- **Block Times**: Vary across networks, affecting the waiting time between request and fulfillment
- **Gas Costs**: Will differ across networks
- **Block Hash Availability**: Some networks have different limits on block hash availability

## 🎲 Generate Random Numbers

To generate a random number within a specified range:

```bash
# Use default range (0-100)
make random

# Or specify a custom range
make random MIN=0 MAX=200
```

## ⚙️ How It Works

The ZetaChain VRF uses a two-step process to generate verifiable random numbers:

1. **Request Phase** 
   - A user calls `requestRandomNumber()` or `requestRandomNumberInRange(min, max)`
   - The contract records the request details including the next block number
   - An event is emitted with the request ID

2. **Fulfill Phase** 
   - After the specified block is mined, the user calls `fulfillRandomNumber(requestId)`
   - The contract uses the block hash as a source of entropy
   - Combined with the request ID and requester address, it generates a random number
   - The result is stored on-chain and an event is emitted

3. **Verification** 
   - Anyone can verify the randomness by calling `verifyRandomNumber(requestId, randomNumber)`
   - The random number can be retrieved anytime using `getRandomNumber(requestId)`

## 📋 Contract Interface

```solidity
// Request a random number (full range)
function requestRandomNumber() external returns (uint256 requestId)

// Request a random number within a specific range (if using enhanced contract)
function requestRandomNumberInRange(uint256 minValue, uint256 maxValue) external returns (uint256 requestId)

// Fulfill a random number request
function fulfillRandomNumber(uint256 requestId) external returns (uint256 randomNumber)

// Get a previously generated random number
function getRandomNumber(uint256 requestId) external view returns (uint256 randomNumber)

// Get a random number mapped to a specific range (if using enhanced contract)
function getRandomNumberInRange(uint256 requestId, uint256 min, uint256 max) external view returns (uint256)

// Verify a random number
function verifyRandomNumber(uint256 requestId, uint256 randomNumber) external view returns (bool)
```

## 🔒 Security Considerations

- The randomness relies on the security of block hashes in the blockchain
- For high-value applications, consider adding additional security measures
- Block hash is only available for the 256 most recent blocks
- Random number range mapping may have minor modulo bias

## 🌐 Network-specific Notes

### ZetaChain
- **Testnet (Athens)**: Block time ~5 seconds
- **Mainnet**: Block time ~2 seconds
- Excellent cross-chain compatibility

### Ethereum
- Block time ~12 seconds
- Higher gas costs
- Strong security guarantees

