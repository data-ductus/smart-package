pragma solidity ^0.4.0;

import "./Owned.sol";
import "./SafeMath.sol";
import "./ERC20.sol";

contract Token is Owned, SafeMath, ERC20 {
  string public symbol;
  string public  name;
  uint8 public decimals;
  uint public _totalSupply;

  mapping(address => uint) balances;
  mapping(address => mapping(address => uint)) allowed;

  function Token(){
    symbol = "T";
    name = "Token";
    decimals = 18;
    _totalSupply = 100000000000000000000000000;
    balances[0x4e5a0425f5fa17af7a5dc94900d1253a48a9c7ea] = _totalSupply;
    Transfer(address(0), 0x4e5a0425f5fa17af7a5dc94900d1253a48a9c7ea, _totalSupply);
  }


  // ------------------------------------------------------------------------
  // Total supply
  // ------------------------------------------------------------------------
  function totalSupply() public constant returns (uint) {
    return _totalSupply  - balances[address(0)];
  }


  // ------------------------------------------------------------------------
  // Get the token balance for account tokenOwner
  // ------------------------------------------------------------------------
  function balanceOf(address tokenOwner) public constant returns (uint balance) {
    return balances[tokenOwner];
  }


  // ------------------------------------------------------------------------
  // Transfer the balance from token owner's account to to account
  // - Owner's account must have sufficient balance to transfer
  // - 0 value transfers are allowed
  // ------------------------------------------------------------------------
  function transfer(address to, uint tokens) public returns (bool success) {
    balances[msg.sender] = safeSub(balances[msg.sender], tokens);
    balances[to] = safeAdd(balances[to], tokens);
    Transfer(msg.sender, to, tokens);
    return true;
  }


  // ------------------------------------------------------------------------
  // Token owner can approve for spender to transferFrom(...) tokens
  // from the token owner's account
  //
  // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20-token-standard.md
  // recommends that there are no checks for the approval double-spend attack
  // as this should be implemented in user interfaces
  // ------------------------------------------------------------------------
  function approve(address spender, uint tokens) public returns (bool success) {
    allowed[msg.sender][spender] = tokens;
    Approval(msg.sender, spender, tokens);
    return true;
  }


  // ------------------------------------------------------------------------
  // Transfer tokens from the from account to the to account
  //
  // The calling account must already have sufficient tokens approve(...)-d
  // for spending from the from account and
  // - From account must have sufficient balance to transfer
  // - Spender must have sufficient allowance to transfer
  // - 0 value transfers are allowed
  // ------------------------------------------------------------------------
  function transferFrom(address from, address to, uint tokens) public returns (bool success) {
    balances[from] = safeSub(balances[from], tokens);
    allowed[from][msg.sender] = safeSub(allowed[from][msg.sender], tokens);
    balances[to] = safeAdd(balances[to], tokens);
    Transfer(from, to, tokens);
    return true;
  }


  // ------------------------------------------------------------------------
  // Returns the amount of tokens approved by the owner that can be
  // transferred to the spender's account
  // ------------------------------------------------------------------------
  function allowance(address tokenOwner, address spender) public constant returns (uint remaining) {
    return allowed[tokenOwner][spender];
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
