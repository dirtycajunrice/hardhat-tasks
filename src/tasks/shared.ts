import fs from 'fs';
import { task, subtask, types } from 'hardhat/config';

task("saveContractDetails", "Save the details of a contract to local storage")
  .addParam("name", "Contract name", null, types.string)
  .addParam("address", "Contract address", null, types.string)
  .setAction(async ({ name, address }, hre) => {
    await hre.run('saveContractDetails:subtask', { name, address })
  });

subtask("saveContractDetails:subtask", "Save details of a contract to local storage")
  .addParam("name", "Contract name", null, types.string)
  .addParam("address", "Contract address", null, types.string)
  .setAction(async ({ name, address }, hre) => {

    const chainId = hre.network.config.chainId || 0;
    if (!(chainId in hre.dcr.contractsData) && !(chainId.toString() in hre.dcr.contractsData)) {
      hre.dcr.contractsData[chainId] = {};
    }
    const { type, impl, admin } = await hre.dcr.getProxyData(address);
    hre.dcr.contractsData[chainId][address] = { name, type };
    if (type === 'static') {
      console.log("Address:", address);
    }
    if (type === 'uups' || type === 'transparent') {
      hre.dcr.contractsData[chainId][address].impl = impl;
      console.log('Proxy:', address);
      console.log('Impl:', impl);
    }
    if (type === 'transparent') {
      console.log('Admin:', admin);
    }
    const data = JSON.stringify(hre.dcr.contractsData, null, 2);
    fs.writeFileSync('contracts.json', data, 'utf-8')
  });
