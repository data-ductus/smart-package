let Purchase2 = artifacts.require("./Purchase2.sol");
let Token = artifacts.require("./Token.sol");
let MinimalPurchase = artifacts.require("./MinimalPurchase.sol");

contract('purchase-revert-wrong-state', function (accounts) {

  let purchase;
  const seller = accounts[1];
  const buyer = accounts[0];
  let c;

  before(async function () {
    purchase = await Purchase2.deployed();
    c = await MinimalPurchase.new(purchase.address);
    await purchase.newPurchase(c.address, 0, seller);
  });
  it("should revert set provider if not in locked", async function() {
    await purchase.setProvider(c.address, "", "")
      .then(function(r) {
        assert(false, "Set provider should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Set provider should revert");
      });
  });
  it("should revert transport if not in locked", async function() {
    await purchase.transport(c.address)
      .then(function(r) {
        assert(false, "Transport should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Transport should revert");
      });
  });
  it("should revert sensor data if not in transit", async function() {
    await purchase.sensorData(c.address, "", "", 1)
      .then(function(r) {
        assert(false, "Sensor data should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Sensor data should revert");
      });
  });
  it("should revert deliver if not in transit", async function() {
    await purchase.deliver(c.address)
      .then(function(r) {
        assert(false, "Deliver should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Deliver should revert");
      });
  });
  it("should revert satisfied if not in confirm", async function() {
    await purchase.satisfied(c.address, {from: buyer})
      .then(function(r) {
        assert(false, "Satisfied should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Satisfied should revert");
      });
  });
  it("should revert dissatisfied if not in confirm", async function() {
    await purchase.dissatisfied(c.address, {from: buyer})
      .then(function(r) {
        assert(false, "Dissatisfied should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Dissatisfied should revert");
      });
  });
});

contract('purchase-revert-wrong-state-2', function (accounts) {
  let purchase;
  const buyer = accounts[0];
  const seller = accounts[1];
  let c;

  before(async function () {
    purchase = await Purchase2.deployed();
    c = await MinimalPurchase.new(purchase.address);
    await purchase.newPurchase(c.address, 0, seller);
    await purchase.propose(c.address, 'Skellefteå', 0, 0, 0, 0, 0, {from: buyer});
    await purchase.accept(c.address, 0, {from: seller})
  });
  it("should revert set price if not in created", async function() {
    await purchase.setPrice(c.address, 10, {from: seller})
      .then(function(r) {
        assert(false, "Set price should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Set price should revert");
      });
  });
  it("should revert abort if not in created", async function() {
    await purchase.abort(c.address, {from: seller})
      .then(function(r) {
        assert(false, "Abort should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Abort should revert");
      });
  });
  it("should revert propose if not in created", async function() {
    await purchase.propose(c.address, 'Skellefteå', 0, 0, 0, 0, 0, {from: buyer})
      .then(function(r) {
        assert(false, "Propose should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Propose should revert");
      });
  });
});

contract("purchase-revert-wrong-sender", function (accounts) {
  let purchase;
  const buyer = accounts[0];
  const seller = accounts[1];
  let c;

  before(async function () {
    purchase = await Purchase2.deployed();
    c = await MinimalPurchase.new(purchase.address);
    await purchase.newPurchase(c.address, 0, seller);
  });
  it("should revert set price if not seller", async function() {
    await purchase.setPrice(c.address, 10, {from: buyer})
      .then(function(r) {
        assert(false, "Set price should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Set price should revert");
      });
  });
  it("should revert abort if not seller", async function() {
    await purchase.abort(c.address, {from: buyer})
      .then(function(r) {
        assert(false, "Abort should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Abort should revert");
      });
  });
  it("should revert propose if buyer", async function() {
    await purchase.propose(c.address, 'Skellefteå', 0, 0, 0, 0, 0, {from: seller})
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
  let c;

  before(async function () {
    purchase = await Purchase2.deployed();
    c = await MinimalPurchase.new(purchase.address);
    await purchase.newPurchase(c.address, 0, seller);
    await purchase.propose(c.address, 'Skellefteå', 0, 0, 0, 0, 0, {from: buyer});
  });
  it("should revert decline if not seller", async function() {
    await purchase.decline(c.address, 0, {from: buyer})
      .then(function(r) {
        assert(false, "Decline should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Decline should revert");
      });
  });
  it("should revert accept if not seller", async function() {
    await purchase.accept(c.address, 0, {from: buyer})
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
  let c;

  before(async function () {
    purchase = await Purchase2.deployed();
    c = await MinimalPurchase.new(purchase.address);
    await purchase.newPurchase(c.address, 0, seller);
    await purchase.propose(c.address, 'Skellefteå', 0, 0, 0, 0, 0, {from: buyer});
    await purchase.accept(c.address, 0, {from: seller});
    await purchase.transport(c.address);
    await purchase.deliver(c.address);
  });
  it("should revert satisfied if not buyer", async function() {
    await purchase.satisfied(c.address, {from: seller})
      .then(function(r) {
        assert(false, "Satisfied should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Satisfied should revert");
      });
  });
  it("should revert dissatisfied if not seller", async function() {
    await purchase.dissatisfied(c.address, {from: seller})
      .then(function(r) {
        assert(false, "Dissatisfied should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Dissatisfied should revert");
      });
  });
});

