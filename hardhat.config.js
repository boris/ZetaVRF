require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Get private key from .env file
const PRIVATE_KEY = process.env.PRIVATE_KEY;
// ZetaChain Testnet Athens RPC
const ZETACHAIN_TESTNET_URL = process.env.ZETACHAIN_TESTNET_URL || "https://zetachain-athens-evm.blockpi.network/v1/rpc/public";
// Etherscan API key for contract verification
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.28",
    networks: {
        zetachainTestnet: {
            url: ZETACHAIN_TESTNET_URL,
            accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
            chainId: 7001, // ZetaChain Athens testnet chain ID
        },
        hardhat: {
            chainId: 31337,
        },
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts",
    },
    sourcify: {
        enabled: true,
    },
    etherscan: {
        apiKey: {
            zetachainTestnet: ETHERSCAN_API_KEY,
        },
        customChains: [{
            network: "zetachainTestnet",
            chainId: 7001,
            urls: {
                apiURL: "https://zetachain-testnet.blockscout.com/api",
                browserURL: "https://zetachain-testnet.blockscout.com/",
            },
        }]
    },
};
