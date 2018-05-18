pragma solidity ^0.4.0;

import "./MintedCrowdsale.sol";
import "./MintableToken.sol";
import "./Token.sol";

contract Sale is MintedCrowdsale {
  function Sale(uint _rate, address _wallet, MintableToken _token)
    public
    Crowdsale(_rate, _wallet, _token)
  {

  }
}
