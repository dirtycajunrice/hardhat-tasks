import '@openzeppelin/hardhat-upgrades';
import { task } from 'hardhat/config';
import {  waitSeconds } from '../internal/helpers';

task("upgrade", "Upgrade a proxy contract")
  .addParam("name")
  .addFlag("forceGasLimit", "Force gas limit")
  .setAction(async ({ name, forceGasLimit }, hre) => {
    await hre.run('compile')
    try {
      const {factory, data, address } = await hre.dcr.getContractAndData(name)

      if (forceGasLimit) {
        console.log("Shitty chain doesnt provide gaslimit. setting to 10m")
        factory.runner['_gasLimit'] = BigInt(10_000_000);
      }
      console.log("Upgrading", name, data.type, "proxy", address)
      console.log("Current impl address:", data.impl)

      const upgrade = await hre.upgrades.upgradeProxy(address, factory)
      await upgrade.waitForDeployment();
      console.log(name, "upgraded!")
      await hre.run('saveContractDetails', {
        name,
        address,
        chainId: hre.network.config.chainId,
        type: data.type
      })
    } catch (e) {
      console.log(e)
      return;
    }
    await waitSeconds(5);
    console.log("Verifying implementation contract...")
    await hre.run("verify", { name })
  });
