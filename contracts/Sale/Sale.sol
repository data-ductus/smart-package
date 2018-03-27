pragma solidity ^0.4.0;

import "../../node_modules/zeppelin-solidity/contracts/crowdsale/emission/MintedCrowdsale.sol";
import "../../node_modules/zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "../Token/Token.sol";

contract Sale is MintedCrowdsale {
  function Sale(uint _rate, address _wallet, MintableToken _token)
    public
    Crowdsale(_rate, _wallet, _token)
  {

  }
}
