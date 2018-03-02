const Token = artifacts.require("./Token/Token.sol");
const Purchase = artifacts.require("./Purchase/Purchase.sol");
const Sensors = artifacts.require("./Purchase/SensorLibrary.sol");
const PurchaseLibrary = artifacts.require("./Purchase/PurchaseLibrary");
const DApp = artifacts.require("./DApp.sol");

module.exports = function(deployer) {
  deployer.deploy(Token);
  deployer.deploy(Sensors);
  deployer.deploy(PurchaseLibrary);
  deployer.link(Sensors, Purchase);
  deployer.link(PurchaseLibrary, Purchase);
  deployer.deploy(Purchase, 0, 0x0000000000000000000000000000000000000000);
  deployer.link(Sensors, DApp);
  deployer.deploy(DApp);
};
