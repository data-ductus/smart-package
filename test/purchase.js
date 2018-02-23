let Purchase = artifacts.require("./Purchase.sol");
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
    purchase = await Purchase.new(price, accounts[1]);
    token = await Token.deployed();
    await purchase.setTokenAddress(token.address);
    await token.approve(purchase.address, price, {from: buyer});
  });
  it("should set sensors and change state to proposed", async function() {
    await purchase.propose(maxTemp, minTemp, acceleration);

    const maxSensor = await purchase.getSensor.call('maxTemp');
    const minSensor = await purchase.getSensor.call('minTemp');
    const accSensor = await purchase.getSensor.call('acceleration');
    const state = await purchase.state();

    assert.equal(maxSensor[0], maxTemp, "The maximum temperature was not set correctly");
    assert.equal(minSensor[0], minTemp, "The minimum temperature was not set correctly");
    assert.equal(accSensor[0], acceleration, "The maximum acceleration was not set correctly");
    assert.equal(state, 1, "The state is not proposed (1)")
  });
  it("should transfer tokens and change state to locked", async function() {
    let tokens_before_buyer;
    let tokens_before_contract;
    let tokens_after_buyer;
    let tokens_after_contract;

    tokens_before_buyer = await token.balanceOf.call(buyer);
    tokens_before_contract = await token.balanceOf.call(purchase.address);
    await purchase.accept({from: accounts[1]});
    tokens_after_buyer = await token.balanceOf.call(buyer);
    tokens_after_contract = await token.balanceOf.call(purchase.address);

    const state = await purchase.state();

    assert.equal(tokens_after_buyer.toNumber(), tokens_before_buyer-price, "The tokens were not removed correctly from the buyer's account");
    assert.equal(tokens_after_contract.toNumber(), tokens_before_contract+price, "The tokens were not added correctly to the contract's account");
    assert.equal(state, 2, "The state is not locked (2)");
  });
  it("should set providers", async function() {
    const tempProvider = "temp";
    const accProvider = "acc";

    await purchase.setProvider("maxTemp", tempProvider);
    await purchase.setProvider("minTemp", tempProvider);
    await purchase.setProvider("acceleration", accProvider);

    const maxSensor = await purchase.getSensor.call('maxTemp');
    const minSensor = await purchase.getSensor.call('minTemp');
    const accSensor = await purchase.getSensor.call('acceleration');

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

    const maxSensor = await purchase.getSensor.call('maxTemp');
    const accSensor = await purchase.getSensor.call('acceleration');

    assert(maxSensor[1], "Warning on maximum temperature should be true");
    assert(accSensor[1], "Warning on maximum acceleration should be true");
  });
  it("should set warning to true when under threshold for minimum temperature", async function() {
    const tempProvider = "temp";

    await purchase.sensorData("minTemp", tempProvider, minTemp-1);

    const minSensor = await purchase.getSensor.call('minTemp');

    assert(minSensor[1], "Warning on minimum temperature should be true");
  });
  it("should change state to confirm", async function() {
    await purchase.deliver();
    const state = await purchase.state();

    assert.equal(state, 4, "The state is not confirm (4)")
  });
  it("should approve tokens to dissatisfied buyer", async function() {
    await purchase.dissatisfied({from: buyer});
    const allowance = await token.allowance.call(purchase.address, buyer);
    const state = await purchase.state();

    assert.equal(allowance, price, "The buyer should be allowed to retrieve his/her tokens from the contract");
    assert.equal(state, 5, "The state should be inactive (5)");
  })
});

contract('purchase-revert-wrong-state', function (accounts) {
  let purchase;
  const seller = accounts[1];

  before(async function () {
    purchase = await Purchase.new(0, seller);
  });
  it("should revert decline if not in proposed", async function() {
    await purchase.decline({from: seller})
      .then(function(r) {
        assert(false, "Decline should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Decline should revert");
      });
  });
  it("should revert accept if not in proposed", async function() {
    await purchase.accept({from: seller})
      .then(function(r) {
        assert(false, "Decline should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Decline should revert");
      });
  });
});

contract('purchase-revert-wrong-state-2', function (accounts) {
  let purchase;
  const buyer = accounts[0];
  const seller = accounts[1];

  before(async function () {
    purchase = await Purchase.new(0, seller);
    await purchase.propose(0, 0, 0, {from: buyer});
  });
  it("should revert set price if not in created", async function() {
    await purchase.setPrice(10, {from: seller})
      .then(function(r) {
        assert(false, "Set price should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Set price should revert");
      });
  });
  it("should revert abort if not in created", async function() {
    await purchase.abort({from: seller})
      .then(function(r) {
        assert(false, "Abort should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Abort should revert");
      });
  });
  it("should revert propose if not in created", async function() {
    await purchase.propose(0, 0, 0, {from: buyer})
      .then(function(r) {
        assert(false, "Propose should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Propose should revert");
      });
  });
  it("should revert set provider if not in locked", async function() {
    await purchase.setProvider("", "")
      .then(function(r) {
        assert(false, "Set provider should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Set provider should revert");
      });
  });
  it("should revert transport if not in locked", async function() {
    await purchase.transport()
      .then(function(r) {
        assert(false, "Transport should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Transport should revert");
      });
  });
  it("should revert sensor data if not in transit", async function() {
    await purchase.sensorData("", "", 1)
      .then(function(r) {
        assert(false, "Sensor data should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Sensor data should revert");
      });
  });
  it("should revert deliver if not in transit", async function() {
    await purchase.deliver()
      .then(function(r) {
        assert(false, "Deliver should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Deliver should revert");
      });
  });
  it("should revert satisfied if not in confirm", async function() {
    await purchase.satisfied({from: buyer})
      .then(function(r) {
        assert(false, "Satisfied should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Satisfied should revert");
      });
  });
  it("should revert dissatisfied if not in confirm", async function() {
    await purchase.dissatisfied({from: buyer})
      .then(function(r) {
        assert(false, "Dissatisfied should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Dissatisfied should revert");
      });
  });
});

contract("purchase-revert-wrong-sender", function (accounts) {
  let purchase;
  const buyer = accounts[0];
  const seller = accounts[1];

  before(async function () {
    purchase = await Purchase.new(0, seller);
  });
  it("should revert set price if not seller", async function() {
    await purchase.setPrice(10, {from: buyer})
      .then(function(r) {
        assert(false, "Set price should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Set price should revert");
      });
  });
  it("should revert abort if not seller", async function() {
    await purchase.abort({from: buyer})
      .then(function(r) {
        assert(false, "Abort should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Abort should revert");
      });
  });
  it("should revert propose if buyer", async function() {
    await purchase.propose(0, 0, 0, {from: seller})
      .then(function(r) {
        assert(false, "Propose should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Propose should revert");
      });
  });
});

contract("purchase-revert-wrong-sender-2", function (accounts) {
  let purchase;
  const buyer = accounts[0];
  const seller = accounts[1];

  before(async function () {
    purchase = await Purchase.new(0, seller);
    await purchase.propose(0, 0, 0, {from: buyer});
  });
  it("should revert decline if not seller", async function() {
    await purchase.decline({from: buyer})
      .then(function(r) {
        assert(false, "Decline should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Decline should revert");
      });
  });
  it("should revert accept if not seller", async function() {
    await purchase.accept({from: buyer})
      .then(function(r) {
        assert(false, "Accept should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Accept should revert");
      });
  });
});

contract("purchase-revert-wrong-sender-3", function (accounts) {
  let purchase;
  const buyer = accounts[0];
  const seller = accounts[1];

  before(async function () {
    purchase = await Purchase.new(0, seller);
    const token = await Token.deployed();
    await purchase.setTokenAddress(token.address);
    await purchase.propose(0, 0, 0, {from: buyer});
    await purchase.accept({from: seller});
    await purchase.transport();
    await purchase.deliver();
  });
  it("should revert satisfied if not buyer", async function() {
    await purchase.satisfied({from: seller})
      .then(function(r) {
        assert(false, "Satisfied should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Satisfied should revert");
      });
  });
  it("should revert dissatisfied if not seller", async function() {
    await purchase.dissatisfied({from: seller})
      .then(function(r) {
        assert(false, "Dissatisfied should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Dissatisfied should revert");
      });
  });
});
