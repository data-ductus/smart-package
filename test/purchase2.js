let AgreementDeliver = artifacts.require("./AgreementDeliver.sol");
let AgreementReturn = artifacts.require("./AgreementReturn.sol");
let AgreementData = artifacts.require("./AgreementData.sol");
let Dapp = artifacts.require("../DApp.sol");
let Token = artifacts.require("./Token.sol");
let Sale = artifacts.require("./Sale.sol");
let MinimalPurchase = artifacts.require("./MinimalPurchase.sol");

contract('purchase', function (accounts) {
  let agreementData;
  let agreementDeliver;
  let token;
  let c;
  let dapp;

  before(async function () {
    let value = 10000;
    const sale = await Sale.deployed();
    await sale.buyTokens(accounts[0], {from: accounts[0], value: value});
    await sale.buyTokens(accounts[1], {from: accounts[1], value: value});
    await sale.buyTokens(accounts[2], {from: accounts[2], value: value});
    dapp = await Dapp.deployed();
    agreementData = await AgreementData.deployed();
    agreementDeliver = await AgreementDeliver.deployed();
    token = await Token.deployed();
    await dapp.createMinimalPurchase(100, '',  -999, -999, -999, -999, -999, false);
    c = await dapp.getAllContracts.call();
  });
  it("should have the correct initial info", async function () {
    let cost = 100;
    const _seller = await agreementData.seller.call(c[0]);
    const _price = await agreementData.price.call(c[0]);
    assert.equal(_price, cost, "It does not cost 100");
    assert.equal(accounts[0], _seller, "The creator is not the seller");
  });
  it("should update price correctly", async function() {
    let newPrice = 200;

    await agreementData.setPrice(c[0], 200);
    let price = await agreementData.price(c[0]);
    assert.equal(price, newPrice, "It doesn't update price")
  });
  it("should abort correctly", async function() {
    await agreementDeliver.abort(c[0]);
    const state = await agreementData.state(c[0]);
    assert.equal(state.toNumber(), 10, "The state is not inactive (10)");
  });
});

contract('purchase-success', function(accounts) {
  let agreementData;
  let agreementDeliver;
  let token;
  let c;
  const maxTemp = 20;
  const minTemp = 10;
  const acceleration = 2;
  const humidity = 50;
  const pressure = 10000;
  const buyer = accounts[0];
  const seller = accounts[1];
  const delivery = accounts[2];
  const tempProvider = accounts[3];
  const accProvider = accounts[3];
  const humProvider = accounts[4];
  const pressProvider = accounts[5];
  const gpsProvider = accounts[6];
  const price = 100;

  before(async function () {
    let value = 10000;
    const sale = await Sale.deployed();
    await sale.buyTokens(accounts[0], {from: accounts[0], value: value});
    await sale.buyTokens(accounts[1], {from: accounts[1], value: value});
    await sale.buyTokens(accounts[2], {from: accounts[2], value: value});
    agreementData = await AgreementData.deployed();
    agreementDeliver = await AgreementDeliver.deployed();
    token = await Token.deployed();
    const dapp = await Dapp.deployed();
    await dapp.createMinimalPurchase(price, '', maxTemp, -999, acceleration, -999, -999, false, {from: seller});
    c = await dapp.getAllContracts.call();
    await token.approve(c[0], price, {from: buyer});
    await token.transfer(delivery, 1000, {from: buyer});
  });
  it("should add two proposals and specify terms", async function() {
    await agreementData.propose(c[0], 'Skellefteå', -999, minTemp, -999, humidity, pressure, true, {from: buyer});
    await agreementData.propose(c[0], 'Skellefteå', maxTemp, minTemp, acceleration, humidity, pressure, true, {from: accounts[2]});

    const proposals = await agreementData.getPotentialBuyers(c[0]);

    const maxSensor = await agreementData.getProposedTerms.call(c[0], 0, 0);
    const minSensor = await agreementData.getProposedTerms.call(c[0], 1, 0);
    const accSensor = await agreementData.getProposedTerms.call(c[0], 2, 0);
    const humSensor = await agreementData.getProposedTerms.call(c[0], 3, 0);
    const pressSensor = await agreementData.getProposedTerms.call(c[0], 4, 0);

    assert.equal(maxSensor[3], false, "The maximum temperature threshold was not set correctly");
    assert.equal(minSensor[0].toNumber(), minTemp, "The minimum temperature threshold was not set correctly");
    assert.equal(accSensor[3], false, "The acceleration threshold was not set correctly");
    assert.equal(humSensor[0].toNumber(), humidity, "The humidity threshold was not set correctly");
    assert.equal(pressSensor[0].toNumber(), pressure, "The pressure threshold was not set correctly");
    assert.equal(proposals.length, 2, "There should be two proposals");
    assert.equal(proposals[0], buyer, "The first potential buyer should have the correct address");
  });

  it("should transfer tokens, set correct buyer, combine terms and change state to locked", async function() {
    let tokens_before_buyer;
    let tokens_before_contract;
    let tokens_after_buyer;
    let tokens_after_contract;

    tokens_before_buyer = await token.balanceOf.call(buyer);
    tokens_before_contract = await token.balanceOf.call(c[0]);
    await agreementData.accept(c[0], 0, {from: seller});
    tokens_after_buyer = await token.balanceOf.call(buyer);
    tokens_after_contract = await token.balanceOf.call(c[0]);

    const maxSensor = await agreementData.getSensor.call(c[0], 0);
    const minSensor = await agreementData.getSensor.call(c[0], 1);
    const accSensor = await agreementData.getSensor.call(c[0], 2);
    const humSensor = await agreementData.getSensor.call(c[0], 3);
    const pressSensor = await agreementData.getSensor.call(c[0], 4);
    const gps = await agreementData.getSensor.call(c[0], 100);
    const state = await agreementData.state(c[0]);
    const _buyer = await agreementData.buyer(c[0]);
    const deliveryAddress = await agreementData.deliveryAddress(c[0], _buyer);

    assert.equal(maxSensor[0].toNumber(), maxTemp, "The maximum temperature threshold was not set correctly");
    assert.equal(minSensor[0].toNumber(), minTemp, "The minimum temperature threshold was not set correctly");
    assert.equal(accSensor[0].toNumber(), acceleration, "The acceleration threshold was not set correctly");
    assert.equal(humSensor[0].toNumber(), humidity, "The humidity threshold was not set correctly");
    assert.equal(pressSensor[0].toNumber(), pressure, "The pressure threshold was not set correctly");
    assert(gps[3], "The gps was not set correctly");
    assert.equal(tokens_after_buyer.toNumber(), tokens_before_buyer-price, "The tokens were not removed correctly from the buyer's account");
    assert.equal(tokens_after_contract.toNumber(), tokens_before_contract+price, "The tokens were not added correctly to the contract's account");
    assert.equal(state, 1, "The state is not locked (1)");
    assert.equal(_buyer, buyer, "It is not the correct buyer");
    assert.equal(deliveryAddress, "Skellefteå", "It is not the correct delivery address");
  });

  it("should set providers", async function() {

    await agreementData.setProvider(c[0], 0, {from: tempProvider});
    await agreementData.setProvider(c[0], 1, {from: tempProvider});
    await agreementData.setProvider(c[0], 2, {from: accProvider});
    await agreementData.setProvider(c[0], 3, {from: humProvider});
    await agreementData.setProvider(c[0], 4, {from: pressProvider});
    await agreementData.setGPSProvider(c[0], {from: gpsProvider});

    const maxSensor = await agreementData.getSensor.call(c[0], 0);
    const minSensor = await agreementData.getSensor.call(c[0], 1);
    const accSensor = await agreementData.getSensor.call(c[0], 2);
    const humSensor = await agreementData.getSensor.call(c[0], 3);
    const pressSensor = await agreementData.getSensor.call(c[0], 4);
    const gps = await agreementData.getSensor.call(c[0], 100);

    assert.equal(maxSensor[2], tempProvider, "The provider for maximum temperature was not set correctly");
    assert.equal(minSensor[2], tempProvider, "The provider for minimum temperature was not set correctly");
    assert.equal(accSensor[2], accProvider, "The provider for maximum acceleration was not set correctly");
    assert.equal(humSensor[2], humProvider, "The provider for maximum humidity was not set correctly");
    assert.equal(pressSensor[2], pressProvider, "The provider for maximum pressure was not set correctly");
    assert.equal(gps[2], gpsProvider, "The provider for gps was not set correctly");
  });

  it("should change state to transit", async function() {
    let tokens_before_delivery;
    let tokens_before_contract;
    let tokens_after_delivery;
    let tokens_after_contract;

    await token.approve(c[0], price, {from: delivery});

    tokens_before_delivery = await token.balanceOf.call(delivery);
    tokens_before_contract = await token.balanceOf.call(c[0]);
    await agreementDeliver.transport(c[0], "Stockholm", {from: delivery});
    tokens_after_delivery = await token.balanceOf.call(delivery);
    tokens_after_contract = await token.balanceOf.call(c[0]);
    const _state = await agreementData.state(c[0]);
    const _returnAddress = await agreementDeliver.returnAddress(c[0]);

    assert.equal(tokens_after_delivery.toNumber(), tokens_before_delivery-price, "The tokens were not removed correctly from the delivery company's account");
    assert.equal(tokens_after_contract.toNumber(), tokens_before_contract.toNumber()+price, "The tokens were not added correctly to the contract's account");
    assert.equal(_state, 2, "The state is not transit (2)");
    assert.equal(_returnAddress, "Stockholm", "The return address is not Stockholm");
  });
  it("should not set warning to true when under threshold for maximum temperature, humidity, pressure and acceleration", async function() {

    agreementData.sensorData(c[0], 0, maxTemp-1, {from: tempProvider})
      .then(function(r) {
        assert(false, "Lower temperature than threshold should have failed");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Lower temperature than threshold should have failed");
      });
    agreementData.sensorData(c[0], 2, acceleration-1, {from: accProvider})
      .then(function(r) {
        assert(false, "Lower acceleration than threshold should have failed");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Lower acceleration than threshold should have failed");
      });
    agreementData.sensorData(c[0], 3, humidity-1, {from: humProvider})
      .then(function(r) {
        assert(false, "Lower humidity than threshold should have failed");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Lower humidity than threshold should have failed");
      });
    agreementData.sensorData(c[0], 4, pressure-1, {from: pressProvider})
      .then(function(r) {
        assert(false, "Lower pressure than threshold should have failed");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Lower pressure than threshold should have failed");
      });
  });
  it("should not set warning to true when at least at threshold for minimum temperature", async function() {
    await agreementData.sensorData(c[0], 1, minTemp, {from: tempProvider})
      .then(function(r) {
          assert(false, "At least threshold temperature should have failed");
        },
        function (e) {
          assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "At least threshold temperature should have failed");
        });
  });
  it("should set warning to true when at least at threshold for maximum temperature and acceleration", async function() {

    await agreementData.sensorData(c[0], 0, maxTemp, {from: tempProvider});
    await agreementData.sensorData(c[0], 2, acceleration, {from: accProvider});
    await agreementData.sensorData(c[0], 3, humidity, {from: humProvider});
    await agreementData.sensorData(c[0], 4, pressure, {from: pressProvider});

    const maxSensor = await agreementData.getSensor.call(c[0], 0);
    const accSensor = await agreementData.getSensor.call(c[0], 2);
    const humSensor = await agreementData.getSensor.call(c[0], 3);
    const pressSensor = await agreementData.getSensor.call(c[0], 4);

    assert(maxSensor[1], "Warning on maximum temperature should be true");
    assert(accSensor[1], "Warning on maximum acceleration should be true");
    assert(humSensor[1], "Warning on maximum humidity should be true");
    assert(pressSensor[1], "Warning on maximum pressure should be true");
  });

  it("should set warning to true when under threshold for minimum temperature", async function() {

    await agreementData.sensorData(c[0], 1, minTemp-1, {from: tempProvider});

    const minSensor = await agreementData.getSensor.call(c[0], 1);

    assert(minSensor[1], "Warning on minimum temperature should be true");
  });
  it("should change state to confirm", async function() {
    await agreementDeliver.deliver(c[0], {from: delivery});
    const _state = await agreementData.state(c[0]);

    assert.equal(_state, 3, "The state is not confirm (3)")
  });
  it("should approve tokens to seller after timeout", async function() {
    await timeout(3000);
    await agreementDeliver.success(c[0]);
    const allowance = await token.allowance.call(c[0], seller);
    const allowance_d = await token.allowance.call(c[0], delivery);
    const _state = await agreementData.state(c[0]);

    assert.equal(allowance, price, "The seller should be allowed to retrieve the payment from the contract");
    assert.equal(allowance_d, price, "The delivery company should be allowed to retrieve their tokens from the contract");
    assert.equal(_state.toNumber(), 10, "The state should be inactive (10)");
  })
});

contract("purchase-decline", function(accounts) {
  let agreementData;
  let token;
  const buyer = accounts[0];
  const seller = accounts[1];
  const price = 0;
  let c;

  before(async function () {
    let value = 10000;
    const sale = await Sale.deployed();
    await sale.buyTokens(accounts[0], {from: accounts[0], value: value});
    await sale.buyTokens(accounts[1], {from: accounts[1], value: value});
    await sale.buyTokens(accounts[2], {from: accounts[2], value: value});
    agreementData = await AgreementData.deployed();
    const dapp = await Dapp.deployed();
    await dapp.createMinimalPurchase(price, '', -999, -999, -999, -999, -999, false, {from: seller});
    c = await dapp.getAllContracts.call();
    token = await Token.deployed();
    await agreementData.propose(c[0], 'Skellefteå', -999, -999, -999, -999, -999, false, {from: buyer});
  });
  it("should allow a seller to decline a proposal", async function () {
    await agreementData.decline(c[0], 0, {from: seller});

    const buyers = await agreementData.getPotentialBuyers(c[0]);
    assert.equal(buyers[0], 0x0, "The first proposal should be deleted")
  });
  it("should allow a potential buyer to delete one of their proposals", async function () {
    await agreementData.propose(c[0], 'Skellefteå', -999, -999, -999, -999, -999, false, {from: buyer});
    await agreementData.decline(c[0], 1, {from: buyer});

    const buyers = await agreementData.getPotentialBuyers(c[0]);
    assert.equal(buyers[1], 0x0, "The second proposal should be deleted")
  });

});

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
