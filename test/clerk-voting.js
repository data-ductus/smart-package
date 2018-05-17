const Voting = artifacts.require("./Voting/Clerk.sol");
const Sale = artifacts.require("./Sale/Sale.sol");
const Token = artifacts.require("./Token/Token.sol");

contract('clerk-voting', function (accounts) {
  let voting;
  let sale;
  let token;
  let value = 10000;

  const buyToken = async function() {

    const sale = await Sale.deployed();
    await sale.buyTokens(accounts[0], {from: accounts[0], value: value});
    await sale.buyTokens(accounts[1], {from: accounts[1], value: value});
    await sale.buyTokens(accounts[2], {from: accounts[2], value: value});
  };

  before(async function () {
    voting = await Voting.deployed();
    sale = await Sale.deployed();
    token = await Token.deployed();
    await buyToken();
  });
  it("should add candidates", async function () {
    const candidates_before = await voting.getCandidates();
    await voting.becomeCandidate({from: accounts[0]});
    const candidates_after = await voting.getCandidates();

    assert.equal(candidates_after.length, candidates_before.length+1, "The number of candidates is not correct");
  });
  it("should add votes", async function () {
    const votes_before = await voting.getVotes({from: accounts[0]});
    await voting.vote(accounts[0], {from: accounts[1]});
    const votes_after = await voting.getVotes({from: accounts[0]});
    const has_voted_for = await voting.hasVotedFor(accounts[1], accounts[0]);

    assert.equal(votes_after[0].toNumber(), votes_before[0]+value, "The number of votes is not correct");
    assert(has_voted_for, "The second account has not voted for the first account");
  });
  it("should add a clerk with enough votes", async function () {
    const clerks_before = await voting.getClerks();
    await voting.vote(accounts[0], {from: accounts[2]});
    await voting.becomeClerk({from: accounts[0]});
    const clerks_after = await voting.getClerks();

    assert.equal(clerks_after.length, clerks_before.length+1, "The total number of clerks is not correct");
    assert.equal(clerks_after[0], accounts[0], "The first clerk is not the first account");
  });
  it("should not add clerk with less than half of required clerk votes", async function () {
    await voting.clerkVote(accounts[1], {from: accounts[0]});
    await voting.vote(accounts[1], {from: accounts[2]});
    await voting.becomeClerk({from: accounts[1]});

    await sale.buyTokens(accounts[3], {from: accounts[3], value: value});
    await sale.buyTokens(accounts[4], {from: accounts[4], value: value});

    await voting.vote(accounts[2], {from: accounts[2]});
    await voting.vote(accounts[2], {from: accounts[3]});
    await voting.vote(accounts[2], {from: accounts[4]});

    await voting.becomeClerk({from: accounts[2]})
      .then(function(r) {
        assert(false, "Become clerk should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Become clerk should revert");
      });
  });
  it("should not add clerk with less than half of required token votes", async function () {
    await voting.clerkVote(accounts[3], {from: accounts[0]});
    await voting.clerkVote(accounts[3], {from: accounts[1]});

    await voting.becomeClerk({from: accounts[3]})
      .then(function(r) {
        assert(false, "Become clerk should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Become clerk should revert");
      });
  });
  it("should count clerk votes as token votes", async function () {
    await voting.vote(accounts[3], {from: accounts[3]});

    const clerks_before = await voting.getClerks();
    await voting.becomeClerk({from: accounts[3]});
    const clerks_after = await voting.getClerks();

    assert.equal(clerks_after.length, clerks_before.length+1, "The new clerk was not added");
  });
  it("should not allow voting for the same candidate twice", async function () {
    await voting.vote(accounts[4], {from: accounts[4]});
    await voting.vote(accounts[4], {from: accounts[4]})
      .then(function(r) {
        assert(false, "Vote should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Vote should revert");
      });
  });
  it("should not allow clerk voting if not clerk", async function () {
    await voting.clerkVote(accounts[4], {from: accounts[4]})
      .then(function(r) {
        assert(false, "Clerk vote should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Clerk vote should revert");
      });
  })
  it("should not allow voting as a clerk for the same candidate twice", async function () {
    await voting.clerkVote(accounts[4], {from: accounts[0]});
    await voting.clerkVote(accounts[4], {from: accounts[0]})
      .then(function(r) {
        assert(false, "Clerk vote should revert");
      }, function (e) {
        assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "Clerk vote should revert");
      });
  });
});
