var Dapp = artifacts.require("./DApp.sol");

contract('dapp', function (accounts) {
  it("should create a purchase contract", function () {
    var dapp;

    return Dapp.deployed().then(function (instance) {
      dapp = instance;
      return dapp.createContract(0);
    }).then(function () {
      return dapp.getUserContracts();
    }).then(function (contracts) {
      assert.equal(contracts.length, 1, "Length of contracts wasn't 1");
      assert.ok(web3.isAddress(contracts[0]), "The contract is not an address");
    })
  });
  it("should return all contracts", function () {
    var dapp;

    return Dapp.deployed().then(function (instance) {
      dapp = instance;
      return dapp.createContract(0, {from: accounts[1]});
    }).then(function () {
      return dapp.getAllContracts();
    }).then(function (contracts) {
      assert.equal(contracts.length, 2, "Length of contracts wasn't 2");
    })
  })
});
