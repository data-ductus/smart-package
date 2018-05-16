const Token = artifacts.require("./Token/Token.sol");
const Sale = artifacts.require("./Sale/Sale.sol");
const AgreementData = artifacts.require("./Purchase/AgreementData.sol");
const AgreementReturn = artifacts.require("./Purchase/AgreementReturn.sol");
const AgreementDeliver = artifacts.require("./Purchase/AgreementDeliver.sol");
const Sensors = artifacts.require("./Purchase/SensorLibrary.sol");
const MinimalPurchase = artifacts.require("./Purchase/MinimalPurchase");
const DApp = artifacts.require("./DApp.sol");
const Voting = artifacts.require("./Voting/Clerk.sol");

module.exports = function(deployer) {
  deployer.then(async () => {
    await deployer.deploy(Token);
    const t = await Token.deployed();

    await deployer.deploy(Sensors);

    await deployer.deploy(Voting, t.address);
    const v = await Voting.deployed();

    await deployer.deploy(Sale, 1, '0x4e5a0425f5fa17af7a5dc94900d1253a48a9c7ea', t.address);
    const s = await Sale.deployed();
    await t.transferOwnership(s.address);

    await deployer.link(Sensors, AgreementData);
    await deployer.link(Sensors, AgreementDeliver);
    await deployer.link(Sensors, AgreementReturn);
    await deployer.link(Sensors, DApp);

    await deployer.deploy(AgreementDeliver);
    const a2 = await AgreementDeliver.deployed();

    await deployer.deploy(AgreementReturn, t.address, v.address, a2.address);
    const a3 = await AgreementReturn.deployed();

    await deployer.deploy(AgreementData, t.address, a2.address, a3.address);
    const a1 = await AgreementData.deployed();

    await deployer.deploy(DApp, a1.address, a2.address, a3.address, t.address);
    const d = await DApp.deployed();

    await deployer.deploy(MinimalPurchase, d.address, t.address);
  });
};

