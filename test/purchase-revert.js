let Purchase = artifacts.require("./Purchase.sol");
let Purchase2 = artifacts.require("./Purchase2.sol");
let PurchaseData = artifacts.require("./PurchaseData.sol");
let Token = artifacts.require("./Token.sol");
let MinimalPurchase = artifacts.require("./MinimalPurchase.sol");
let Dapp = artifacts.require("./DApp.sol");

contract('purchase-revert-wrong-state', function (accounts) {
  let dapp;
  let purchase;
  let purchase2;
  let data;
  const seller = accounts[1];
  const buyer = accounts[0];
  const delivery = accounts[2];
  const clerk = accounts[4];
  let c;

  before(async function () {
    dapp = await Dapp.deployed();
    purchase = await Purchase.deployed();
    purchase2 = await Purchase2.deployed();
    data = await PurchaseData.deployed();
    await dapp.createMinimalPurchase(0, {from: seller});
    c = await dapp.getAllContracts();
    await dapp.addClerk(clerk);
  });
  it("should revert set provider if not in locked", async function() {
    await purchase.setProvider(c[0], "", {from: accounts[3]})
      .then(function(r) {
        assert(false, "Set provider should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Set provider should revert");
      });
  });
  it("should revert transport if not in locked", async function() {
    await purchase.transport(c[0], 'Stockholm',  {from: delivery})
      .then(function(r) {
        assert(false, "Transport should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Transport should revert");
      });
  });
  it("should revert sensor data if not in transit", async function() {
    await purchase.sensorData(c[0], "", 1, {from: accounts[3]})
      .then(function(r) {
        assert(false, "Sensor data should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Sensor data should revert");
      });
  });
  it("should revert deliver if not in transit", async function() {
    await purchase.deliver(c[0], {from: delivery})
      .then(function(r) {
        assert(false, "Deliver should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Deliver should revert");
      });
  });
  it("should revert satisfied if not in confirm", async function() {
    await purchase.satisfied(c[0], {from: buyer})
      .then(function(r) {
        assert(false, "Satisfied should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Satisfied should revert");
      });
  });
  it("should revert dissatisfied if not in confirm", async function() {
    await purchase.dissatisfied(c[0], {from: buyer})
      .then(function(r) {
        assert(false, "Dissatisfied should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Dissatisfied should revert");
      });
  });
  it("should revert transport return if not in dissatisfied", async function() {
    await purchase2.transportReturn(c[0], {from: delivery})
      .then(function(r) {
        assert(false, "Transport return should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Transport return should revert");
      });
  });
  it("should revert deliver return if not in return", async function() {
    await purchase2.deliverReturn(c[0], {from: delivery})
      .then(function(r) {
        assert(false, "Delivery return should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Delivery return should revert");
      });
  });
  it("should revert seller satisfied if not in return", async function() {
    await purchase2.sellerSatisfied(c[0], {from: seller})
      .then(function(r) {
        assert(false, "Seller satisfied should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Seller satisfied should revert");
      });
  });
  it("should revert goods damaged if not in return", async function() {
    await purchase2.goodsDamaged(c[0], {from: seller})
      .then(function(r) {
        assert(false, "Goods damaged should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Goods damaged should revert");
      });
  });
  it("should revert compensate if not in return", async function() {
    await purchase2.compensate(c[0], {from: delivery})
      .then(function(r) {
        assert(false, "Compensate should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Compensate damaged should revert");
      });
  });
  it("should revert clerk if not in return", async function() {
    await purchase2.clerk(c[0], {from: delivery})
      .then(function(r) {
        assert(false, "Clerk should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Clerk should revert");
      });
  });
  it("should revert solve if not in return", async function() {
    await purchase2.solve(c[0], 0, 0, 0, {from: clerk})
      .then(function(r) {
        assert(false, "Solve should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Solve should revert");
      });
  });
});

contract('purchase-revert-wrong-state-2', function (accounts) {
  let purchase;
  let dapp;
  const buyer = accounts[0];
  const seller = accounts[1];
  let c;

  before(async function () {
    dapp = await Dapp.deployed();
    purchase = await Purchase.deployed();
    await dapp.createMinimalPurchase(0, {from: seller});
    c = await dapp.getAllContracts();
    await purchase.newPurchase(c[0], 0, seller);
    await purchase.propose(c[0], 'Skellefteå', 0, 0, 0, 0, 0, {from: buyer});
    await purchase.accept(c[0], 0, {from: seller})
  });
  it("should revert set price if not in created", async function() {
    await purchase.setPrice(c[0], 10, {from: seller})
      .then(function(r) {
        assert(false, "Set price should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Set price should revert");
      });
  });
  it("should revert abort if not in created", async function() {
    await purchase.abort(c[0], {from: seller})
      .then(function(r) {
        assert(false, "Abort should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Abort should revert");
      });
  });
  it("should revert propose if not in created", async function() {
    await purchase.propose(c[0], 'Skellefteå', 0, 0, 0, 0, 0, {from: buyer})
      .then(function(r) {
        assert(false, "Propose should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Propose should revert");
      });
  });
});

contract("purchase-revert-wrong-sender", function (accounts) {
  let purchase;
  let dapp;
  const buyer = accounts[0];
  const seller = accounts[1];
  let c;

  before(async function () {
    dapp = await Dapp.deployed();
    purchase = await Purchase.deployed();
    await dapp.createMinimalPurchase(0, {from: seller});
    c = await dapp.getAllContracts();
    await purchase.newPurchase(c[0], 0, seller);
  });
  it("should revert set price if not seller", async function() {
    await purchase.setPrice(c[0], 10, {from: buyer})
      .then(function(r) {
        assert(false, "Set price should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Set price should revert");
      });
  });
  it("should revert abort if not seller", async function() {
    await purchase.abort(c[0], {from: buyer})
      .then(function(r) {
        assert(false, "Abort should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Abort should revert");
      });
  });
  it("should revert propose if buyer", async function() {
    await purchase.propose(c[0], 'Skellefteå', 0, 0, 0, 0, 0, {from: seller})
      .then(function(r) {
        assert(false, "Propose should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Propose should revert");
      });
  });
});

contract("purchase-revert-wrong-sender-2", function (accounts) {
  let purchase;
  let dapp;
  const buyer = accounts[0];
  const seller = accounts[1];
  let c;

  before(async function () {
    dapp = await Dapp.deployed();
    purchase = await Purchase.deployed();
    await dapp.createMinimalPurchase(0, {from: seller});
    c = await dapp.getAllContracts();
    await purchase.newPurchase(c[0], 0, seller);
    await purchase.propose(c[0], 'Skellefteå', 0, 0, 0, 0, 0, {from: buyer});
  });
  it("should revert decline if not seller", async function() {
    await purchase.decline(c[0], 0, {from: buyer})
      .then(function(r) {
        assert(false, "Decline should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Decline should revert");
      });
  });
  it("should revert accept if not seller", async function() {
    await purchase.accept(c[0], 0, {from: buyer})
      .then(function(r) {
        assert(false, "Accept should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Accept should revert");
      });
  });
});

contract("purchase-revert-wrong-sender-3", function (accounts) {
  let purchase;
  let dapp;
  const buyer = accounts[0];
  const seller = accounts[1];
  const delivery = accounts[2];
  let c;

  before(async function () {
    dapp = await Dapp.deployed();
    purchase = await Purchase.deployed();
    await dapp.createMinimalPurchase(0, {from: seller});
    c = await dapp.getAllContracts();
    await purchase.newPurchase(c[0], 0, seller);
    await purchase.propose(c[0], 'Skellefteå', 0, 0, 0, 0, 0, {from: buyer});
    await purchase.accept(c[0], 0, {from: seller});
    await purchase.transport(c[0], 'Stockholm', {from: delivery});
    await purchase.deliver(c[0], {from: delivery});
  });
  it("should revert satisfied if not buyer", async function() {
    await purchase.satisfied(c[0], {from: seller})
      .then(function(r) {
        assert(false, "Satisfied should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Satisfied should revert");
      });
  });
  it("should revert dissatisfied if not buyer", async function() {
    await purchase.dissatisfied(c[0], {from: seller})
      .then(function(r) {
        assert(false, "Dissatisfied should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Dissatisfied should revert");
      });
  });
});

contract("purchase-revert-wrong-sender-4", function (accounts) {
  let purchase;
  let purchase2;
  let dapp;
  const buyer = accounts[0];
  const seller = accounts[1];
  const delivery = accounts[2];
  let c;

  before(async function () {
    dapp = await Dapp.deployed();
    purchase = await Purchase.deployed();
    purchase2 = await Purchase2.deployed();
    await dapp.createMinimalPurchase(0, {from: seller});
    c = await dapp.getAllContracts();
    await purchase.newPurchase(c[0], 0, seller);
    await purchase.propose(c[0], 'Skellefteå', 0, 0, 0, 0, 0, {from: buyer});
    await purchase.accept(c[0], 0, {from: seller});
    await purchase.transport(c[0], 'Stockholm', {from: delivery});
    await purchase.deliver(c[0], {from: delivery});
    await purchase.dissatisfied(c[0], {from: buyer});
  });
  it("should revert transport return if not delivery", async function() {
    await purchase2.transportReturn(c[0], {from: seller})
      .then(function(r) {
        assert(false, "Transport return should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Transport return should revert");
      });
  });
  it("should revert deliver return if not delivery", async function() {
    await purchase2.transportReturn(c[0], {from: delivery});
    await purchase2.deliverReturn(c[0], {from: seller})
      .then(function(r) {
        assert(false, "Delivery return should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Delivery return should revert");
      });
  });
});

contract("purchase-revert-wrong-sender-5", function (accounts) {
  let purchase;
  let purchase2;
  let dapp;
  const buyer = accounts[0];
  const seller = accounts[1];
  const delivery = accounts[2];
  let c;

  before(async function () {
    dapp = await Dapp.deployed();
    purchase = await Purchase.deployed();
    purchase2 = await Purchase2.deployed();
    await dapp.createMinimalPurchase(0, {from: seller});
    c = await dapp.getAllContracts();
    await purchase.newPurchase(c[0], 0, seller);
    await purchase.propose(c[0], 'Skellefteå', 0, 0, 0, 0, 0, {from: buyer});
    await purchase.accept(c[0], 0, {from: seller});
    await purchase.transport(c[0], 'Stockholm', {from: delivery});
    await purchase.deliver(c[0], {from: delivery});
    await purchase.dissatisfied(c[0], {from: buyer});
    await purchase2.transportReturn(c[0], {from: delivery});
    await purchase2.deliverReturn(c[0], {from: delivery});
  });
  it("should revert seller satisfied if not seller", async function() {
    await purchase2.sellerSatisfied(c[0], {from: delivery})
      .then(function(r) {
        assert(false, "Seller satisfied should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Seller satisfied should revert");
      });
  });
  it("should revert goods damaged if not seller", async function() {
    await purchase2.goodsDamaged(c[0], {from: buyer})
      .then(function(r) {
        assert(false, "Goods damaged should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Goods damaged should revert");
      });
  });
  /*it("should revert goods damaged if no warnings", async function () {
    await purchase2.goodsDamaged(c[0], {from: seller})
      .then(function(r) {
        assert(false, "Goods damaged should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Goods damaged should revert");
      });
  })*/
});

contract("purchase-revert-wrong-sender-6", function (accounts) {
  let purchase;
  let purchase2;
  let dapp;
  const buyer = accounts[0];
  const seller = accounts[1];
  const delivery = accounts[2];
  const tempProvider = accounts[3];
  const clerk = accounts[4];
  const maxTemp = 20;
  let c;

  before(async function () {
    dapp = await Dapp.deployed();
    purchase = await Purchase.deployed();
    purchase2 = await Purchase2.deployed();
    await dapp.createMinimalPurchase(0, {from: seller});
    c = await dapp.getAllContracts();
    dapp.addClerk(clerk);
    await purchase.propose(c[0], 'Skellefteå', maxTemp, 0, 0, 0, 0, {from: buyer});
    await purchase.accept(c[0], 0, {from: seller});
    await purchase.setProvider(c[0], "maxTemp", {from: tempProvider});
    await purchase.transport(c[0], 'Stockholm', {from: delivery});
    await purchase.sensorData(c[0], "maxTemp", maxTemp, {from: tempProvider});
    await purchase.deliver(c[0], {from: delivery});
    await purchase.dissatisfied(c[0], {from: buyer});
    await purchase2.transportReturn(c[0], {from: delivery});
    await purchase2.deliverReturn(c[0], {from: delivery});
    await purchase2.goodsDamaged(c[0], {from: seller});
  });
  it("should revert compensate if not delivery", async function() {
    await purchase2.compensate(c[0], {from: seller})
      .then(function(r) {
        assert(false, "Compensate should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Compensate should revert");
      });
  });
  it("should revert clerk if not delivery", async function() {
    await purchase2.clerk(c[0], {from: seller})
      .then(function(r) {
        assert(false, "Clerk should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Clerk should revert");
      });
  });
  it("should revert solve if not clerk", async function() {
    await purchase2.clerk(c[0], {from: delivery});
    await purchase2.solve(c[0], 0, 0, 0, {from: seller})
      .then(function(r) {
        assert(false, "Solve should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Solve should revert");
      });
  });
});
