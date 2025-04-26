# ZetaChain VRF

A Verifiable Random Function (VRF) implementation for ZetaChain that provides
cryptographically secure random numbers that can be verified on-chain.

This project is designed to be simple, efficient, and easy to integrate into
your ZetaChain applications. Worth noting that, given the contract uses future
blockhashes as a source of entropy, **it provides unpredictability but not true
randomness**, same as any other VRF implementation that uses blockhashes. Here
we're just proving that the outputs were calculated correctly.

## Motivation

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

## Features

- Generate random numbers with cryptographic security
- Verify the randomness on-chain
- Optional range specification (min/max values)
- Simple two-step request/fulfill process
- Fully compatible with ZetaChain testnet (Athens)

## Prerequisites

- Node.js and npm installed
- A wallet with ZetaChain testnet tokens
- Basic knowledge of Solidity and Hardhat

## Getting Started

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
```

### Deployment

Deploy the contract to ZetaChain testnet:

```bash
make deploy
```

Take note of the contract address printed in the console.

### Generate Random Numbers

To generate a random number within a specified range:

```bash
# Use default range (0-100)
make random

# Or specify a custom range
make random MIN=0 MAX=200
```

## How It Works

The ZetaChain VRF uses a two-step process to generate verifiable random numbers:

1. **Request Phase**:
   - A user calls `requestRandomNumber()` or `requestRandomNumberInRange(min, max)`
   - The contract records the request details including the next block number
   - An event is emitted with the request ID

2. **Fulfill Phase**:
   - After the specified block is mined, the user calls `fulfillRandomNumber(requestId)`
   - The contract uses the block hash as a source of entropy
   - Combined with the request ID and requester address, it generates a random number
   - The result is stored on-chain and an event is emitted

3. **Verification**:
   - Anyone can verify the randomness by calling `verifyRandomNumber(requestId, randomNumber)`
   - The random number can be retrieved anytime using `getRandomNumber(requestId)`

## Contract Interface

```solidity
// Request a random number (full range)
function requestRandomNumber() external returns (uint256 requestId)

// Request a random number within a specific range
function requestRandomNumberInRange(uint256 minValue, uint256 maxValue) external returns (uint256 requestId)

// Fulfill a random number request
function fulfillRandomNumber(uint256 requestId) external returns (uint256 randomNumber)

// Get a previously generated random number
function getRandomNumber(uint256 requestId) external view returns (uint256 randomNumber)

// Verify a random number
function verifyRandomNumber(uint256 requestId, uint256 randomNumber) external view returns (bool)
```

## Security Considerations

- The randomness relies on the security of block hashes in ZetaChain
- For high-value applications, consider adding additional security measures
- Block hash is only available for the 256 most recent blocks

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
