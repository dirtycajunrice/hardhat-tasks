import { task } from 'hardhat/config';


task("token-uri", "Fetches the token metadata for the given token ID")
  .addParam("name", "The contract name to fetch metadata from")
  .addParam("tokenId", "The tokenID to fetch metadata for")
  .setAction(async ({ name, tokenId }, hre) => {
    const contract = await hre.dcr.getContract(name);
    const metadata = await contract.tokenURI(tokenId);
    console.log(JSON.stringify(metadata, null, 2))
  });

task("getUpgradeDetails", "Get the admin and implementation address of a deployed proxy")
  .addParam("name", 'Name of the contract')
  .setAction(async ({ address }, hre) => {
    if (!(String(hre.network.config.chainId) in hre.dcr.contractsData)) {
      return console.error(`No contracts found for chainId ${hre.network.config.chainId}`);
    }
    const found = Object.entries(hre.dcr.contractsData[String(hre.network.config.chainId)])
      .find(([proxy]) => proxy.toLowerCase() === address.toLowerCase());
    if (!found) {
      return console.error(`No proxy found for address ${address} on chainId ${hre.network.config.chainId}`);
    }
    const [proxy, { name, impl, admin}] = found;
    console.log("Name:", name)
    console.log("Proxy:", proxy)
    if (admin) {
      console.log("Admin:", admin)
    }
    console.log("Impl:", impl)
    return { address: proxy, admin, impl }
  });
