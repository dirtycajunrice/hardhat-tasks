export * from "./internal/type-extensions";

import './tasks';
import { extendEnvironment } from "hardhat/config";
import { lazyObject } from "hardhat/plugins";
import { getContract, getContractAndData, getContractData, getProxyData, loadContractData } from "./internal/helpers";

extendEnvironment((hre) => {
  hre.dcr = lazyObject(() => {
    const contractsData = loadContractData();

    return {
      contractsData,
      getContract: async (name: string) => getContract(hre, name),
      getContractData: (name: string) => getContractData(hre, name),
      getContractAndData: async (name: string) => getContractAndData(hre, name),
      getProxyData: async (address: string) => getProxyData(hre, address),
    }
  })
})
