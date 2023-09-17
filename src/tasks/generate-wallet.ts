import { task } from "hardhat/config";

task("generate-wallet", "Generate a new private key and address")
  .setAction(async ({}, hre) => {
    const wallet = hre.ethers.Wallet.createRandom()
    console.log("Mnemonic Phrase:", wallet.mnemonic?.phrase);
    console.log('Address 1:', wallet.address);
    console.log("Private Key 1:", wallet.privateKey);
    console.warn('Save this somewhere! It has not been stored');
  });
