pragma solidity ^0.4.0;

import "./Purchase/Purchase.sol";
import "./Purchase/Purchase2.sol";
import "./Purchase/MinimalPurchase.sol";
import "./Purchase/PurchaseUsingLibrary.sol";
import "./Token/Token.sol";
import "./Token/Owned.sol";

contract DApp is Owned {
  mapping (address => address[]) userContracts;
  address[] public allContracts;
  Purchase2 public purchase2;
  address[] public clerks;

  function DApp() public {
    purchase2 = new Purchase2(this);
  }
/*
  function createContract(uint price) public returns(address){
    address c = new Purchase(price, msg.sender);
    allContracts.push(c);
    userContracts[msg.sender].push(c);
    return c;
  }

  function createPurchaseUsingLibrary(uint price) public returns(address) {
    address c = new PurchaseUsingLibrary(price, msg.sender);
    allContracts.push(c);
    userContracts[msg.sender].push(c);
    return c;
  }
*/

  function createMinimalPurchase(uint price) public returns(address) {
    address c = new MinimalPurchase(purchase2);
    purchase2.newPurchase(c, price, msg.sender);
    allContracts.push(c);
    userContracts[msg.sender].push(c);
    return c;
  }

  function addClerk(address clerk)
    public
    onlyOwner()
  {
    clerks.push(clerk);
  }

  function isClerk(address clerk)
    public
    constant
    returns(bool)
  {
    for (uint i = 0; i < clerks.length; i++) {
      if (clerks[i] == clerk) {
        return true;
      }
    }
    return false;
  }

  function getClerks()
    public
    constant
    returns(address[])
  {
    return clerks;
  }

  function getUserContracts()
    public
    constant
    returns(address[])
  {
    return userContracts[msg.sender];
  }

  function getAllContracts()
    public
    constant
    returns(address[])
  {
    return allContracts;
  }
}
