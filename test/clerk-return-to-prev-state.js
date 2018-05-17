const MinimalPurchase = artifacts.require("./MinimalPurchase.sol");
const Dapp = artifacts.require("./DApp.sol");
const AgreementData = artifacts.require("./AgreementData.sol");
const AgreementDeliver = artifacts.require("./AgreementDeliver.sol");
const AgreementReturn = artifacts.require("./AgreementReturn.sol");
const Clerk = artifacts.require("./Clerk.sol");

contract('minimal-purchase-revert', function (accounts) {
  let token;
  let clerk;
  let dapp;
  let agreementData;
  let agreementDeliver;
  let agreementReturn;
  let c;

  before(async function () {
    dapp = await Dapp.deployed();
    clerk = await Clerk.deployed();
    agreementReturn = await AgreementReturn.deployed();
    agreementDeliver = await AgreementDeliver.deployed();
    agreementData = await AgreementData.deployed();
    await clerk.becomeClerk({from: accounts[0]});
    await dapp.createMinimalPurchase(0, '', -999, -999, -999, -999, -999, false, {from: accounts[1]});
    c = await dapp.getAllContracts();
  });
  it("should return to the previous state", async function () {
    await agreementReturn.clerk(c[0], 0, {from: accounts[1]});
    await agreementReturn.returnToPreviousState(c[0], {from: accounts[0]});
    await timeout(3000);
    await agreementReturn.finalizeClerkDecision(c[0], {from: accounts[1]});
    let _state = await agreementData.state(c[0]);

    assert.equal(_state, 0, "The state should be created (0)");
  });
});

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
