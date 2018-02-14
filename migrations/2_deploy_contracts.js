var Token = artifacts.require("./Token/Token.sol");
var Purchase = artifacts.require("./Purchase/Purchase.sol");
var Sensors = artifacts.require("./Purchase/SensorLibrary.sol");

module.exports = function(deployer) {
  deployer.deploy(Token);
  deployer.deploy(Sensors);
  deployer.link(Sensors, Purchase);
  deployer.deploy(Purchase);
};
