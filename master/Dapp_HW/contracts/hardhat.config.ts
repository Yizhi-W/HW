import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.9",
  networks: {
    ganache: {
      // rpc url, change it according to your ganache configuration
      url: 'http://localhost:8545',
      // the private key of signers, change it according to your ganache user
      accounts: [
        '0xc4001f52ce59f2b8c0963e54ae9c5e7fd308464e58c182241a9115836ba4d8bb',
        '0xeefe78eedcbfd1d8098fc322e990daf7988dacdb072633917e346749b9101078',
        '0xa159647bed5ac0a58d8c6f3c00fd59f2f805c208e72b46d644ed88cf6917db81',
        '0x1cd512f682e5f87b61ef4d23ecee78fb15b61a1b2c82d679158cea4be8cffef8',
        '0x1c91b9c953909069a67073e9ba40877f996fd5adb5e8a6b9058f11f776f50c2d'
      ]
    },
  },
};

export default config;
