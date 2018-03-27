let Sale = artifacts.require("./Sale.sol");
let Token = artifacts.require("./Token.sol");

contract('sale', function (accounts) {
  let token;
  let sale;

  before(async function () {
    token = await Token.deployed();
    sale = await Sale.deployed();
  });
  it("should sell tokens", async function () {
    let value = 100;
    await sale.buyTokens(accounts[1], {from: accounts[1], value: value});
    const tokens = await token.balanceOf.call(accounts[1]);
    assert.equal(tokens, value, "The buyer should have 100 tokens");
  });

});

contract('tokens', function (accounts) {
  let token;
  let sale;

  before(async function () {
    token = await Token.deployed();
    sale = await Sale.deployed();
  });
  it("should keep track of total number of tokens", async function () {
    let value = 100;
    await sale.buyTokens(accounts[1], {from: accounts[1], value: value});
    await sale.buyTokens(accounts[1], {from: accounts[1], value: value});
    await sale.buyTokens(accounts[1], {from: accounts[1], value: value});
    await sale.buyTokens(accounts[1], {from: accounts[1], value: value});
    const tokens = await token.totalSupply.call();
    assert.equal(tokens.toNumber(), value*4, "The total amount of tokens should be 400");
  })
});
