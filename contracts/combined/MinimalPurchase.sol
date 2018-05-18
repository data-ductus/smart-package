pragma solidity ^0.4.0;

import "./Token.sol";
import "./DApp.sol";

contract MinimalPurchase {

  DApp dapp;
  Token t;

  function MinimalPurchase(address _dapp, address _token) public {
    dapp = DApp(_dapp);
    t = Token(_token);
  }

  modifier condition(bool c) {
    require(c);
    _;
  }

  function approve(address to, uint amount)
    public
    condition(dapp.isAgreementContract(msg.sender))
  {
    require(t.approve(to, amount));
  }
  function transferFrom(address from, uint amount)
    public
    condition(dapp.isAgreementContract(msg.sender))
  {
    require(t.transferFrom(from, this, amount));
  }
}
