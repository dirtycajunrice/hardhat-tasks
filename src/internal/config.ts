import "@nomicfoundation/hardhat-verify";

import "dotenv/config";
import { ChainConfig, EtherscanConfig } from "@nomicfoundation/hardhat-verify/types";
import { NetworksUserConfig } from "hardhat/src/types/config";

import { HardhatUserConfig, SolidityConfig } from "hardhat/types";
import { type Chain } from "@wagmi/chains"
import { networksBase } from "./chains";

const makeNetworkConfigFromChain = (chain: Chain, accounts: string[]): NetworksUserConfig => ({
  [chain.network]: {
    url: chain.rpcUrls.public.http[0],
    chainId: chain.id,
    accounts: accounts,
  }
})

export const makeNetworksConfig = (accounts: string[]) => {
  return Object.values(networksBase).reduce((o, chain) => {
    o = {...o, ...makeNetworkConfigFromChain(chain, accounts) };
    return o;
  }, {} as NetworksUserConfig);
};

export const makeEtherscanCustomChains = (overrides: Record<string, Partial<ChainConfig>> = {}) => {
  return Object.values(networksBase).reduce((o, chain) => {
    if (chain.blockExplorers.default.url) {
      o.push({
        network: chain.network,
        chainId: chain.id,
        ...overrides[chain.network],
        urls: {
          apiURL: chain.blockExplorers.default.url,
          browserURL: chain.blockExplorers.default.url,
          ...overrides[chain.network]?.urls
        },
      });
    }
    return o;
  }, [] as ChainConfig[]);
};

export const makeEtherscanAPIKeys = (overrides: Record<string, string> = {}) => {
  const baseKeys = Object.values(networksBase).reduce((o, chain) => {
    o[chain.network] = process.env[`${chain.network.toUpperCase().replace(/[- ]/, "_")}_ETHERSCAN_API_KEY`] || 'not-needed';
    return o;
  }, {} as Record<string, string>);
  return { ...baseKeys, ...overrides };
};

export const makeEtherscanConfig = (
  apiKeyOverrides: Record<string, string> = {},
  customChainOverrides: Record<string, Record<string, any>> = {}
): EtherscanConfig => {
  return {
    apiKey: makeEtherscanAPIKeys(apiKeyOverrides),
    customChains: makeEtherscanCustomChains(customChainOverrides),
  }
}

export const defaultSolidityVersions = [ "0.8.16", "0.8.9", "0.8.2", "0.6.0" ] as const;

export const makeSolidityConfig = (
  versions: string[] = [...defaultSolidityVersions],
  settings?: Record<string, any>,
  overrides?: any,
): SolidityConfig => (
  {
    compilers: versions.map(version => (
      { version, settings: { ...settings, optimizer: { enabled: true, runs: 200, ...settings?.optimizer } } }
    )),
    overrides,
  }
);


// Example:
export const makeDefaultConfig = (): HardhatUserConfig => (
  {
    solidity: makeSolidityConfig(),
    networks: makeNetworksConfig([ process.env.PRIVATE_KEY || "" ]),
    etherscan: makeEtherscanConfig(),
  }
);
