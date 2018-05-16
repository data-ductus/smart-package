let AgreementData = artifacts.require("./AgreementData.sol");
let AgreementReturn = artifacts.require("./AgreementReturn.sol");
let AgreementDeliver = artifacts.require("./AgreementDeliver.sol");
let Dapp = artifacts.require("../DApp.sol");
let Token = artifacts.require("./Token.sol");
let Sale = artifacts.require("./Sale.sol");
let SensorLibrary = artifacts.require("./SensorLibrary");

contract('request-events', function (accounts) {
  let agreementData;
  let agreementDeliver;
  let agreementReturn;
  let token;
  let c;
  let dapp;
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
  const gpsProvider = accounts[6];

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
    agreementData = await AgreementData.deployed();
    agreementDeliver = await AgreementDeliver.deployed();
    agreementReturn = await AgreementReturn.deployed();
    token = await Token.deployed();
    await dapp.createMinimalPurchase(100, '', -999, -999, acceleration, humidity, -999, true, {from: seller});
    c = await dapp.getAllContracts();
    await token.approve(c[0], price, {from: buyer});
    await token.transfer(delivery, 1000, {from: buyer});
    await agreementData.propose(c[0], 'Skellefteå', maxTemp, -999, -999, -999, -999, false, {from: buyer});
    await agreementData.accept(c[0], 0, {from: seller});
    await agreementData.setProvider(c[0], 0, {from: tempProvider});
    await agreementData.setProvider(c[0], 2, {from: accProvider});
    await agreementData.setProvider(c[0], 3, {from: humProvider});
    await agreementData.setProvider(c[0], 100, {from: gpsProvider});
    await token.approve(c[0], price, {from: delivery});
    await agreementDeliver.transport(c[0], 'Skellefteå', {from: delivery});
  });
  it("should listen to correct event", async function () {
    const watcher = agreementData.Request({provider: tempProvider});
    const req = agreementData.Request();
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
    await agreementData.requestData(c[0], 2, {from: accounts[0]});
    await agreementData.requestData(c[0], 0, {from: accounts[0]});
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
  });
  it("should send a location event when receiving a request", async function () {
    const event = library.Location({purchase: c[0]});

    event.watch(function (error, result) {
      if(!error) {
        assert.equal(result.args['lat'].toNumber(), 1, "The lat in the event should be 1");
        assert.equal(result.args['long'].toNumber(), 2, "The lng in the event should be 2");
      } else {
        console.log(error)
      }
      event.stopWatching();
    });
    await library.currentLocation(1, 2, c[0]);
  })
});
