const Token = artifacts.require("./Token/Token.sol");
//const Purchase = artifacts.require("./Purchase/Purchase.sol");
const Purchase2 = artifacts.require("./Purchase/Purchase2.sol");
const Sensors = artifacts.require("./Purchase/SensorLibrary.sol");
const PurchaseLibrary = artifacts.require("./Purchase/PurchaseLibrary");
const MinimalPurchase = artifacts.require("./Purchase/MinimalPurchase");
//const PurchaseUsingLibrary = artifacts.require("./Purchase/PurchaseUsingLibrary");
const DApp = artifacts.require("./DApp.sol");
//const test = artifacts.require("./test2variabler");

module.exports = function(deployer) {
  deployer.deploy(Token);
  deployer.deploy(Sensors);
  deployer.deploy(PurchaseLibrary);
  deployer.deploy(MinimalPurchase, 0x0);
  //deployer.link(Sensors, Purchase);
  deployer.link(Sensors, Purchase2);
  //deployer.link(PurchaseLibrary, Purchase);
  //deployer.link(PurchaseLibrary, PurchaseUsingLibrary);
  //deployer.deploy(Purchase, 0, 0x0000000000000000000000000000000000000000);
  deployer.deploy(Purchase2, 0x0);
  //deployer.deploy(PurchaseUsingLibrary, 0, 0x0000000000000000000000000000000000000000);
  deployer.link(Sensors, DApp);
  deployer.link(PurchaseLibrary, DApp);
  deployer.deploy(DApp);
  //deployer.deploy(test);
};
