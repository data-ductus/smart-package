const MinimalPurchase = artifacts.require("./MinimalPurchase.sol");
const Token = artifacts.require("./Token/Token.sol");
const Dapp = artifacts.require("./DApp.sol");
const AgreementData = artifacts.require("./AgreementData.sol");
const AgreementDeliver = artifacts.require("./AgreementDeliver.sol");
const AgreementReturn = artifacts.require("./AgreementReturn.sol");

contract('minimal-purchase-revert', function (accounts) {
  let token;
  let mPur;
  let dapp;
  let agreementData;
  let agreementDeliver;
  let agreementReturn;

  before(async function () {
    mPur = await MinimalPurchase.deployed();
    token = await Token.deployed();
    dapp = await Dapp.deployed();
    agreementReturn = await AgreementReturn.deployed();
    agreementDeliver = await AgreementDeliver.deployed();
    agreementData = await AgreementData.deployed();

  });
  it("should revert if wrong sender", async function () {
    await mPur.approve(0x0, 1)
      .then(function(r) {
        assert(false, "Approve should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Approve should revert");
      });
  });
  it("should revert when it can't approve tokens", async function () {
    let deliver2 = await AgreementDeliver.new();
    let return2 = await AgreementReturn.new(0x0, 0x0, deliver2.address);
    let data2 = await AgreementData.new(0x0, deliver2.address, return2.address);
    let dapp2 = await Dapp.new(data2.address, accounts[1], return2.address, 0x0);
    let mPur2 = await MinimalPurchase.new(dapp2.address, 0x0);
    await mPur2.approve(0x0, 1, {from: accounts[1]})
      .then(function(r) {
        assert(false, "Approve should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Approve should revert");
      });
  });
  it("should revert when it can't transfer tokens", async function () {
    await mPur.transferFrom(0x0, 1, {from: accounts[1]})
      .then(function(r) {
        assert(false, "Transfer from should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Transfer from should revert");
      });
  });
});
