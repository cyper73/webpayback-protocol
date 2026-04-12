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
    }
  },
  etherscan: {
    apiKey: {
      humanityTestnet: process.env.HUMANITY_API_KEY || "", 
      humanityMainnet: process.env.HUMANITY_API_KEY || ""
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};