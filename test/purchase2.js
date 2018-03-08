let Purchase2 = artifacts.require("./Purchase2.sol");
let Token = artifacts.require("./Token.sol");
let MinimalPurchase = artifacts.require("./MinimalPurchase.sol");
let Dapp = artifacts.require("./DApp.sol");

contract('purchase-2', function (accounts) {
  let purchase;
  let token;
  let c;

  before(async function () {
    c = await MinimalPurchase.new();
    purchase = await Purchase2.deployed();
    token = await Token.deployed();
    await purchase.setTokenAddress(token.address);
    await purchase.newPurchase(c.address, 100, accounts[0]);
  });
  it("should have the correct price", async function () {
    let cost = 100;
    const info = await purchase.getPurchase(c.address);
    assert.equal(info[0], cost, "It does not cost 100");
  });
  it("should have the correct seller", async function () {
    const info = await purchase.getPurchase(c.address);
    console.log(info);
    assert.equal(accounts[0], info[2], "The creator is not the seller");
  });
  /*it("should update price correctly", async function() {
    let newPrice = 200;

    await purchase.setPrice(200);
    let price = await purchase.price();
    assert.equal(price, newPrice, "It doesn't update price")
  });
  it("should abort correctly", async function() {
    await purchase.abort();
    const state = await purchase.state();
    assert.equal(state, 5, "The state is not inactive (5)");
  });*/
});

contract('dapp-2', function (accounts) {
  let purchase;
  let token;
  let c;
  let dapp;

  before(async function () {
    dapp = await Dapp.deployed();
    purchase = await Purchase2.deployed();
    console.log('address', purchase.address);
    dapp.setPurchaseAddress(purchase.address);
    token = await Token.deployed();
    await purchase.setTokenAddress(token.address);
    await dapp.createMinimalPurchase(100);
    c = await dapp.getAllContracts();
    console.log('c', c);
  });
  it("should have the correct price", async function () {
    let cost = 100;
    const info = await purchase.getPurchase(c[0]);
    assert.equal(info[0], cost, "It does not cost 100");
  });
  it("should have the correct seller", async function () {
    const info = await purchase.getPurchase(c[0]);
    console.log(info);
    assert.equal(accounts[0], info[2], "The creator is not the seller");
  });
  /*it("should update price correctly", async function() {
    let newPrice = 200;

    await purchase.setPrice(200);
    let price = await purchase.price();
    assert.equal(price, newPrice, "It doesn't update price")
  });
  it("should abort correctly", async function() {
    await purchase.abort();
    const state = await purchase.state();
    assert.equal(state, 5, "The state is not inactive (5)");
  });*/
});
