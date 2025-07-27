const UserAuth = artifacts.require("UserAuth");

module.exports = function (deployer, network, accounts) {
  console.log("Deploying Admin UserAuth contract...");
  console.log("Network:", network);
  console.log("Deployer account:", accounts[0]);
  
  deployer.deploy(UserAuth).then(() => {
    console.log("Admin UserAuth deployed at:", UserAuth.address);
  });
};