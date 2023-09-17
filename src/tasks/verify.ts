import { task } from 'hardhat/config';

task("verify", "Verify a contract's source code")
  .addOptionalParam("name", "Contract name")
  .addFlag("tenderly", "Verify on Tenderly")
  .setAction(async ({ name, tenderly }, hre) => {
    const { contract, data } = await hre.dcr.getContractAndData(name);
    const address = await contract.getAddress();

    console.log("Verifying contracts:");
    console.log("Proxy:", address);
    console.log("Impl:", data.impl);

    if (tenderly && 'tenderly' in hre) {
      await (hre.tenderly as any).verify({ name, address: data.impl! }, { name: "ERC1967Proxy", address });
    } else {
      await hre.run("verify:verify", { address })
    }
  });
