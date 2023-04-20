require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();
const privateKeys = process.env.PRIVATE_KEYS || ""

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  networks: {
    localhost: {},
    goerli: {
      url: `https://eth-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY_GOERLI}`,
      accounts: privateKeys.split(','),
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY_SEPOLIA}`,
      accounts: privateKeys.split(','),
    },
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY_MUMBAI}`,
      accounts: privateKeys.split(','),
    }
  },
  etherscan: {
    apiKey: {
      goerli: "VG5IWSXRRQMHXHPYA9W4P4ICV2AG9SS42M",
      sepolia: "VG5IWSXRRQMHXHPYA9W4P4ICV2AG9SS42M",
      polygonMumbai: "AUWKY2G4VBVXJBA9PEWP4H27T8CQUAP2FY",
    }
  }
};
