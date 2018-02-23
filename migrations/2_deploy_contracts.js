var Token = artifacts.require("./Token/Token.sol");
var Purchase = artifacts.require("./Purchase/Purchase.sol");
var Sensors = artifacts.require("./Purchase/SensorLibrary.sol");
var DApp = artifacts.require("./DApp.sol");

module.exports = function(deployer) {
  deployer.deploy(Token);
  deployer.deploy(Sensors);
  deployer.link(Sensors, Purchase);
  deployer.deploy(Purchase, 0, 0x0000000000000000000000000000000000000000);
  deployer.link(Sensors, DApp);
  deployer.deploy(DApp);
};
