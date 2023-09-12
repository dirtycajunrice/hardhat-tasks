import { subtask, task, types } from 'hardhat/config';
import { Manifest } from '@openzeppelin/upgrades-core';
import { validateContractType, waitSeconds } from '../internal/helpers';

task("deploy", "Deploy a contract")
  .addParam("name")
  .addFlag("forceGasLimit", "Force gas limit")
  .addOptionalParam("type", "Contract deployment type - static | transparent | uups", "uups", types.string)
  .setAction(async ({ name, type, forceGasLimit }, hre) => {
    validateContractType(type);
    await hre.run('compile')
    if (type === 'static') {
      await hre.run(`deploy:static`, { name, forceGasLimit });
    } else {
      await hre.run(`deploy:upgradeable`, { name, forceGasLimit });
    }
  });

subtask("deploy:static", "Deploy a static contract")
  .addParam("name")
  .addFlag("forceGasLimit", "Force gas limit")
  .setAction(async ({ name }, hre) => {
    await hre.run('compile')
    const factory = await hre.ethers.getContractFactory(name)
    console.log("Deploying", name, "as a static contract")
    const contract = await factory.deploy()
    await contract.waitForDeployment();
    const address = await contract.getAddress();
    console.log(name, "deployed!")
    await hre.run('saveContractDetails:subtask', {
      name,
      address,
      chainId: hre.network.config.chainId,
      type: 'static'
    })
    await waitSeconds(5);
    console.log("Verifying contract...")
    await hre.run("verify", { address })
  });

subtask("deploy:upgradeable", "Deploy a transparent proxy contract")
  .addParam("name")
  .setAction(async ({ name, type }, hre) => {
    const factory = await hre.ethers.getContractFactory(name)
    console.log("Deploying", name, "as an upgradeable contract")
    const contract = await hre.upgrades.deployProxy(factory, { kind: type })
    const address = await contract.getAddress();
    const manifest = await Manifest.forNetwork(hre.network.provider);
    const proxy = await manifest.getProxyFromAddress(address);

    await contract.deployed();
    console.log(name, "deployed!")
    await hre.run('saveContractDetails:subtask', {
      name,
      address,
      chainId: hre.network.config.chainId,
      type: proxy.kind
    })
    await waitSeconds(5);
    await hre.run('verify', { name })
  });
