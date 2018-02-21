pragma solidity ^0.4.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Purchase/Purchase.sol";
import "../contracts/Token/Token.sol";

contract TestPurchase {
  function testInitialPrice(){
    Purchase purchase = new Purchase(100, msg.sender);

    uint expected = 100;

    Assert.equal(purchase.price(), expected, "The price should be 100");
  }

  /*function testPropose() {
    Token token = Token(DeployedAddresses.Token());
    Purchase purchase = new Purchase(100, msg.sender);

  }*/

}
