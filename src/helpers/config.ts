import "@nomicfoundation/hardhat-toolbox";
import '@openzeppelin/hardhat-upgrades';
import { HardhatUserConfig } from "hardhat/config";

import "dotenv/config";

export type NetworkBase = {
  name: string,
  chainId: number,
  urls: {
    rpc: string
    api?: string,
    browser?: string,
  },
}

const networkBase: { [name: string]: NetworkBase } = {
  harmony: {
    name: 'harmony',
    chainId: 1666600000,
    urls: { rpc: 'https://api.harmony.one' }
  },
  harmonyTest: {
    name: 'harmonyTest',
    chainId: 1666700000,
    urls: { rpc: 'https://api.s0.b.hmny.io' }
  },
  optimism: {
    name: 'optimisticEthereum',
    chainId: 10,
    urls: { rpc: 'https://mainnet.optimism.io' }
  },
  polygon: {
    name: 'polygon',
    chainId: 137,
    urls: { rpc: 'https://polygon-mainnet.public.blastapi.io' }
  },
  arbitrum: {
    name: 'arbitrumOne',
    chainId: 42161,
    urls: { rpc: 'https://arb1.arbitrum.io/rpc' }
  },
  fantom: {
    name: 'opera',
    chainId: 250,
    urls: { rpc: 'https://fantom-mainnet.public.blastapi.io' }
  },
  avalanche: {
    name: 'avalanche',
    chainId: 43114,
    urls: { rpc: 'https://api.avax.network/ext/bc/C/rpc' }
  },
  cronos: {
    name: 'cronos',
    chainId: 25,
    urls: {
      rpc: 'https://evm.cronos.org',
      api: "https://api.cronoscan.com/api",
      browser: "https://cronoscan.com/",
    }
  },
  bobaAvax: {
    name: 'bobaAvax',
    chainId: 43288,
    urls: {
      rpc: 'https://avax.boba.network',
      api: "https://blockexplorer.avax.boba.network/api",
      browser: "https://blockexplorer.avax.boba.network",
    }
  }
}

export const GetNetworks = (accounts: string[]) => {
  return Object.entries(networkBase).reduce((o, [, network]) => {
    o[network.name] = {
      url: network.urls.rpc,
      chainId: network.chainId,
      accounts: accounts
    }
    return o;
  }, {} as any)
}

export const GetEtherscanCustomChains = () => {
  return Object.entries(networkBase).reduce((o, [, network]) => {
    if (network.urls.api && network.urls.browser) {
      o.push({
        network: network.name,
        chainId: network.chainId,
        urls: {
          apiURL: network.urls.api,
          browserURL: network.urls.browser,
        },
      })
    }
    return o;
  }, [] as any)
}

export const GetSolidityCompilers = (versions: string[]) => {
  return versions.map(version => ({
    version,
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }))
}

export const GetDefaultConfig = (): HardhatUserConfig => ({
  solidity: {
    compilers: GetSolidityCompilers(["0.8.16", "0.8.9", "0.8.2", "0.6.0"]),
  },
  networks: GetNetworks([process.env.PRIVATE_KEY || '']),
  etherscan: {
    apiKey: {},
    customChains: GetEtherscanCustomChains()
  }
});
