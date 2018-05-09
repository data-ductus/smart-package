let AgreementData = artifacts.require("./AgreementData.sol");
let AgreementReturn = artifacts.require("./AgreementReturn.sol");
let AgreementDeliver = artifacts.require("./AgreementDeliver.sol");
let Token = artifacts.require("./Token.sol");
let MinimalPurchase = artifacts.require("./MinimalPurchase.sol");
let Dapp = artifacts.require("./DApp.sol");
let Sale = artifacts.require("./Sale.sol");
let Clerk = artifacts.require("./Clerk.sol");

contract('purchase-revert-wrong-state', function (accounts) {
  let dapp;
  let agreementData;
  let agreementDeliver;
  let agreementReturn;
  const seller = accounts[1];
  const buyer = accounts[0];
  const delivery = accounts[2];
  const clerkAccount = accounts[4];
  let c;

  const setClerk = async function() {
    let value = 10000;
    const sale = await Sale.deployed();
    const voting = await Clerk.deployed();
    await sale.buyTokens(clerkAccount, {from: clerkAccount, value: value});
    await voting.vote(clerkAccount, {from: clerkAccount});
    await voting.becomeClerk({from: clerkAccount});
  };
  before(async function () {
    dapp = await Dapp.deployed();
    agreementData = await AgreementData.deployed();
    agreementDeliver = await AgreementDeliver.deployed();
    agreementReturn = await AgreementReturn.deployed();
    await setClerk();
    await dapp.createMinimalPurchase(0, -999, -999, -999, -999, -999, false, {from: seller});
    c = await dapp.getAllContracts();
  });
  it("should revert set provider if not in locked", async function() {
    await agreementData.setProvider(c[0], "", {from: accounts[3]})
      .then(function(r) {
        assert(false, "Set provider should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Set provider should revert");
      });
  });
  it("should revert transport if not in locked", async function() {
    await agreementDeliver.transport(c[0], 'Stockholm',  {from: delivery})
      .then(function(r) {
        assert(false, "Transport should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Transport should revert");
      });
  });
  it("should revert sensor data if not in transit", async function() {
    await agreementData.sensorData(c[0], "", 1, {from: accounts[3]})
      .then(function(r) {
        assert(false, "Sensor data should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Sensor data should revert");
      });
  });
  it("should revert deliver if not in transit", async function() {
    await agreementDeliver.deliver(c[0], {from: delivery})
      .then(function(r) {
        assert(false, "Deliver should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Deliver should revert");
      });
  });
  it("should revert satisfied if not in confirm", async function() {
    await timeout(2000);
    await agreementDeliver.success(c[0])
      .then(function(r) {
        assert(false, "Satisfied should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Satisfied should revert");
      });
  });
  it("should revert dissatisfied if not in confirm", async function() {
    await agreementDeliver.dissatisfied(c[0], {from: buyer})
      .then(function(r) {
        assert(false, "Dissatisfied should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Dissatisfied should revert");
      });
  });
  it("should revert transport return if not in dissatisfied", async function() {
    await agreementReturn.transportReturn(c[0], {from: delivery})
      .then(function(r) {
        assert(false, "Transport return should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Transport return should revert");
      });
  });
  it("should revert deliver return if not in return", async function() {
    await agreementReturn.deliverReturn(c[0], {from: delivery})
      .then(function(r) {
        assert(false, "Delivery return should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Delivery return should revert");
      });
  });
  it("should revert seller satisfied if not in return", async function() {
    await agreementReturn.successReturn(c[0], {from: seller})
      .then(function(r) {
        assert(false, "Seller satisfied should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Seller satisfied should revert");
      });
  });
  /*it("should revert goods damaged if not in return", async function() {
    await agreementReturn.goodsDamaged(c[0], {from: seller})
      .then(function(r) {
        assert(false, "Goods damaged should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Goods damaged should revert");
      });
  });*/
  it("should revert compensate if not in return", async function() {
    await agreementReturn.compensate(c[0], {from: delivery})
      .then(function(r) {
        assert(false, "Compensate should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Compensate damaged should revert");
      });
  });
  it("should revert solve if not in return", async function() {
    await agreementReturn.solve(c[0], 0, 0, 0, {from: clerkAccount})
      .then(function(r) {
        assert(false, "Solve should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Solve should revert");
      });
  });
});

contract('purchase-revert-wrong-state-2', function (accounts) {
  let agreementData;
  let agreementDeliver;
  let dapp;
  const buyer = accounts[0];
  const seller = accounts[1];
  let c;

  before(async function () {
    dapp = await Dapp.deployed();
    agreementData = await AgreementData.deployed();
    agreementDeliver = await AgreementDeliver.deployed();
    await dapp.createMinimalPurchase(0, -999, -999, -999, -999, -999, false, {from: seller});
    c = await dapp.getAllContracts();
    await agreementData.propose(c[0], 'Skellefteå', 0, 0, 0, 0, 0, false, {from: buyer});
    await agreementData.accept(c[0], 0, {from: seller})
  });
  it("should revert set price if not in created", async function() {
    await agreementData.setPrice(c[0], 10, {from: seller})
      .then(function(r) {
        assert(false, "Set price should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Set price should revert");
      });
  });
  it("should revert abort if not in created", async function() {
    await agreementDeliver.abort(c[0], {from: seller})
      .then(function(r) {
        assert(false, "Abort should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Abort should revert");
      });
  });
  it("should revert propose if not in created", async function() {
    await agreementData.propose(c[0], 'Skellefteå', 0, 0, 0, 0, 0, false, {from: buyer})
      .then(function(r) {
        assert(false, "Propose should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Propose should revert");
      });
  });
});

contract("purchase-revert-wrong-sender", function (accounts) {
  let agreementData;
  let agreementDeliver;
  let dapp;
  const buyer = accounts[0];
  const seller = accounts[1];
  let c;

  before(async function () {
    dapp = await Dapp.deployed();
    agreementData = await AgreementData.deployed();
    agreementDeliver = await AgreementDeliver.deployed();
    await dapp.createMinimalPurchase(0, -999, -999, -999, -999, -999, false, {from: seller});
    c = await dapp.getAllContracts();
  });
  it("should revert set price if not seller", async function() {
    await agreementData.setPrice(c[0], 10, {from: buyer})
      .then(function(r) {
        assert(false, "Set price should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Set price should revert");
      });
  });
  it("should revert abort if not seller", async function() {
    await agreementDeliver.abort(c[0], {from: buyer})
      .then(function(r) {
        assert(false, "Abort should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Abort should revert");
      });
  });
  it("should revert propose if buyer", async function() {
    await agreementData.propose(c[0], 'Skellefteå', 0, 0, 0, 0, 0, false, {from: seller})
      .then(function(r) {
        assert(false, "Propose should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Propose should revert");
      });
  });
});

contract("purchase-revert-wrong-sender-2", function (accounts) {
  let agreementData;
  let dapp;
  const buyer = accounts[0];
  const seller = accounts[1];
  let c;

  before(async function () {
    dapp = await Dapp.deployed();
    agreementData = await AgreementData.deployed();
    await dapp.createMinimalPurchase(0, -999, -999, -999, -999, -999, false, {from: seller});
    c = await dapp.getAllContracts();
    await agreementData.propose(c[0], 'Skellefteå', 0, 0, 0, 0, 0, false, {from: buyer});
  });
  it("should revert decline if not seller", async function() {
    await agreementData.decline(c[0], 0, {from: buyer})
      .then(function(r) {
        assert(false, "Decline should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Decline should revert");
      });
  });
  it("should revert accept if not seller", async function() {
    await agreementData.accept(c[0], 0, {from: buyer})
      .then(function(r) {
        assert(false, "Accept should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Accept should revert");
      });
  });
});

contract("purchase-revert-wrong-sender-3", function (accounts) {
  let agreementData;
  let agreementDeliver;
  let dapp;
  const buyer = accounts[0];
  const seller = accounts[1];
  const delivery = accounts[2];
  let c;

  before(async function () {
    dapp = await Dapp.deployed();
    agreementData = await AgreementData.deployed();
    agreementDeliver = await AgreementDeliver.deployed();
    await dapp.createMinimalPurchase(0, -999, -999, -999, -999, -999, false, {from: seller});
    c = await dapp.getAllContracts();
    await agreementData.propose(c[0], 'Skellefteå', 0, 0, 0, 0, 0, false, {from: buyer});
    await agreementData.accept(c[0], 0, {from: seller});
    await agreementDeliver.transport(c[0], 'Stockholm', {from: delivery});
    await agreementDeliver.deliver(c[0], {from: delivery});
  });
  it("should revert satisfied if not enough time has passed", async function() {
    await agreementDeliver.success(c[0])
      .then(function(r) {
        assert(false, "Satisfied should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Satisfied should revert");
      });
  });
  it("should revert dissatisfied if not buyer", async function() {
    await agreementDeliver.dissatisfied(c[0], {from: seller})
      .then(function(r) {
        assert(false, "Dissatisfied should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Dissatisfied should revert");
      });
  });
});

contract("purchase-revert-wrong-sender-4", function (accounts) {
  let agreementData;
  let agreementDeliver;
  let agreementReturn;
  let dapp;
  const buyer = accounts[0];
  const seller = accounts[1];
  const delivery = accounts[2];
  let c;

  before(async function () {
    dapp = await Dapp.deployed();
    agreementData = await AgreementData.deployed();
    agreementDeliver = await AgreementDeliver.deployed();
    agreementReturn = await AgreementReturn.deployed();
    await dapp.createMinimalPurchase(0, -999, -999, -999, -999, -999, false, {from: seller});
    c = await dapp.getAllContracts();
    await agreementData.propose(c[0], 'Skellefteå', 0, 0, 0, 0, 0, false, {from: buyer});
    await agreementData.accept(c[0], 0, {from: seller});
    await agreementDeliver.transport(c[0], 'Stockholm', {from: delivery});
    await agreementDeliver.deliver(c[0], {from: delivery});
    await agreementDeliver.dissatisfied(c[0], {from: buyer});
  });
  it("should revert transport return if not delivery", async function() {
    await agreementReturn.transportReturn(c[0], {from: seller})
      .then(function(r) {
        assert(false, "Transport return should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Transport return should revert");
      });
  });
  it("should revert deliver return if not delivery", async function() {
    await agreementReturn.transportReturn(c[0], {from: delivery});
    await agreementReturn.deliverReturn(c[0], {from: seller})
      .then(function(r) {
        assert(false, "Delivery return should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Delivery return should revert");
      });
  });
});

contract("purchase-revert-wrong-sender-5", function (accounts) {
  let agreementData;
  let agreementDeliver;
  let agreementReturn;
  let dapp;
  const buyer = accounts[0];
  const seller = accounts[1];
  const delivery = accounts[2];
  let c;

  before(async function () {
    dapp = await Dapp.deployed();
    agreementData = await AgreementData.deployed();
    agreementDeliver = await AgreementDeliver.deployed();
    agreementReturn = await AgreementReturn.deployed();
    await dapp.createMinimalPurchase(0, -999, -999, -999, -999, -999, false, {from: seller});
    c = await dapp.getAllContracts();
    await agreementData.propose(c[0], 'Skellefteå', 0, 0, 0, 0, 0, false, {from: buyer});
    await agreementData.accept(c[0], 0, {from: seller});
    await agreementDeliver.transport(c[0], 'Stockholm', {from: delivery});
    await agreementDeliver.deliver(c[0], {from: delivery});
    await agreementDeliver.dissatisfied(c[0], {from: buyer});
    await agreementReturn.transportReturn(c[0], {from: delivery});
    await agreementReturn.deliverReturn(c[0], {from: delivery});
  });
  it("should revert seller satisfied if not seller", async function() {
    await agreementReturn.successReturn(c[0], {from: delivery})
      .then(function(r) {
        assert(false, "Seller satisfied should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Seller satisfied should revert");
      });
  });
  it("should revert goods damaged if not seller", async function() {
    await agreementReturn.goodsDamaged(c[0], {from: buyer})
      .then(function(r) {
        assert(false, "Goods damaged should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Goods damaged should revert");
      });
  });
  /*it("should revert goods damaged if no warnings", async function () {
    await agreementReturn.goodsDamaged(c[0], {from: seller})
      .then(function(r) {
        assert(false, "Goods damaged should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Goods damaged should revert");
      });
  })*/
});

contract("purchase-revert-wrong-sender-6", function (accounts) {
  let agreementData;
  let agreementDeliver;
  let agreementReturn;
  let dapp;
  const buyer = accounts[0];
  const seller = accounts[1];
  const delivery = accounts[2];
  const tempProvider = accounts[3];
  const maxTemp = 20;
  let c;

  before(async function () {
    dapp = await Dapp.deployed();
    agreementData = await AgreementData.deployed();
    agreementDeliver = await AgreementDeliver.deployed();
    agreementReturn = await AgreementReturn.deployed();
    await dapp.createMinimalPurchase(0, -999, -999, -999, -999, -999, false, {from: seller});
    c = await dapp.getAllContracts();
    await agreementData.propose(c[0], 'Skellefteå', maxTemp, 0, 0, 0, 0, false, {from: buyer});
    await agreementData.accept(c[0], 0, {from: seller});
    await agreementData.setProvider(c[0], 0, {from: tempProvider});
    await agreementDeliver.transport(c[0], 'Stockholm', {from: delivery});
    await agreementData.sensorData(c[0], 0, maxTemp, {from: tempProvider});
    await agreementDeliver.deliver(c[0], {from: delivery});
    await agreementDeliver.dissatisfied(c[0], {from: buyer});
    await agreementReturn.transportReturn(c[0], {from: delivery});
    await agreementReturn.deliverReturn(c[0], {from: delivery});
    await agreementReturn.goodsDamaged(c[0], {from: seller});
  });
  it("should revert compensate if not delivery", async function() {
    await agreementReturn.compensate(c[0], {from: seller})
      .then(function(r) {
        assert(false, "Compensate should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Compensate should revert");
      });
  });
  it("should revert solve if not clerk", async function() {
    await agreementReturn.clerk(c[0], 0, {from: delivery});
    await agreementReturn.solve(c[0], 0, 0, 0, {from: seller})
      .then(function(r) {
        assert(false, "Solve should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Solve should revert");
      });
  });
});

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
