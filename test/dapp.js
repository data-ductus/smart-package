let Dapp = artifacts.require("./DApp.sol");
let Purchase2 = artifacts.require("./Purchase2.sol");
let Token = artifacts.require("./Token.sol");
let MinimalPurchase = artifacts.require("./MinimalPurchase.sol");

contract('dapp', function (accounts) {
  it("should create a purchase contract", function () {
    let dapp;

    return Dapp.deployed().then(function (instance) {
      dapp = instance;
      return dapp.createMinimalPurchase(0);
    }).then(function () {
      return dapp.getUserContracts();
    }).then(function (contracts) {
      assert.equal(contracts.length, 1, "Length of contracts wasn't 1");
      assert.ok(web3.isAddress(contracts[0]), "The contract is not an address");
    })
  });
  it("should return all contracts", function () {
    let dapp;

    return Dapp.deployed().then(function (instance) {
      dapp = instance;
      return dapp.createMinimalPurchase(0, {from: accounts[1]});
    }).then(function () {
      return dapp.getAllContracts();
    }).then(function (contracts) {
      assert.equal(contracts.length, 2, "Length of contracts wasn't 2");
    })
  })
});

contract('dapp-2', function (accounts) {
  let purchase;
  let token;
  let c;
  let dapp;

  before(async function () {
    dapp = await Dapp.deployed();
    const address = await dapp.purchase2();
    purchase = await Purchase2.at(address);
    token = await Token.deployed();
    await purchase.setTokenAddress(token.address);
    await dapp.createMinimalPurchase(100);
    c = await dapp.getAllContracts();
  });
  it("should have the correct price", async function () {
    let cost = 100;
    const info = await purchase.getPurchase(c[0]);
    assert.equal(info[0].toNumber(), cost, "It does not cost 100");
  });
  it("should have the correct seller", async function () {
    const info = await purchase.getPurchase(c[0]);
    assert.equal(accounts[0], info[2], "The creator is not the seller");
  });
});
