import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying BookMyBlock contracts...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "MATIC");

  // Deploy BookMyBlockTicket contract
  const BookMyBlockTicket = await ethers.getContractFactory("BookMyBlockTicket");
  const ticket = await BookMyBlockTicket.deploy();
  await ticket.waitForDeployment();

  const ticketAddress = await ticket.getAddress();
  console.log("🎫 BookMyBlockTicket deployed to:", ticketAddress);

  // Verify deployment
  console.log("✅ Deployment completed successfully!");
  console.log("📋 Contract addresses:");
  console.log("   BookMyBlockTicket:", ticketAddress);
  
  // Save deployment info
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId,
    contracts: {
      BookMyBlockTicket: ticketAddress,
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };
  
  console.log("📄 Deployment info:", JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });