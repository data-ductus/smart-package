let Token = artifacts.require("./Token.sol");
let Sale = artifacts.require("./Sale.sol");

contract('Token', function(accounts) {
  let sale;
  before(async function () {
    let value = 100;
    sale = await Sale.deployed();
    await sale.buyTokens(accounts[0], {from: accounts[0], value: value});
    await sale.buyTokens(accounts[1], {from: accounts[1], value: value});
  });
  it("should send tokens correctly", function() {
    let token;

    // Get initial balances of first and second account.
    let account_one = accounts[0];
    let account_two = accounts[1];

    let account_one_starting_balance;
    let account_two_starting_balance;
    let account_one_ending_balance;
    let account_two_ending_balance;

    let amount = 10;

    return Token.deployed().then(function(instance) {
      token = instance;
      return token.balanceOf.call(account_one);
    }).then(function(balance) {
      account_one_starting_balance = balance.toNumber();
      return token.balanceOf.call(account_two);
    }).then(function(balance) {
      account_two_starting_balance = balance.toNumber();
      return token.transfer(account_two, amount, {from: account_one});
    }).then(function() {
      return token.balanceOf.call(account_one);
    }).then(function(balance) {
      account_one_ending_balance = balance.toNumber();
      return token.balanceOf.call(account_two);
    }).then(function(balance) {
      account_two_ending_balance = balance.toNumber();

      assert.equal(account_one_ending_balance, account_one_starting_balance - amount, "Amount wasn't correctly taken from the sender");
      assert.equal(account_two_ending_balance, account_two_starting_balance + amount, "Amount wasn't correctly sent to the receiver");
    });
  });
  it("should allow tokens correctly", function() {
    let token;

    let account_one = accounts[0];
    let account_two = accounts[1];

    let account_two_starting_allowance;
    let account_two_ending_allowance;

    let amount = 10;

    return Token.deployed().then(function(instance) {
      token = instance;
      return token.allowance.call(account_one, account_two);
    }).then(function(allowance) {
      account_two_starting_allowance = allowance.toNumber();
      return token.approve(account_two, amount, {from: account_one});
    }).then(function() {
      return token.allowance.call(account_one, account_two);
    }).then(function(allowance) {
      account_two_ending_allowance = allowance;

      assert.equal(account_two_ending_allowance, account_two_starting_allowance + amount, "Amount wasn't correctly added to allowance of receiver");
    })
  });
  it("should transfer tokens from an account correctly", function () {
    let token;

    let account_one = accounts[0];
    let account_two = accounts[1];

    let account_one_starting_balance;
    let account_two_starting_balance;
    let account_one_ending_balance;
    let account_two_ending_balance;

    let account_two_starting_allowance;
    let account_two_ending_allowance;

    let amount = 10;

    return Token.deployed().then(function(instance) {
      token = instance;
      return token.allowance.call(account_one, account_two);
    }).then(function(allowance) {
      account_two_starting_allowance = allowance.toNumber();
      return token.balanceOf.call(account_one);
    }).then(function(balance) {
      account_one_starting_balance = balance.toNumber();
      return token.balanceOf.call(account_two);
    }).then(function(balance) {
      account_two_starting_balance = balance.toNumber();
      return token.approve(account_two, amount, {from: account_one});
    }).then(function() {
      return token.transferFrom(account_one, account_two, amount, {from: account_two});
    }).then(function() {
      return token.balanceOf.call(account_one);
    }).then(function(balance) {
      account_one_ending_balance = balance.toNumber();
      return token.balanceOf.call(account_two);
    }).then(function(balance) {
      account_two_ending_balance = balance.toNumber();
      return token.allowance.call(account_one, account_two);
    }).then(function(allowance) {
      account_two_ending_allowance = allowance;

      assert.equal(account_one_ending_balance, account_one_starting_balance - amount, "Amount wasn't correctly taken from the sender");
      assert.equal(account_two_ending_balance, account_two_starting_balance + amount, "Amount wasn't correctly sent to the receiver");
      assert.equal(account_two_ending_allowance, account_two_starting_allowance - amount, "Amount wasn't correctly removed from allowance of receiver");
    })
  })
});
