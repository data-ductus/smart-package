let Purchase = artifacts.require("./Purchase.sol");
let Purchase2 = artifacts.require("./Purchase2.sol");
let PurchaseData = artifacts.require("./PurchaseData.sol");
let Dapp = artifacts.require("../DApp.sol");
let Token = artifacts.require("./Token.sol");
let Sale = artifacts.require("./Sale.sol");
let SensorLibrary = artifacts.require("./SensorLibrary");

contract('request-events', function (accounts) {
  let purchase;
  let purchase2;
  let token;
  let c;
  let dapp;
  let data;
  let library;
  const maxTemp = 30;
  const acceleration = 30;
  const humidity = 30;
  const buyer = accounts[0];
  const seller = accounts[1];
  const delivery = accounts[2];
  const price = 100;
  const tempProvider = accounts[3];
  const accProvider = accounts[4];
  const humProvider = accounts[5];

  const buyToken = async function() {
    let value = 10000;
    const sale = await Sale.deployed();
    await sale.buyTokens(accounts[0], {from: accounts[0], value: value});
    await sale.buyTokens(accounts[1], {from: accounts[1], value: value});
    await sale.buyTokens(accounts[2], {from: accounts[2], value: value});
  };

  before(async function () {
    await buyToken();
    library = await SensorLibrary.deployed();
    dapp = await Dapp.deployed();
    purchase = await Purchase.deployed();
    purchase2 = await Purchase2.deployed();
    data = await PurchaseData.deployed();
    token = await Token.deployed();
    await purchase.setTokenAddress(token.address);
    await dapp.createMinimalPurchase(100, -999, -999, acceleration, humidity, -999, true, {from: seller});
    c = await dapp.getAllContracts();
    await token.approve(c[0], price, {from: buyer});
    await token.transfer(delivery, 1000, {from: buyer});
    await purchase.propose(c[0], 'Skellefteå', maxTemp, -999, -999, -999, -999, false, {from: buyer});
    await purchase.accept(c[0], 0, {from: seller});
    await purchase.setProvider(c[0], "maxTemp", {from: tempProvider});
    await purchase.setProvider(c[0], "acceleration", {from: accProvider});
    await purchase.setProvider(c[0], "humidity", {from: humProvider});
    await token.approve(c[0], price, {from: delivery});
    await purchase.transport(c[0], 'Skellefteå', {from: delivery});
  });
  it("should listen to correct event", async function () {
    const watcher = data.Request({provider: tempProvider});
    const req = data.Request();
    watcher.watch(function (error, result) {
      if(!error) {
        assert.equal(result.args['provider'], tempProvider, "The address should be the temperature provider")
      } else {
        console.log(error)
      }
      watcher.stopWatching();
    });
    req.watch(function (error, result) {
      if(!error) {
        assert.equal(result.args['provider'], accProvider, "The first request should be for acceleration")
      } else {
        console.log(error)
      }
      req.stopWatching();
    });
    await purchase.requestData(c[0], 'acceleration', {from: accounts[0]});
    await purchase.requestData(c[0], 'maxTemp', {from: accounts[0]});
  });
  it("should send a data event when receiving a request", async function () {
    const event = library.Data({purchase: c[0]});

    event.watch(function (error, result) {
      if(!error) {
        assert.equal(result.args['value'].toNumber(), humidity, "The value in the event should be 30")
      } else {
        console.log(error)
      }
      event.stopWatching();
    });
    await library.currentValue(humidity, c[0]);
  })
});
