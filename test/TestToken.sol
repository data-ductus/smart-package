pragma solidity ^0.4.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Token/Token.sol";

contract TestToken {
  function testInitialBalance() {
    Token token = Token(DeployedAddresses.Token());

    uint expected = 100000000000000000000000000;

    Assert.equal(token.balanceOf(msg.sender), expected, "Owner should have 100000000000000000000000000 tokens initially");
  }

  function testTotalSupply() {
    Token token = Token(DeployedAddresses.Token());

    uint expected = 100000000000000000000000000;

    Assert.equal(token.totalSupply(), expected, "Total supply should be 100000000000000000000000000 tokens");
  }

}
