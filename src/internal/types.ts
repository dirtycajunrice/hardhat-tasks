import { getContract, getContractAndData, getContractData, getProxyData } from "./helpers";

export interface ContractDetails {
  address: string,
  data: ContractData
}

export interface HardhatTasksHelpers {
  contractsData: ContractsData;
  getContractData: (name: string) => ReturnType<typeof getContractData>;
  getContract: (name: string) => ReturnType<typeof getContract>;
  getContractAndData: (name: string) => ReturnType<typeof getContractAndData>;
  getProxyData: (address: string) => ReturnType<typeof getProxyData>;
}

export type ContractType = "static" | "transparent" | "uups" | "beacon"
export type ContractData = {
  name: string,
  type: ContractType,
  impl?: string,
  admin?: string
}
export type ContractsData = {
  [chainId: string]: {
    [address: string]: ContractData
  }
}
