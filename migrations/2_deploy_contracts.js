const Token = artifacts.require("./Token/Token.sol");
const Purchase = artifacts.require("./Purchase/Purchase.sol");
const Purchase2 = artifacts.require("./Purchase/Purchase2.sol");
const PurchaseData = artifacts.require("./Purchase/PurchaseData.sol");
const Sensors = artifacts.require("./Purchase/SensorLibrary.sol");
const MinimalPurchase = artifacts.require("./Purchase/MinimalPurchase");
const DApp = artifacts.require("./DApp.sol");

module.exports = function(deployer) {
  deployer.deploy(Token);
  deployer.deploy(Sensors);
  deployer.link(Sensors, PurchaseData);
  deployer.link(Sensors, Purchase);
  deployer.link(Sensors, Purchase2);
  deployer.link(Sensors, DApp);
  deployer.deploy(Purchase, 0x0)
    .then(() => {
      deployer.deploy(Purchase2, 0x0)
        .then(() =>{
          Purchase.deployed()
            .then(p => {
              deployPurchaseData(deployer, p)
            })
        });
    });
  deployer.deploy(MinimalPurchase, 0x0);
};

const deployPurchaseData = function(deployer, p) {
  Purchase2.deployed()
    .then(p2 => {
      deployer.deploy(PurchaseData, p.address, p2.address)
        .then(() => {
          deployer.deploy(DApp, p.address, p2.address)
        });
    })
};
