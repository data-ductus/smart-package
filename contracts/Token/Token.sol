pragma solidity ^0.4.0;

import "../../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol";
import "../../node_modules/zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";

contract Token is Ownable, MintableToken {
  string public constant symbol = "T";
  string public constant name = "Token";
  uint8 public constant decimals = 18;

  function Token() public {
  }

  // ------------------------------------------------------------------------
  // Don't accept ETH
  // ------------------------------------------------------------------------
  function () public payable {
    revert();
  }

  // ------------------------------------------------------------------------
  // Owner can transfer out any accidentally sent ERC20 tokens
  // ------------------------------------------------------------------------
  function transferAnyERC20Token(address tokenAddress, uint tokens) public onlyOwner returns (bool success) {
    return ERC20(tokenAddress).transfer(owner, tokens);
  }
}
