pragma solidity ^0.4.0;

import "../Token/Token.sol";
import "../DApp.sol";

contract MinimalPurchase {

  DApp dapp;

  function MinimalPurchase(address _dapp) public { dapp = DApp(_dapp); }

  modifier condition(bool c) {
    require(c);
    _;
  }

  function approve(address tokenAddress, address to, uint amount)
    public
    condition(dapp.isPurchaseContract(msg.sender))
  {
    require(Token(tokenAddress).approve(to, amount));
  }
  function transferFrom(address tokenAddress, address from, address to, uint amount)
    public
    condition(dapp.isPurchaseContract(msg.sender))
  {
    require(Token(tokenAddress).transferFrom(from, to, amount));
  }
}
