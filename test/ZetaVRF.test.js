const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ZetaVRF", function () {
  let zetaVRF;
  let owner;
  let addr1;
  
  beforeEach(async function () {
    // Get signers
    [owner, addr1] = await ethers.getSigners();
    
    // Deploy the contract
    const ZetaVRF = await ethers.getContractFactory("ZetaVRF");
    zetaVRF = await ZetaVRF.deploy();
    await zetaVRF.deployed();
  });
  
  it("Should request and fulfill a random number", async function () {
    // Request a random number
    const requestTx = await zetaVRF.requestRandomNumber();
    const receipt = await requestTx.wait();
    
    // Find the RequestRandomNumber event
    const requestEvent = receipt.events.find(e => e.event === "RandomNumberRequested");
    expect(requestEvent).to.not.be.undefined;
    
    const requestId = requestEvent.args.requestId;
    expect(requestId).to.equal(1);
    
    // Mine a new block to ensure we can fulfill the request
    await network.provider.send("evm_mine");
    
    // Fulfill the random number request
    const fulfillTx = await zetaVRF.fulfillRandomNumber(requestId);
    const fulfillReceipt = await fulfillTx.wait();
    
    // Find the RandomNumberGenerated event
    const generateEvent = fulfillReceipt.events.find(e => e.event === "RandomNumberGenerated");
    expect(generateEvent).to.not.be.undefined;
    
    // Get the random number
    const randomNumber = await zetaVRF.getRandomNumber(requestId);
    
    // Verify the random number
    const verified = await zetaVRF.verifyRandomNumber(requestId, randomNumber);
    expect(verified).to.be.true;
    
    console.log(`Generated Random Number: ${randomNumber}`);
  });
});
