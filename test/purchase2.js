let Purchase = artifacts.require("./Purchase.sol");
let Purchase2 = artifacts.require("./Purchase2.sol");
let PurchaseData = artifacts.require("./PurchaseData.sol");
let Dapp = artifacts.require("../DApp.sol");
let Token = artifacts.require("./Token.sol");
let Sale = artifacts.require("./Sale.sol");
let MinimalPurchase = artifacts.require("./MinimalPurchase.sol");

contract('purchase', function (accounts) {
  let purchase;
  let token;
  let c;
  let data;

  before(async function () {
    let value = 10000;
    const sale = await Sale.deployed();
    await sale.buyTokens(accounts[0], {from: accounts[0], value: value});
    await sale.buyTokens(accounts[1], {from: accounts[1], value: value});
    await sale.buyTokens(accounts[2], {from: accounts[2], value: value});
    purchase = await Purchase.deployed();
    data = await PurchaseData.deployed();
    c = await MinimalPurchase.new(purchase.address);
    token = await Token.deployed();
    await purchase.setTokenAddress(token.address);
    await purchase.newPurchase(c.address, 100, accounts[0]);
  });
  it("should have the correct initial info", async function () {
    let cost = 100;
    const _seller = await data.seller(c.address);
    const _price = await data.price(c.address);
    assert.equal(_price, cost, "It does not cost 100");
    assert.equal(accounts[0], _seller, "The creator is not the seller");
  });
  it("should update price correctly", async function() {
    let newPrice = 200;

    await purchase.setPrice(c.address, 200);
    let price = await data.price(c.address);
    assert.equal(price, newPrice, "It doesn't update price")
  });
  it("should abort correctly", async function() {
    await purchase.abort(c.address);
    const state = await data.state(c.address);
    assert.equal(state, 9, "The state is not inactive (9)");
  });
});

contract('purchase-success', function(accounts) {
  let purchase;
  let purchase2;
  let data;
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
  const price = 100;

  before(async function () {
    let value = 10000;
    const sale = await Sale.deployed();
    await sale.buyTokens(accounts[0], {from: accounts[0], value: value});
    await sale.buyTokens(accounts[1], {from: accounts[1], value: value});
    await sale.buyTokens(accounts[2], {from: accounts[2], value: value});
    purchase = await Purchase.deployed();
    purchase2 = await Purchase2.deployed();
    data = await PurchaseData.deployed();
    token = await Token.deployed();
    const dapp = await Dapp.deployed();
    c = await MinimalPurchase.new(dapp.address, token.address);
    await purchase.setTokenAddress(token.address);
    await purchase.newPurchase(c.address, price, seller);
    await token.approve(c.address, price, {from: buyer});
    await token.transfer(delivery, 1000, {from: buyer});
  });
  it("should add two proposals and specify terms", async function() {
    await purchase.propose(c.address, 'Skellefteå', maxTemp, minTemp, acceleration, humidity, pressure, {from: buyer});
    await purchase.propose(c.address, 'Skellefteå', maxTemp, minTemp, acceleration, humidity, pressure, {from: accounts[2]});

    const proposals = await data.getPotentialBuyers(c.address);

    const maxSensor = await data.getProposedTerms.call(c.address, 'maxTemp', 0);
    const minSensor = await data.getProposedTerms.call(c.address, 'minTemp', 0);
    const accSensor = await data.getProposedTerms.call(c.address, 'acceleration', 0);
    const humSensor = await data.getProposedTerms.call(c.address, 'humidity', 0);
    const pressSensor = await data.getProposedTerms.call(c.address, 'pressure', 0);

    assert.equal(maxSensor[0].toNumber(), maxTemp, "The maximum temperature threshold was not set correctly");
    assert.equal(minSensor[0].toNumber(), minTemp, "The minimum temperature threshold was not set correctly");
    assert.equal(accSensor[0].toNumber(), acceleration, "The acceleration threshold was not set correctly");
    assert.equal(humSensor[0].toNumber(), humidity, "The humidity threshold was not set correctly");
    assert.equal(pressSensor[0].toNumber(), pressure, "The pressure threshold was not set correctly");
    assert.equal(proposals.length, 2, "There should be one proposals");
    assert.equal(proposals[0], buyer, "The first potential buyer should have the correct address");
  });

  it("should transfer tokens, set correct buyer and change state to locked", async function() {
    let tokens_before_buyer;
    let tokens_before_contract;
    let tokens_after_buyer;
    let tokens_after_contract;

    tokens_before_buyer = await token.balanceOf.call(buyer);
    tokens_before_contract = await token.balanceOf.call(c.address);
    await purchase.accept(c.address, 0, {from: seller});
    tokens_after_buyer = await token.balanceOf.call(buyer);
    tokens_after_contract = await token.balanceOf.call(c.address);

    const maxSensor = await data.getSensor.call(c.address, 'maxTemp');
    const minSensor = await data.getSensor.call(c.address, 'minTemp');
    const accSensor = await data.getSensor.call(c.address, 'acceleration');
    const humSensor = await data.getSensor.call(c.address, 'humidity');
    const pressSensor = await data.getSensor.call(c.address, 'pressure');
    const state = await data.state(c.address);
    const _buyer = await data.buyer(c.address);

    assert.equal(maxSensor[0].toNumber(), maxTemp, "The maximum temperature threshold was not set correctly");
    assert.equal(minSensor[0].toNumber(), minTemp, "The minimum temperature threshold was not set correctly");
    assert.equal(accSensor[0].toNumber(), acceleration, "The acceleration threshold was not set correctly");
    assert.equal(humSensor[0].toNumber(), humidity, "The humidity threshold was not set correctly");
    assert.equal(pressSensor[0].toNumber(), pressure, "The pressure threshold was not set correctly");
    assert.equal(tokens_after_buyer.toNumber(), tokens_before_buyer-price, "The tokens were not removed correctly from the buyer's account");
    assert.equal(tokens_after_contract.toNumber(), tokens_before_contract+price, "The tokens were not added correctly to the contract's account");
    assert.equal(state, 1, "The state is not locked (1)");
    assert.equal(_buyer, buyer, "It is not the correct buyer");
  });

  it("should set providers", async function() {

    await purchase.setProvider(c.address, "maxTemp", {from: tempProvider});
    await purchase.setProvider(c.address, "minTemp", {from: tempProvider});
    await purchase.setProvider(c.address, "acceleration", {from: accProvider});
    await purchase.setProvider(c.address, "humidity", {from: humProvider});
    await purchase.setProvider(c.address, "pressure", {from: pressProvider});

    const maxSensor = await data.getSensor.call(c.address, 'maxTemp');
    const minSensor = await data.getSensor.call(c.address, 'minTemp');
    const accSensor = await data.getSensor.call(c.address, 'acceleration');
    const humSensor = await data.getSensor.call(c.address, 'humidity');
    const pressSensor = await data.getSensor.call(c.address, 'pressure');

    assert.equal(maxSensor[2], tempProvider, "The provider for maximum temperature was not set correctly");
    assert.equal(minSensor[2], tempProvider, "The provider for minimum temperature was not set correctly");
    assert.equal(accSensor[2], accProvider, "The provider for maximum acceleration was not set correctly");
    assert.equal(humSensor[2], humProvider, "The provider for maximum humidity was not set correctly");
    assert.equal(pressSensor[2], pressProvider, "The provider for maximum pressure was not set correctly");
  });

  it("should change state to transit", async function() {
    let tokens_before_delivery;
    let tokens_before_contract;
    let tokens_after_delivery;
    let tokens_after_contract;

    await token.approve(c.address, price, {from: delivery});

    tokens_before_delivery = await token.balanceOf.call(delivery);
    tokens_before_contract = await token.balanceOf.call(c.address);
    await purchase.transport(c.address, "Stockholm", {from: delivery});
    tokens_after_delivery = await token.balanceOf.call(delivery);
    tokens_after_contract = await token.balanceOf.call(c.address);
    const _state = await data.state(c.address);
    const _returnAddress = await data.returnAddress(c.address);

    assert.equal(tokens_after_delivery.toNumber(), tokens_before_delivery-price, "The tokens were not removed correctly from the delivery company's account");
    assert.equal(tokens_after_contract.toNumber(), tokens_before_contract.toNumber()+price, "The tokens were not added correctly to the contract's account");
    assert.equal(_state, 2, "The state is not transit (2)");
    assert.equal(_returnAddress, "Stockholm", "The return address is not Stockholm");
  });
  it("should not set warning to true when under threshold for maximum temperature, humidity, pressure and acceleration", async function() {

    purchase.sensorData(c.address, "maxTemp", maxTemp-1, {from: tempProvider})
      .then(function(r) {
        assert(false, "Lower temperature than threshold should have failed");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Lower temperature than threshold should have failed");
      });
    purchase.sensorData(c.address, "acceleration", acceleration-1, {from: accProvider})
      .then(function(r) {
        assert(false, "Lower acceleration than threshold should have failed");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Lower acceleration than threshold should have failed");
      });
    purchase.sensorData(c.address, "humidity", humidity-1, {from: humProvider})
      .then(function(r) {
        assert(false, "Lower humidity than threshold should have failed");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Lower humidity than threshold should have failed");
      });
    purchase.sensorData(c.address, "pressure", pressure-1, {from: pressProvider})
      .then(function(r) {
        assert(false, "Lower pressure than threshold should have failed");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Lower pressure than threshold should have failed");
      });
  });
  it("should not set warning to true when at least at threshold for minimum temperature", async function() {
    await purchase.sensorData(c.address, "minTemp", minTemp, {from: tempProvider})
      .then(function(r) {
          assert(false, "At least threshold temperature should have failed");
        },
        function (e) {
          assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "At least threshold temperature should have failed");
        });
  });
  it("should set warning to true when at least at threshold for maximum temperature and acceleration", async function() {

    await purchase.sensorData(c.address, "maxTemp", maxTemp, {from: tempProvider});
    await purchase.sensorData(c.address, "acceleration", acceleration, {from: accProvider});
    await purchase.sensorData(c.address, "humidity", humidity, {from: humProvider});
    await purchase.sensorData(c.address, "pressure", pressure, {from: pressProvider});

    const maxSensor = await data.getSensor.call(c.address, 'maxTemp');
    const accSensor = await data.getSensor.call(c.address, 'acceleration');
    const humSensor = await data.getSensor.call(c.address, 'humidity');
    const pressSensor = await data.getSensor.call(c.address, 'pressure');

    assert(maxSensor[1], "Warning on maximum temperature should be true");
    assert(accSensor[1], "Warning on maximum acceleration should be true");
    assert(humSensor[1], "Warning on maximum humidity should be true");
    assert(pressSensor[1], "Warning on maximum pressure should be true");
  });

  it("should set warning to true when under threshold for minimum temperature", async function() {

    await purchase.sensorData(c.address, "minTemp", minTemp-1, {from: tempProvider});

    const minSensor = await data.getSensor.call(c.address, 'minTemp');

    assert(minSensor[1], "Warning on minimum temperature should be true");
  });
  it("should change state to confirm", async function() {
    await purchase.deliver(c.address, {from: delivery});
    const _state = await data.state(c.address);

    assert.equal(_state, 3, "The state is not confirm (3)")
  });
  it("should approve tokens to dissatisfied buyer", async function() {
    await purchase.satisfied(c.address, {from: buyer});
    const allowance = await token.allowance.call(c.address, seller);
    const _state = await data.state(c.address);

    assert.equal(allowance, price, "The seller should be allowed to retrieve the payment from the contract");
    assert.equal(_state, 9, "The state should be inactive (9)");
  })
});

contract("purchase-decline", function(accounts) {
  let purchase;
  let token;
  let data;
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
    purchase = await Purchase.deployed();
    data = await PurchaseData.deployed();
    c = await MinimalPurchase.new(purchase.address);
    token = await Token.deployed();
    await purchase.setTokenAddress(token.address);
    await purchase.newPurchase(c.address, price, seller);
    await purchase.propose(c.address, 'Skellefteå', 0, 0, 0, 0, 0, {from: buyer});
  });

  it("should decline correctly", async function () {
    await purchase.decline(c.address, 0, {from: seller});

    const buyers = await data.getPotentialBuyers(c.address);
    assert.equal(buyers[0], 0x0, "The first buyer should be deleted")
  })
});
