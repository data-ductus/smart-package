pragma solidity ^0.4.0;

import "../Token/Token.sol";

contract MinimalPurchase {

  function MinimalPurchase(){}

  function approve(address tokenAddress, address to, uint amount) {
    require(Token(tokenAddress).approve(to, amount));
  }
  function transferFrom(address tokenAddress, address from, address to, uint amount) {
    require(Token(tokenAddress).transferFrom(from, to, amount));
  }
}
