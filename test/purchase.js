let Purchase = artifacts.require("./purchase.sol");
let Token = artifacts.require("./Token.sol");

contract('purchase-abort', function (accounts) {
  let purchase;

  before(async function () {
    purchase = await Purchase.new(100, accounts[0])
  });
  it("should have the correct price", function () {
    let cost = 100;
    return purchase.price().then(function (price) {
      assert.equal(price, cost, "It does not cost 100");
    })
  });
  it("should have the correct seller", function () {
    return purchase.seller().then(function (seller) {
      assert.equal(accounts[0], seller, "The creator is not the seller");
    })
  });
  it("should update price correctly", async function() {
    let newPrice = 200;

    await purchase.setPrice(200);
    let price = await purchase.price();
    assert.equal(price, newPrice, "It doesn't update price")
  });
  it("should abort correctly", async function() {
    await purchase.abort();
    const state = await purchase.state();
    assert.equal(state, 5, "The state is not inactive (5)");
  });
});

contract('purchase-finish', function(accounts) {
  let purchase;
  let token;
  const maxTemp = 20;
  const minTemp = 10;
  const acceleration = 2;
  const buyer = accounts[0];
  const price = 100;

  before(async function () {
    purchase = await Purchase.new(100, accounts[1]);
    token = await Token.deployed();
  });
  it("should transfer tokens, set sensors and change state to proposed", async function() {
    let tokens_before_buyer;
    let tokens_before_contract;
    let tokens_after_buyer;
    let tokens_after_contract;

    await token.approve(purchase.address, price, {from: buyer});
    tokens_before_buyer = await token.balanceOf(buyer);
    tokens_before_contract = await token.balanceOf(purchase.address);
    await purchase.propose(maxTemp, minTemp, acceleration);
    tokens_after_buyer = await token.balanceOf(buyer);
    tokens_after_contract = await token.balanceOf(purchase.address);
    const maxSensor = await purchase.getSensor('maxTemp');
    const minSensor = await purchase.getSensor('minTemp');
    const accSensor = await purchase.getSensor('acceleration');
    const state = await purchase.state();

    assert.equal(tokens_after_buyer, tokens_before_buyer.toNumber()-price, "The tokens were not removed correctly from the buyer's account");
    assert.equal(tokens_after_contract, tokens_before_contract.toNumber()+price, "The tokens were not added correctly to the contract's account");
    assert.equal(maxSensor[0], maxTemp, "The maximum temperature was not set correctly");
    assert.equal(minSensor[0], minTemp, "The minimum temperature was not set correctly");
    assert.equal(accSensor[0], acceleration, "The maximum acceleration was not set correctly");
    assert.equal(state, 1, "The state is not proposed (1)")
  });
  it("should change state to locked", async function() {
    await purchase.accept({from: accounts[1]});
    const state = await purchase.state();

    assert.equal(state, 2, "The state is not locked (2)");
  });
  it("should set providers", async function() {
    const tempProvider = "temp";
    const accProvider = "acc";

    await purchase.setProvider("maxTemp", tempProvider);
    await purchase.setProvider("minTemp", tempProvider);
    await purchase.setProvider("acceleration", accProvider);

    const maxSensor = await purchase.getSensor('maxTemp');
    const minSensor = await purchase.getSensor('minTemp');
    const accSensor = await purchase.getSensor('acceleration');

    assert.equal(maxSensor[2], tempProvider, "The provider for maximum temperature was not set correctly");
    assert.equal(minSensor[2], tempProvider, "The provider for minimum temperature was not set correctly");
    assert.equal(accSensor[2], accProvider, "The provider for maximum acceleration was not set correctly");
  });
  it("should change state to transit", async function() {
    await purchase.transport();
    const state = await purchase.state();

    assert.equal(state, 3, "The state is not transit (3)");
  });
  it("should not set warning to true when under threshold for maximum temperature and acceleration", async function() {
    const tempProvider = "temp";
    const accProvider = "acc";

    purchase.sensorData("maxTemp", tempProvider, maxTemp-1)
      .then(function(r) {
          assert(false, "Lower temperature than threshold should have failed");
        }, function (e) {
          assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Lower temperature than threshold should have failed");
        });
    purchase.sensorData("acceleration", accProvider, acceleration-1)
      .then(function(r) {
          assert(false, "Lower acceleration than threshold should have failed");
        }, function (e) {
          assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Lower acceleration than threshold should have failed");
        });
  });
  it("should not set warning to true when at least at threshold for minimum temperature", async function() {
    const tempProvider = "temp";

    await purchase.sensorData("minTemp", tempProvider, minTemp)
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

    await purchase.sensorData("maxTemp", tempProvider, maxTemp);
    await purchase.sensorData("acceleration", accProvider, acceleration);

    const maxSensor = await purchase.getSensor('maxTemp');
    const accSensor = await purchase.getSensor('acceleration');

    assert(maxSensor[1], "Warning on maximum temperature should be true");
    assert(accSensor[1], "Warning on maximum acceleration should be true");
  });
  it("should set warning to true when under threshold for minimum temperature", async function() {
    const tempProvider = "temp";

    await purchase.sensorData("minTemp", tempProvider, minTemp-1);

    const minSensor = await purchase.getSensor('minTemp');

    assert(minSensor[1], "Warning on minimum temperature should be true");
  });
  it("should change state to confirm", async function() {
    await purchase.deliver();
    const state = await purchase.state();

    assert.equal(state, 4, "The state is not confirm (4)")
  });
  it("should approve tokens to dissatisfied buyer", async function() {
    await purchase.dissatisfied({from: buyer});
    const allowance = await token.allowance(purchase.address, buyer);
    const state = await purchase.state();

    assert.equal(allowance, price, "The buyer should be allowed to retrieve his/her tokens from the contract");
    assert.equal(state, 5, "The state should be inactive (5)");
  })
});
