let AgreementData = artifacts.require("./AgreementData.sol");
let AgreementReturn = artifacts.require("./AgreementReturn.sol");
let AgreementDeliver = artifacts.require("./AgreementDeliver.sol");
let Token = artifacts.require("./Token.sol");
let Sale = artifacts.require("./Sale.sol");
let MinimalPurchase = artifacts.require("./MinimalPurchase.sol");
let Dapp = artifacts.require("./DApp.sol");
let Clerk = artifacts.require("./Clerk.sol");

contract('purchase-dissatisfied', function (accounts) {
  let agreementData;
  let agreementDeliver;
  let agreementReturn;
  let token;
  let c;
  let dapp;
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
    agreementData = await AgreementData.deployed();
    agreementDeliver = await AgreementDeliver.deployed();
    agreementReturn = await AgreementReturn.deployed();
    token = await Token.deployed();
    await dapp.createMinimalPurchase(100, '', -999, -999, -999, -999, -999, false, {from: seller});
    c = await dapp.getAllContracts();
    await token.approve(c[0], price, {from: buyer});
    await token.transfer(delivery, 1000, {from: buyer});
    await agreementData.propose(c[0], 'Skellefteå', maxTemp, -999, -999, -999, -999, false, {from: buyer});
    await agreementData.accept(c[0], 0, {from: seller});
    await agreementData.setProvider(c[0], 0, {from: tempProvider});
    await token.approve(c[0], price, {from: delivery});
    await agreementDeliver.transport(c[0], 'Stockholm', {from: delivery});
    await agreementDeliver.deliver(c[0], {from: delivery});
  });
  it("should change state to dissatisfied", async function () {
    await agreementDeliver.dissatisfied(c[0], {from: buyer});
    const _state = await agreementData.state(c[0]);

    assert.equal(_state, 4, "The state is not dissatisfied (4)");
  });
  it("should change state to return and approve tokens to buyer", async function () {
    await agreementReturn.transportReturn(c[0], {from: delivery});
    const _state = await agreementData.state(c[0]);

    assert.equal(_state, 5, "The state is not return (5)");
  });
  it("should send sensor data", async function () {
    await agreementData.sensorData(c[0], 0, maxTemp, {from: tempProvider});
    const tempSensor = await agreementData.getSensor(c[0], 0);

    assert(tempSensor[1], "warning should be true");
  });
  it("should deliver the goods", async function () {
    await agreementReturn.deliverReturn(c[0], {from: delivery});
    const _state = await agreementData.state(c[0]);

    assert.equal(_state, 6, "The state is not returned (6)");
  });
  it("should change state to review", async function () {
    await agreementReturn.goodsDamaged(c[0], {from: seller});
    const _state = await agreementData.state(c[0]);

    assert.equal(_state, 7, "The state is not review (7)");
  });
  it("should change state to clerk", async function () {
    await agreementReturn.clerk(c[0], 0, {from: delivery});
    const _state = await agreementData.state(c[0]);

    assert.equal(_state, 8, "The state is not clerk (8)");
  });
  it("should set state to appeal and propose a return to previous state", async function () {
    await agreementReturn.returnToPreviousState(c[0], {from: clerkAccount});
    const _state = await agreementData.state(c[0]);
    const _return = await agreementReturn.returnToPrevState(c[0]);

    assert(_return, "The clerk has not proposed a return to the previous state");
    assert.equal(_state, 9, "The state is not appeal (9)");
  });
  it("should reject a clerk solution", async function () {
    await agreementReturn.rejectClerkDecision(c[0], {from: seller});
    const _state = await agreementData.state(c[0]);

    assert.equal(_state, 8, "The state is not clerk (8)");
  });
  it("should increse clerk reward", async function () {
    await token.approve(c[0], 10, {from: seller});
    await agreementReturn.increaseClerkPayment(c[0], 10, {from: seller});
    const clerkPayment = await agreementReturn.clerkPayment(c[0]);

    assert.equal(clerkPayment, 10, "The clerk reward is not 10");
  });
  it("should split the money and set state to appeal", async function () {
    await agreementReturn.solve(c[0], price, price, 0, {from: clerkAccount});

    const allowance_seller = await agreementReturn.sellerTokens(c[0]);
    const allowance_buyer = await agreementReturn.buyerTokens(c[0]);
    const allowance_delivery = await agreementReturn.logisticsTokens(c[0]);
    const _state = await agreementData.state(c[0]);

    assert.equal(allowance_seller.toNumber(), price, "The seller is not allowed 100 tokens");
    assert.equal(allowance_buyer.toNumber(), price, "The seller is not allowed 100 tokens");
    assert.equal(allowance_delivery.toNumber(), 0, "The delivery company is not allowed 0 tokens");
    assert.equal(_state, 9, "The state is not appeal (9)")
  });
  it("should approve the promised tokens", async function () {
    await timeout(3000);
    await agreementReturn.finalizeClerkDecision(c[0], {from: seller});

    const allowance_seller = await token.allowance.call(c[0], seller);
    const allowance_buyer = await token.allowance.call(c[0], buyer);
    const allowance_delivery = await token.allowance.call(c[0], delivery);
    const allowance_clerk = await token.allowance.call(c[0], clerkAccount);
    const _state = await agreementData.state(c[0]);

    assert.equal(allowance_seller.toNumber(), price, "The seller is not allowed 100 tokens");
    assert.equal(allowance_buyer.toNumber(), price, "The seller is not allowed 100 tokens");
    assert.equal(allowance_delivery.toNumber(), 0, "The delivery company is not allowed 0 tokens");
    assert.equal(allowance_clerk.toNumber(), 10, "The clerk is not allowed 10 tokens");
    assert.equal(_state, 10, "The state is not inactive (10)")
  })
});

contract('purchase-dissatisfied-2', function (accounts) {
  let agreementData;
  let agreementDeliver;
  let agreementReturn;
  let token;
  let c;
  let dapp;
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
    agreementData = await AgreementData.deployed();
    agreementReturn = await AgreementReturn.deployed();
    agreementDeliver = await AgreementDeliver.deployed();
    token = await Token.deployed();
    await dapp.createMinimalPurchase(100, '', -999, -999, -999, -999, -999, false, {from: seller});
    c = await dapp.getAllContracts();
    await token.approve(c[0], price, {from: buyer});
    await token.transfer(delivery, 1000, {from: buyer});
    await agreementData.propose(c[0], 'Skellefteå', maxTemp, -999, -999, -999, -999, false, {from: buyer});
    await agreementData.accept(c[0], 0, {from: seller});
    await agreementData.setProvider(c[0], 0, {from: tempProvider});
    await token.approve(c[0], price, {from: delivery});
    await agreementDeliver.transport(c[0], 'Stockholm', {from: delivery});
    await agreementDeliver.deliver(c[0], {from: delivery});
    await agreementDeliver.dissatisfied(c[0], {from: buyer});
    await agreementReturn.transportReturn(c[0], {from: delivery});
    await agreementData.sensorData(c[0], 0, maxTemp, {from: tempProvider});
    await agreementReturn.deliverReturn(c[0], {from: delivery});
  });
  it("should return money to delivery company and set state to inactive", async function () {
    await timeout(3000);
    await agreementReturn.successReturn(c[0], {from: seller});
    const allowance_delivery = await token.allowance.call(c[0], delivery);
    const allowance_buyer = await token.allowance.call(c[0], buyer);
    const _state = await agreementData.state(c[0]);

    assert.equal(allowance_delivery.toNumber(), price, "The delivery company is not allowed to retrieve their tokens");
    assert.equal(allowance_buyer.toNumber(), price, "The buyer is not allowed to retrieve their tokens");
    assert.equal(_state, 10, "The state is not inactive (10)")
  })
});

contract('purchase-dissatisfied-3', function (accounts) {
  let agreementData;
  let agreementReturn;
  let agreementDeliver;
  let token;
  let c;
  let dapp;
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
    agreementData = await AgreementData.deployed();
    agreementReturn = await AgreementReturn.deployed();
    agreementDeliver = await AgreementDeliver.deployed();
    token = await Token.deployed();
    await dapp.createMinimalPurchase(100, '', -999, -999, -999, -999, -999, false, {from: seller});
    c = await dapp.getAllContracts();
    await token.approve(c[0], price, {from: buyer});
    await token.transfer(delivery, 1000, {from: buyer});
    await agreementData.propose(c[0], 'Skellefteå', maxTemp, -999, -999, -999, -999, false, {from: buyer});
    await agreementData.accept(c[0], 0, {from: seller});
    await agreementData.setProvider(c[0], 0, {from: tempProvider});
    await token.approve(c[0], price, {from: delivery});
    await agreementDeliver.transport(c[0], 'Skellefteå', {from: delivery});
    await agreementDeliver.deliver(c[0], {from: delivery});
    await agreementDeliver.dissatisfied(c[0], {from: buyer});
    await agreementReturn.transportReturn(c[0], {from: delivery});
    await agreementData.sensorData(c[0], 0, maxTemp, {from: tempProvider});
    await agreementReturn.deliverReturn(c[0], {from: delivery});
    await agreementReturn.goodsDamaged(c[0], {from: seller});
  });
  it("should return money to delivery company and set state to inactive", async function () {
    await agreementReturn.compensate(c[0], {from: delivery});
    const allowance_delivery = await token.allowance.call(c[0], seller);
    const allowance_buyer = await token.allowance.call(c[0], buyer);
    const _state = await agreementData.state(c[0]);

    assert.equal(allowance_delivery.toNumber(), price, "The seller is not allowed the compensation");
    assert.equal(allowance_buyer.toNumber(), price, "The buyer is not allowed to retrieve their tokens");
    assert.equal(_state, 10, "The state is not inactive (10)")
  });
});

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
