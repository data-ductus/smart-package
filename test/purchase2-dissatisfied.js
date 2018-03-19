let Purchase2 = artifacts.require("./Purchase2.sol");
let Token = artifacts.require("./Token.sol");
let MinimalPurchase = artifacts.require("./MinimalPurchase.sol");
let Dapp = artifacts.require("./DApp.sol");

contract('purchase-dissatisfied', function (accounts) {
  let purchase;
  let token;
  let c;
  let dapp;
  const maxTemp = 30;
  const buyer = accounts[0];
  const seller = accounts[1];
  const delivery = accounts[2];
  const price = 100;
  const tempProvider = accounts[3];
  const clerk = accounts[4];

  before(async function () {
    dapp = await Dapp.deployed();
    const address = await dapp.purchase2();
    purchase = await Purchase2.at(address);
    token = await Token.deployed();
    await purchase.setTokenAddress(token.address);
    await dapp.createMinimalPurchase(100, {from: seller});
    c = await dapp.getAllContracts();
    await token.approve(c[0], price, {from: buyer});
    await token.transfer(delivery, 1000, {from: buyer});
    await purchase.propose(c[0], 'Skellefteå', maxTemp, -999, -999, -999, -999, {from: buyer});
    await purchase.accept(c[0], 0, {from: seller});
    await purchase.setProvider(c[0], "maxTemp", {from: tempProvider});
    await token.approve(c[0], price, {from: delivery});
    await purchase.transport(c[0], {from: delivery});
    await purchase.deliver(c[0], {from: delivery});
  });
  it("should change state to dissatisfied", async function () {
    await purchase.dissatisfied(c[0], {from: buyer});
    const info = await purchase.getPurchase(c[0]);

    assert.equal(info[1], 4, "The state is not dissatisfied (4)");
  });
  it("should change state to return and approve tokens to buyer", async function () {
    await purchase.transportReturn(c[0], {from: delivery});
    const info = await purchase.getPurchase(c[0]);
    const approved = await token.allowance.call(c[0], buyer);

    assert.equal(info[1], 5, "The state is not return (5)");
    assert.equal(approved.toNumber(), price, "The buyer is not allowed to retrieve the tokens");
  });
  it("should send sensor data", async function () {
    await purchase.sensorData(c[0], "maxTemp", maxTemp, {from: tempProvider});
    const tempSensor = await purchase.getActiveSensor(c[0], "maxTemp");

    assert(tempSensor[1], "warning should be true");
  });
  it("should deliver the goods", async function () {
    await purchase.deliverReturn(c[0], {from: delivery});
    const info = await purchase.getPurchase(c[0]);

    assert.equal(info[1], 6, "The state is not returned (6)");
  });
  it("should change state to review", async function () {
    await purchase.goodsDamaged(c[0], {from: seller});
    const info = await purchase.getPurchase(c[0]);

    assert.equal(info[1], 7, "The state is not review (7)");
  });
  it("should change state to clerk", async function () {
    await purchase.clerk(c[0], {from: delivery});
    const info = await purchase.getPurchase(c[0]);

    assert.equal(info[1], 8, "The state is not review (8)");
  });
  it("should split the money and set state to inactive", async function () {
    await dapp.addClerk(clerk);
    await purchase.solve(c[0], 3, 2, {from: clerk});

    const allowance_seller = await token.allowance.call(c[0], seller);
    const allowance_delivery = await token.allowance.call(c[0], delivery);
    const info = await purchase.getPurchase(c[0]);
 
    assert.equal(allowance_seller.toNumber(), Math.floor(2*price/3), "The seller is not allowed two thirds of the cost");
    assert.equal(allowance_delivery.toNumber(), price - Math.floor(2*price/3), "The delivery company is not allowed one third of the cost");
    assert.equal(info[1], 9, "The state is not inactive (9)")
  });
});

contract('purchase-dissatisfied-2', function (accounts) {
  let purchase;
  let token;
  let c;
  let dapp;
  const maxTemp = 30;
  const buyer = accounts[0];
  const seller = accounts[1];
  const delivery = accounts[2];
  const price = 100;
  const tempProvider = accounts[3];

  before(async function () {
    dapp = await Dapp.deployed();
    const address = await dapp.purchase2();
    purchase = await Purchase2.at(address);
    token = await Token.deployed();
    await purchase.setTokenAddress(token.address);
    await dapp.createMinimalPurchase(100, {from: seller});
    c = await dapp.getAllContracts();
    await token.approve(c[0], price, {from: buyer});
    await token.transfer(delivery, 1000, {from: buyer});
    await purchase.propose(c[0], 'Skellefteå', maxTemp, -999, -999, -999, -999, {from: buyer});
    await purchase.accept(c[0], 0, {from: seller});
    await purchase.setProvider(c[0], "maxTemp", {from: tempProvider});
    await token.approve(c[0], price, {from: delivery});
    await purchase.transport(c[0], {from: delivery});
    await purchase.deliver(c[0], {from: delivery});
    await purchase.dissatisfied(c[0], {from: buyer});
    await purchase.transportReturn(c[0], {from: delivery});
    await purchase.sensorData(c[0], "maxTemp", maxTemp, {from: tempProvider});
    await purchase.deliverReturn(c[0], {from: delivery});
  });
  it("should return money to delivery company and set state to inactive", async function () {
    await purchase.sellerSatisfied(c[0], {from: seller});
    const allowance_delivery = await token.allowance.call(c[0], delivery);
    const info = await purchase.getPurchase(c[0]);

    assert.equal(allowance_delivery.toNumber(), price, "The delivery company is not allowed to retrieve their tokens");
    assert.equal(info[1], 9, "The state is not inactive (9)")
  })
});

contract('purchase-dissatisfied-3', function (accounts) {
  let purchase;
  let token;
  let c;
  let dapp;
  const maxTemp = 30;
  const buyer = accounts[0];
  const seller = accounts[1];
  const delivery = accounts[2];
  const price = 100;
  const tempProvider = accounts[3];

  before(async function () {
    dapp = await Dapp.deployed();
    const address = await dapp.purchase2();
    purchase = await Purchase2.at(address);
    token = await Token.deployed();
    await purchase.setTokenAddress(token.address);
    await dapp.createMinimalPurchase(100, {from: seller});
    c = await dapp.getAllContracts();
    await token.approve(c[0], price, {from: buyer});
    await token.transfer(delivery, 1000, {from: buyer});
    await purchase.propose(c[0], 'Skellefteå', maxTemp, -999, -999, -999, -999, {from: buyer});
    await purchase.accept(c[0], 0, {from: seller});
    await purchase.setProvider(c[0], "maxTemp", {from: tempProvider});
    await token.approve(c[0], price, {from: delivery});
    await purchase.transport(c[0], {from: delivery});
    await purchase.deliver(c[0], {from: delivery});
    await purchase.dissatisfied(c[0], {from: buyer});
    await purchase.transportReturn(c[0], {from: delivery});
    await purchase.sensorData(c[0], "maxTemp", maxTemp, {from: tempProvider});
    await purchase.deliverReturn(c[0], {from: delivery});
    await purchase.goodsDamaged(c[0], {from: seller});
  });
  it("should return money to delivery company and set state to inactive", async function () {
    await purchase.compensate(c[0], {from: delivery});
    const allowance_delivery = await token.allowance.call(c[0], seller);
    const info = await purchase.getPurchase(c[0]);

    assert.equal(allowance_delivery.toNumber(), price, "The seller is not allowed the compensation");
    assert.equal(info[1], 9, "The state is not inactive (9)")
  });
});
