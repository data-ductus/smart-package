pragma solidity ^0.4.0;

import "../Token/Token.sol";

contract MinimalPurchase {

  address purchase;

  function MinimalPurchase(address _purchase) public { purchase = _purchase; }

  modifier onlyPurchase() {
    require(msg.sender == purchase);
    _;
  }

  function approve(address tokenAddress, address to, uint amount)
    public
    onlyPurchase()
  {
    require(Token(tokenAddress).approve(to, amount));
  }
  function transferFrom(address tokenAddress, address from, address to, uint amount)
    public
    onlyPurchase()
  {
    require(Token(tokenAddress).transferFrom(from, to, amount));
  }
}
