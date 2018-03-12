let Purchase2 = artifacts.require("./Purchase2.sol");
let Token = artifacts.require("./Token.sol");
let MinimalPurchase = artifacts.require("./MinimalPurchase.sol");

contract('purchase', function (accounts) {
  let purchase;
  let token;
  let c;

  before(async function () {
    purchase = await Purchase2.deployed();
    c = await MinimalPurchase.new(purchase.address);
    token = await Token.deployed();
    await purchase.setTokenAddress(token.address);
    await purchase.newPurchase(c.address, 100, accounts[0]);
  });
  it("should have the correct initial info", async function () {
    let cost = 100;
    const info = await purchase.getPurchase(c.address);
    assert.equal(info[0], cost, "It does not cost 100");
    assert.equal(accounts[0], info[2], "The creator is not the seller");
  });
  it("should update price correctly", async function() {
    let newPrice = 200;

    await purchase.setPrice(c.address, 200);
    let info = await purchase.getPurchase(c.address);
    assert.equal(info[0], newPrice, "It doesn't update price")
  });
  it("should abort correctly", async function() {
    await purchase.abort(c.address);
    const info = await purchase.getPurchase(c.address);
    assert.equal(info[1], 4, "The state is not inactive (5)");
  });
});

contract('purchase-finish', function(accounts) {
  let purchase;
  let token;
  let c;
  const maxTemp = 20;
  const minTemp = 10;
  const acceleration = 2;
  const humidity = 50;
  const pressure = 10000;
  const buyer = accounts[0];
  const seller = accounts[1];
  const price = 100;

  before(async function () {
    purchase = await Purchase2.deployed();
    c = await MinimalPurchase.new(purchase.address);
    token = await Token.deployed();
    await purchase.setTokenAddress(token.address);
    await purchase.newPurchase(c.address, price, seller);
    await token.approve(c.address, price, {from: buyer});
  });
  it("should add two proposals and specify terms", async function() {
    await purchase.propose(c.address, 'Skellefteå', maxTemp, minTemp, acceleration, humidity, pressure, {from: buyer});
    await purchase.propose(c.address, 'Skellefteå', maxTemp, minTemp, acceleration, humidity, pressure, {from: accounts[2]});

    const proposals = await purchase.getPotentialBuyers(c.address);

    const maxSensor = await purchase.getSensor.call(c.address, 'maxTemp', 0);
    const minSensor = await purchase.getSensor.call(c.address, 'minTemp', 0);
    const accSensor = await purchase.getSensor.call(c.address, 'acceleration', 0);
    const humSensor = await purchase.getSensor.call(c.address, 'humidity', 0);
    const pressSensor = await purchase.getSensor.call(c.address, 'pressure', 0);

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

    const info = await purchase.getPurchase(c.address);

    assert.equal(tokens_after_buyer.toNumber(), tokens_before_buyer-price, "The tokens were not removed correctly from the buyer's account");
    assert.equal(tokens_after_contract.toNumber(), tokens_before_contract+price, "The tokens were not added correctly to the contract's account");
    assert.equal(info[1], 1, "The state is not locked (1)");
    assert.equal(info[3], buyer, "It is not the correct buyer");
    assert.equal(info[4], 0, "It is not the correct buyer index");
  });

  it("should set providers", async function() {
    const tempProvider = "temp";
    const accProvider = "acc";
    const humProvider = "hum";
    const pressProvider = "press";

    await purchase.setProvider(c.address, "maxTemp", tempProvider);
    await purchase.setProvider(c.address, "minTemp", tempProvider);
    await purchase.setProvider(c.address, "acceleration", accProvider);
    await purchase.setProvider(c.address, "humidity", humProvider);
    await purchase.setProvider(c.address, "pressure", pressProvider);

    const maxSensor = await purchase.getSensor.call(c.address, 'maxTemp', 0);
    const minSensor = await purchase.getSensor.call(c.address, 'minTemp', 0);
    const accSensor = await purchase.getSensor.call(c.address, 'acceleration', 0);
    const humSensor = await purchase.getSensor.call(c.address, 'humidity', 0);
    const pressSensor = await purchase.getSensor.call(c.address, 'pressure', 0);

    assert.equal(maxSensor[2], tempProvider, "The provider for maximum temperature was not set correctly");
    assert.equal(minSensor[2], tempProvider, "The provider for minimum temperature was not set correctly");
    assert.equal(accSensor[2], accProvider, "The provider for maximum acceleration was not set correctly");
    assert.equal(humSensor[2], humProvider, "The provider for maximum humidity was not set correctly");
    assert.equal(pressSensor[2], pressProvider, "The provider for maximum pressure was not set correctly");
  });

  it("should change state to transit", async function() {
    await purchase.transport(c.address);
    const info = await purchase.getPurchase(c.address);

    assert.equal(info[1], 2, "The state is not transit (2)");
  });
  it("should not set warning to true when under threshold for maximum temperature, humidity, pressure and acceleration", async function() {
    const tempProvider = "temp";
    const accProvider = "acc";
    const humProvider = "hum";
    const pressProvider = "press";

    purchase.sensorData(c.address, "maxTemp", tempProvider, maxTemp-1)
      .then(function(r) {
        assert(false, "Lower temperature than threshold should have failed");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Lower temperature than threshold should have failed");
      });
    purchase.sensorData(c.address, "acceleration", accProvider, acceleration-1)
      .then(function(r) {
        assert(false, "Lower acceleration than threshold should have failed");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Lower acceleration than threshold should have failed");
      });
    purchase.sensorData(c.address, "humidity", humProvider, humidity-1)
      .then(function(r) {
        assert(false, "Lower humidity than threshold should have failed");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Lower humidity than threshold should have failed");
      });
    purchase.sensorData(c.address, "pressure", pressProvider, pressure-1)
      .then(function(r) {
        assert(false, "Lower pressure than threshold should have failed");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Lower pressure than threshold should have failed");
      });
  });

  it("should not set warning to true when at least at threshold for minimum temperature", async function() {
    const tempProvider = "temp";

    await purchase.sensorData(c.address, "minTemp", tempProvider, minTemp)
      .then(function(r) {
          assert(false, "At least threshold temperature should have failed");
        },
        function (e) {
          assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "At least threshold temperature should have failed");
        });
  });
  it("should set warning to true when at least at threshold for maximum temperature and acceleration", async function() {
    const tempProvider = "temp";
    const accProvider = "acc";
    const humProvider = "hum";
    const pressProvider = "press";

    await purchase.sensorData(c.address, "maxTemp", tempProvider, maxTemp);
    await purchase.sensorData(c.address, "acceleration", accProvider, acceleration);
    await purchase.sensorData(c.address, "humidity", humProvider, humidity);
    await purchase.sensorData(c.address, "pressure", pressProvider, pressure);

    const maxSensor = await purchase.getSensor.call(c.address, 'maxTemp', 0);
    const accSensor = await purchase.getSensor.call(c.address, 'acceleration', 0);
    const humSensor = await purchase.getSensor.call(c.address, 'humidity', 0);
    const pressSensor = await purchase.getSensor.call(c.address, 'pressure', 0);

    assert(maxSensor[1], "Warning on maximum temperature should be true");
    assert(accSensor[1], "Warning on maximum acceleration should be true");
    assert(humSensor[1], "Warning on maximum humidity should be true");
    assert(pressSensor[1], "Warning on maximum pressure should be true");
  });

  it("should set warning to true when under threshold for minimum temperature", async function() {
    const tempProvider = "temp";

    await purchase.sensorData(c.address, "minTemp", tempProvider, minTemp-1);

    const minSensor = await purchase.getSensor.call(c.address, 'minTemp', 0);

    assert(minSensor[1], "Warning on minimum temperature should be true");
  });
  it("should change state to confirm", async function() {
    await purchase.deliver(c.address);
    const info = await purchase.getPurchase(c.address);

    assert.equal(info[1], 3, "The state is not confirm (3)")
  });
  it("should approve tokens to dissatisfied buyer", async function() {
    await purchase.dissatisfied(c.address, {from: buyer});
    const allowance = await token.allowance.call(c.address, buyer);
    const info = await purchase.getPurchase(c.address);

    assert.equal(allowance, price, "The buyer should be allowed to retrieve his/her tokens from the contract");
    assert.equal(info[1].toNumber(), 4, "The state should be inactive (4)");
  })
});

contract("purchase-decline", function(accounts) {
  let purchase;
  let token;
  const buyer = accounts[0];
  const seller = accounts[1];
  const price = 0;
  let c;

  before(async function () {
    purchase = await Purchase2.deployed();
    c = await MinimalPurchase.new(purchase.address);
    token = await Token.deployed();
    await purchase.setTokenAddress(token.address);
    await purchase.newPurchase(c.address, price, seller);
    await purchase.propose(c.address, 'Skellefteå', 0, 0, 0, 0, 0, {from: buyer});
  });

  it("should decline correctly", async function () {
    await purchase.decline(c.address, 0, {from: seller});

    const buyers = await purchase.getPotentialBuyers(c.address);
    assert.equal(buyers[0], 0x0, "The first buyer should be deleted")
  })
});
