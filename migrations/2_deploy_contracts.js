const Token = artifacts.require("./Token/Token.sol");
const Sale = artifacts.require("./Sale/Sale.sol");
const Purchase = artifacts.require("./Purchase/Purchase.sol");
const Purchase2 = artifacts.require("./Purchase/Purchase2.sol");
const PurchaseData = artifacts.require("./Purchase/PurchaseData.sol");
const Sensors = artifacts.require("./Purchase/SensorLibrary.sol");
const MinimalPurchase = artifacts.require("./Purchase/MinimalPurchase");
const DApp = artifacts.require("./DApp.sol");

module.exports = function(deployer) {
  deployer.then(async () => {
    await deployer.deploy(Token);
    await deployer.deploy(Sensors);
    const t = await Token.deployed();
    await deployer.deploy(Sale, 1, '0x4e5a0425f5fa17af7a5dc94900d1253a48a9c7ea', t.address);
    await deployer.link(Sensors, PurchaseData);
    await deployer.link(Sensors, Purchase);
    await deployer.link(Sensors, Purchase2);
    await deployer.link(Sensors, DApp);
    const s = await Sale.deployed();
    await t.transferOwnership(s.address);
    await deployer.deploy(Purchase, t.address);
    await deployer.deploy(Purchase2, t.address);
    const p1 = await Purchase.deployed();
    const p2 = await Purchase2.deployed();
    await deployer.deploy(PurchaseData, p1.address, p2.address);
    await deployer.deploy(DApp, p1.address, p2.address, t.address);
    const d = await DApp.deployed();
    await deployer.deploy(MinimalPurchase, d.address, t.address);
  });
};

const deployPurchaseData = function(deployer, p) {

};
