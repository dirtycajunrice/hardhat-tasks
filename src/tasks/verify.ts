import { task } from 'hardhat/config';

task("verify", "Verify a contract's source code")
  .addOptionalParam("name", "Contract name")
  .setAction(async ({ name, address: inAddress }, hre) => {
    let address = inAddress;
    if (!address) {
      const { contract } = await hre.dcr.getContractAndData(name);
      address = await contract.getAddress();
    }
    console.log("Verifying contract...")
    await hre.run("verify:verify", { address })
  });
