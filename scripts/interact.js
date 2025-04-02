const { ethers } = require("hardhat");

async function main() {
  // Contract address from environment or default
  const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0x1CEbee87b3E780fbA2A56AfA8CA543830d0c84A5";
  
  // Define the range for the random number
  const MIN_VALUE = BigInt(process.env.MIN || 0);
  const MAX_VALUE = BigInt(process.env.MAX || 200);
  const RANGE = MAX_VALUE - MIN_VALUE + BigInt(1); // +1 to include MAX_VALUE
  
  // Get the contract instance
  const ZetaVRF = await ethers.getContractFactory("ZetaVRF");
  const zetaVRF = await ZetaVRF.attach(CONTRACT_ADDRESS);
  
  console.log(`Requesting a random number that will be mapped to range ${MIN_VALUE}-${MAX_VALUE}...`);
  
  // Request a random number
  const requestTx = await zetaVRF.requestRandomNumber();
  console.log(`Transaction hash: ${requestTx.hash}`);
  
  // Wait for the transaction to be mined
  console.log("Waiting for transaction to be mined...");
  const receipt = await requestTx.wait();
  
  // Get the request ID from the event
  let requestId;
  const requestEvents = receipt.logs.map(log => {
    try {
      return zetaVRF.interface.parseLog(log);
    } catch (e) {
      return null;
    }
  }).filter(parsed => parsed && parsed.name === "RandomNumberRequested");
  
  if (requestEvents.length > 0) {
    requestId = requestEvents[0].args[0];
    console.log(`Random number requested with ID: ${requestId}`);
  } else {
    console.error("Failed to find RandomNumberRequested event");
    return;
  }
  
  // Wait for the next block to be mined
  console.log("Waiting 15 seconds for the next block to be mined...");
  await new Promise(resolve => setTimeout(resolve, 15000));
  
  // Fulfill the random number request
  console.log("Fulfilling the random number request...");
  const fulfillTx = await zetaVRF.fulfillRandomNumber(requestId);
  console.log(`Fulfillment transaction hash: ${fulfillTx.hash}`);
  
  // Wait for the fulfillment transaction to be mined
  console.log("Waiting for fulfillment to be mined...");
  const fulfillReceipt = await fulfillTx.wait();
  
  // Get the random number from the contract
  const fullRangeNumber = await zetaVRF.getRandomNumber(requestId);
  console.log(`Full range random number from contract: ${fullRangeNumber}`);
  
  // Map the full range random number to our desired range (0-200)
  const mappedNumber = MIN_VALUE + (fullRangeNumber % RANGE);
  console.log(`Mapped to range [${MIN_VALUE}-${MAX_VALUE}]: ${mappedNumber}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
