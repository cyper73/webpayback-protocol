require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    humanityMainnet: {
      url: "https://humanity-mainnet.g.alchemy.com/public", // L'RPC pubblico ufficiale della Mainnet
      chainId: 6985385,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    },
    humanityTestnet: {
      url: "https://rpc.testnet.humanity.org/",
      chainId: 1942999413,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    },
    humanityMock: {
      url: "http://127.0.0.1:8545", // Rete locale per i test falliti
      chainId: 31337
    },
    polygon: {
      url: "https://polygon-rpc.com/",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 30000000000, // 30 gwei
      gas: 2100000
    },
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com/",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 30000000000,
      gas: 2100000
    }
  },
  etherscan: {
    apiKey: {
      polygon: process.env.POLYGONSCAN_API_KEY || "", // [REDACTED_FOR_GITHUB_SECURITY]
      polygonMumbai: process.env.POLYGONSCAN_API_KEY || "" // [REDACTED_FOR_GITHUB_SECURITY]
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};