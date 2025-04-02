const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying ZetaVRF contract to ZetaChain testnet...");

  // Get the contract factory
  const ZetaVRF = await ethers.getContractFactory("ZetaVRF");
  
  // Deploy the contract
  const zetaVRF = await ZetaVRF.deploy();
  
  // Wait for deployment to finish
  await zetaVRF.waitForDeployment();

  const contractAddress = await zetaVRF.getAddress();
  console.log(`ZetaVRF deployed to: ${contractAddress}`);
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
