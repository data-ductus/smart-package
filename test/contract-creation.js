let Dapp = artifacts.require("./DApp.sol");
let AgreementData = artifacts.require("./AgreementData.sol");
let AgreementDeliver = artifacts.require("./AgreementDeliver.sol");
let AgreementReturn = artifacts.require("./AgreementReturn.sol");

contract('create-dapp-revert', function (accounts) {
  let agreementData;
  let dapp;

  before(async function () {
    dapp = await Dapp.deployed();
    agreementData = await AgreementData.deployed();
  });
  it("should revert when the data contract is not correct", async function () {
    await Dapp.new(agreementData.address, 0x0, 0x0, 0x0)
      .then(function(r) {
        assert(false, "DApp creation should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "DApp creation should revert");
      });
  });
});

contract('create-agreement-data-revert', function (accounts) {
  let agreementData;
  let agreementDeliver;
  let agreementReturn;

  before(async function () {
    dapp = await Dapp.deployed();
    agreementData = await AgreementData.deployed();
    agreementDeliver = await AgreementDeliver.deployed();
    agreementReturn = await AgreementReturn.deployed();
  });
  it("should revert when the deliver contract is not correct", async function () {
    await AgreementData.new(0x0, agreementDeliver.address, 0x0)
      .then(function(r) {
        assert(false, "AgreementData creation should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "AgreementData creation should revert");
      });
  });
  it("should revert when the deliver contract is not correct", async function () {
    let deliver2 = await AgreementDeliver.new();
    await AgreementData.new(0x0, deliver2.address, agreementReturn.address)
      .then(function(r) {
        assert(false, "AgreementData creation should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "AgreementData creation should revert");
      });
  });
});
