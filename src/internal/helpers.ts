import { Manifest } from "@openzeppelin/upgrades-core";
import { ContractFactory } from "ethers";
import { Contract } from "hardhat/internal/hardhat-network/stack-traces/model";
import fs from "node:fs";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { setTimeout } from "timers/promises";
import { ContractDetails, ContractsData, ContractType } from "./types";
import path from "path";

export const isTypeOfContractType = (key: string): key is ContractType => {
  return ['static', 'transparent', 'uups'].includes(key)
}

export const validateContractType = (key: string) => {
  if (!isTypeOfContractType(key)) {
    throw Error(`"${key}" is not a valid contract type. Valid options are static, transparent, and uups`)
  }
}

export const loadContractData = (): ContractsData => {
  const dataDir = ".hardhat-tasks";
  const fileName = 'contracts.json';
  if (!fs.existsSync(dataDir)) {
    console.log("Creating hardhat-tasks data directory");
    fs.mkdirSync(dataDir);
  }
  let data = {};
  if (!fs.existsSync(path.join(dataDir, fileName))) {
    console.log("Creating hardhat-tasks contracts file");
    fs.writeFileSync(path.join(dataDir, fileName), JSON.stringify({}), 'utf-8');
  } else {
    data = JSON.parse(fs.readFileSync(path.join(dataDir, fileName), 'utf-8') || "{}");
  }
  if (fs.existsSync(fileName)) {
    console.log("Migrating legacy contracts file");
    data = { ...data, ...JSON.parse(fs.readFileSync(fileName, 'utf-8') || "{}") };
    fs.writeFileSync(path.join(dataDir, fileName), JSON.stringify(data), 'utf-8');
    fs.rmSync(fileName, { force: true });
  }
  return data;
}

export const getContractData = (hre: HardhatRuntimeEnvironment, name: string): ContractDetails => {
  const chainId = hre.network.config.chainId;
  if (!chainId) {
    throw "No chain ID found!";
  }

  if (!(chainId.toString() in hre.dcr.contractsData)) {
    throw `No contracts found for chainId ${chainId}`;
  }
  const data = Object.entries(hre.dcr.contractsData[chainId.toString()]).find(([, data]) => data.name === name);
  if (!data) {
    throw `No contract address found for ${name}`;
  }

  return { address: data[0], data: data[1] }
}

export const getContract = async (hre: HardhatRuntimeEnvironment, name: string) => {
  const { address } = hre.dcr.getContractData(name);
  const accounts = await hre.ethers.getSigners();
  return await hre.ethers.getContractAt(name, address, accounts[0]);
}

export const getContractAndData = async (hre: HardhatRuntimeEnvironment, name: string) => {
  const { address, data } = hre.dcr.getContractData(name);
  const accounts = await hre.ethers.getSigners();
  const contract = await hre.ethers.getContractAt(name, address, accounts[0]);
  const factory: ContractFactory<any[], Contract> & { runner: { _gasLimit?: BigInt } } = (await hre.ethers.getContractFactory(name)) as any;
  return { contract, factory, data, address }
}

// getProxyData Gets the implementation/admin addresses for a proxy contract based on kind
export const getProxyData = async (hre: HardhatRuntimeEnvironment, address: string) => {
  const manifest = await Manifest.forNetwork(hre.network.provider);
  const data: { type: ContractType, impl?: string, admin?: string } = {
    type: 'static',
    impl: undefined,
    admin: undefined
  }
  try {
    const proxy = await manifest.getProxyFromAddress(address);
    data.type = proxy.kind;
    data.impl = await hre.upgrades.erc1967.getImplementationAddress(address)
    if (proxy.kind === 'transparent') {
      data.admin = await hre.upgrades.erc1967.getAdminAddress(address)
    }
  } catch (e) {
    console.error(e)
  }
  return data
}

export const waitSeconds = async (seconds: number = 5) => {
  console.log(`Waiting ${seconds}s...`)
  await setTimeout(seconds * 1000);
}
