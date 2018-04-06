let Purchase = artifacts.require("./Purchase.sol");
let Purchase2 = artifacts.require("./Purchase2.sol");
let PurchaseData = artifacts.require("./PurchaseData.sol");
let Token = artifacts.require("./Token.sol");
let Sale = artifacts.require("./Sale.sol");
let MinimalPurchase = artifacts.require("./MinimalPurchase.sol");
let Dapp = artifacts.require("./DApp.sol");
let Clerk = artifacts.require("./Clerk.sol");

contract('purchase-dissatisfied', function (accounts) {
  let purchase;
  let purchase2;
  let token;
  let c;
  let dapp;
  let clerk;
  let data;
  const maxTemp = 30;
  const buyer = accounts[0];
  const seller = accounts[1];
  const delivery = accounts[2];
  const price = 100;
  const tempProvider = accounts[3];
  const clerkAccount = accounts[4];

  const buyToken = async function() {
    let value = 10000;
    const sale = await Sale.deployed();
    const clerk = await Clerk.deployed();
    await sale.buyTokens(accounts[0], {from: accounts[0], value: value});
    await sale.buyTokens(accounts[1], {from: accounts[1], value: value});
    await sale.buyTokens(accounts[2], {from: accounts[2], value: value});
    await clerk.vote(clerkAccount, {from: buyer});
    await clerk.vote(clerkAccount, {from: seller});
    await clerk.becomeClerk({from: clerkAccount});
  };

  before(async function () {
    await buyToken();
    dapp = await Dapp.deployed();
    purchase = await Purchase.deployed();
    purchase2 = await Purchase2.deployed();
    data = await PurchaseData.deployed();
    token = await Token.deployed();
    await dapp.createMinimalPurchase(100, -999, -999, -999, -999, -999, false, {from: seller});
    c = await dapp.getAllContracts();
    await token.approve(c[0], price, {from: buyer});
    await token.transfer(delivery, 1000, {from: buyer});
    await purchase.propose(c[0], 'Skellefteå', maxTemp, -999, -999, -999, -999, false, {from: buyer});
    await purchase.accept(c[0], 0, {from: seller});
    await purchase.setProvider(c[0], "maxTemp", {from: tempProvider});
    await token.approve(c[0], price, {from: delivery});
    await purchase.transport(c[0], 'Stockholm', {from: delivery});
    await purchase.deliver(c[0], {from: delivery});
  });
  it("should change state to dissatisfied", async function () {
    await purchase.dissatisfied(c[0], {from: buyer});
    const _state = await data.state(c[0]);

    assert.equal(_state, 4, "The state is not dissatisfied (4)");
  });
  it("should change state to return and approve tokens to buyer", async function () {
    await purchase2.transportReturn(c[0], {from: delivery});
    const _state = await data.state(c[0]);

    assert.equal(_state, 5, "The state is not return (5)");
  });
  it("should send sensor data", async function () {
    await purchase.sensorData(c[0], "maxTemp", maxTemp, {from: tempProvider});
    const tempSensor = await data.getSensor(c[0], "maxTemp");

    assert(tempSensor[1], "warning should be true");
  });
  it("should deliver the goods", async function () {
    await purchase2.deliverReturn(c[0], {from: delivery});
    const _state = await data.state(c[0]);

    assert.equal(_state, 6, "The state is not returned (6)");
  });
  it("should change state to review", async function () {
    await purchase2.goodsDamaged(c[0], {from: seller});
    const _state = await data.state(c[0]);

    assert.equal(_state, 7, "The state is not review (7)");
  });
  it("should change state to clerk", async function () {
    await purchase2.clerk(c[0], {from: delivery});
    const _state = await data.state(c[0]);

    assert.equal(_state, 8, "The state is not review (8)");
  });
  it("should split the money and set state to inactive", async function () {
    await purchase2.solve(c[0], price, price, 0, {from: clerkAccount});

    const allowance_seller = await token.allowance.call(c[0], seller);
    const allowance_buyer = await token.allowance.call(c[0], buyer);
    const allowance_delivery = await token.allowance.call(c[0], delivery);
    const _state = await data.state(c[0]);

    assert.equal(allowance_seller.toNumber(), price, "The seller is not allowed 100 tokens");
    assert.equal(allowance_buyer.toNumber(), price, "The seller is not allowed 100 tokens");
    assert.equal(allowance_delivery.toNumber(), 0, "The delivery company is not allowed 0 tokens");
    assert.equal(_state, 9, "The state is not inactive (9)")
  });
});

contract('purchase-dissatisfied-2', function (accounts) {
  let purchase;
  let purchase2;
  let token;
  let c;
  let dapp;
  let data;
  const maxTemp = 30;
  const buyer = accounts[0];
  const seller = accounts[1];
  const delivery = accounts[2];
  const price = 100;
  const tempProvider = accounts[3];

  const buyToken = async function() {
    let value = 10000;
    const sale = await Sale.deployed();
    await sale.buyTokens(accounts[0], {from: accounts[0], value: value});
    await sale.buyTokens(accounts[1], {from: accounts[1], value: value});
    await sale.buyTokens(accounts[2], {from: accounts[2], value: value});
  };

  before(async function () {
    await buyToken();
    dapp = await Dapp.deployed();
    purchase = await Purchase.deployed();
    purchase2 = await Purchase2.deployed();
    data = await PurchaseData.deployed();
    token = await Token.deployed();
    await purchase.setTokenAddress(token.address);
    await dapp.createMinimalPurchase(100, -999, -999, -999, -999, -999, false, {from: seller});
    c = await dapp.getAllContracts();
    await token.approve(c[0], price, {from: buyer});
    await token.transfer(delivery, 1000, {from: buyer});
    await purchase.propose(c[0], 'Skellefteå', maxTemp, -999, -999, -999, -999, false, {from: buyer});
    await purchase.accept(c[0], 0, {from: seller});
    await purchase.setProvider(c[0], "maxTemp", {from: tempProvider});
    await token.approve(c[0], price, {from: delivery});
    await purchase.transport(c[0], 'Stockholm', {from: delivery});
    await purchase.deliver(c[0], {from: delivery});
    await purchase.dissatisfied(c[0], {from: buyer});
    await purchase2.transportReturn(c[0], {from: delivery});
    await purchase.sensorData(c[0], "maxTemp", maxTemp, {from: tempProvider});
    await purchase2.deliverReturn(c[0], {from: delivery});
  });
  it("should return money to delivery company and set state to inactive", async function () {
    await purchase2.sellerSatisfied(c[0], {from: seller});
    const allowance_delivery = await token.allowance.call(c[0], delivery);
    const allowance_buyer = await token.allowance.call(c[0], buyer);
    const _state = await data.state(c[0]);

    assert.equal(allowance_delivery.toNumber(), price, "The delivery company is not allowed to retrieve their tokens");
    assert.equal(allowance_buyer.toNumber(), price, "The buyer is not allowed to retrieve their tokens");
    assert.equal(_state, 9, "The state is not inactive (9)")
  })
});

contract('purchase-dissatisfied-3', function (accounts) {
  let purchase;
  let purchase2;
  let token;
  let c;
  let dapp;
  let data;
  const maxTemp = 30;
  const buyer = accounts[0];
  const seller = accounts[1];
  const delivery = accounts[2];
  const price = 100;
  const tempProvider = accounts[3];

  const buyToken = async function() {
    let value = 10000;
    const sale = await Sale.deployed();
    await sale.buyTokens(accounts[0], {from: accounts[0], value: value});
    await sale.buyTokens(accounts[1], {from: accounts[1], value: value});
    await sale.buyTokens(accounts[2], {from: accounts[2], value: value});
  };

  before(async function () {
    await buyToken();
    dapp = await Dapp.deployed();
    purchase = await Purchase.deployed();
    purchase2 = await Purchase2.deployed();
    data = await PurchaseData.deployed();
    token = await Token.deployed();
    await purchase.setTokenAddress(token.address);
    await dapp.createMinimalPurchase(100, -999, -999, -999, -999, -999, false, {from: seller});
    c = await dapp.getAllContracts();
    await token.approve(c[0], price, {from: buyer});
    await token.transfer(delivery, 1000, {from: buyer});
    await purchase.propose(c[0], 'Skellefteå', maxTemp, -999, -999, -999, -999, false, {from: buyer});
    await purchase.accept(c[0], 0, {from: seller});
    await purchase.setProvider(c[0], "maxTemp", {from: tempProvider});
    await token.approve(c[0], price, {from: delivery});
    await purchase.transport(c[0], 'Skellefteå', {from: delivery});
    await purchase.deliver(c[0], {from: delivery});
    await purchase.dissatisfied(c[0], {from: buyer});
    await purchase2.transportReturn(c[0], {from: delivery});
    await purchase.sensorData(c[0], "maxTemp", maxTemp, {from: tempProvider});
    await purchase2.deliverReturn(c[0], {from: delivery});
    await purchase2.goodsDamaged(c[0], {from: seller});
  });
  it("should return money to delivery company and set state to inactive", async function () {
    await purchase2.compensate(c[0], {from: delivery});
    const allowance_delivery = await token.allowance.call(c[0], seller);
    const allowance_buyer = await token.allowance.call(c[0], buyer);
    const _state = await data.state(c[0]);

    assert.equal(allowance_delivery.toNumber(), price, "The seller is not allowed the compensation");
    assert.equal(allowance_buyer.toNumber(), price, "The buyer is not allowed to retrieve their tokens");
    assert.equal(_state, 9, "The state is not inactive (9)")
  });
});
