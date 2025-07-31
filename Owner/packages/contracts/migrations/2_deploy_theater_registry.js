const TheaterRegistry = artifacts.require("TheaterRegistry");

module.exports = function (deployer) {
  deployer.deploy(TheaterRegistry);
};