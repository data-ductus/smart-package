let Dapp = artifacts.require("./DApp.sol");
let Purchase = artifacts.require("./Purchase.sol");
let PurchaseData = artifacts.require("./PurchaseData.sol");

contract('dapp', function (accounts) {
  it("should create a purchase contract", function () {
    let dapp;

    return Dapp.deployed().then(function (instance) {
      dapp = instance;
      return dapp.createMinimalPurchase(0, -999, -999, -999, -999, -999, false);
    }).then(function () {
      return dapp.getAllContracts();
    }).then(function (contracts) {
      assert.equal(contracts.length, 1, "Length of contracts wasn't 1");
      assert.ok(web3.isAddress(contracts[0]), "The contract is not an address");
    })
  });
  it("should return all contracts", function () {
    let dapp;

    return Dapp.deployed().then(function (instance) {
      dapp = instance;
      return dapp.createMinimalPurchase(0, -999, -999, -999, -999, -999, false, {from: accounts[1]});
    }).then(function () {
      return dapp.getAllContracts();
    }).then(function (contracts) {
      assert.equal(contracts.length, 2, "Length of contracts wasn't 2");
    })
  });
  it("should add clerks", async function () {
    const dapp = await Dapp.deployed();
    await dapp.addClerk(accounts[0]);
    await dapp.addClerk(accounts[1]);
    await dapp.addClerk(accounts[2]);
    const clerks = await dapp.getClerks();
    const isClerk = await dapp.isClerk(accounts[1]);

    assert(isClerk, "The second account should be a clerk");
    assert.equal(clerks[2], accounts[2], "The last clerk should be account 3");
    assert.equal(clerks.length, 3, "The length of the clerk array should be 3");
  });
});

contract('dapp-2', function (accounts) {
  let data;
  let c;
  let dapp;

  before(async function () {
    dapp = await Dapp.deployed();
    data = await PurchaseData.deployed();
    await dapp.createMinimalPurchase(100, -999, -999, -999, -999, -999, false);
    c = await dapp.getAllContracts();
  });
  it("should have the correct price", async function () {
    let cost = 100;
    const price = await data.price.call(c[0]);
    assert.equal(price.toNumber(), cost, "It does not cost 100");
  });
  it("should have the correct seller", async function () {
    const _seller = await data.seller.call(c[0]);
    assert.equal(accounts[0], _seller, "The creator is not the seller");
  });
});
