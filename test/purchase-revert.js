let Purchase = artifacts.require("./Purchase.sol");
let Token = artifacts.require("./Token.sol");

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
