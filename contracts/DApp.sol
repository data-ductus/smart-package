pragma solidity ^0.4.0;

import "./Purchase/Purchase.sol";
import "./Purchase/Purchase2.sol";
import "./Purchase/MinimalPurchase.sol";
import "./Purchase/PurchaseUsingLibrary.sol";
import "./Token/Token.sol";

contract DApp {
  mapping (address => address[]) userContracts;
  address[] public allContracts;
  Purchase2 public purchase2;

  function DApp(){
    purchase2 = new Purchase2();
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
    address c = new MinimalPurchase();
    purchase2.newPurchase(c, price, msg.sender);
    allContracts.push(c);
    userContracts[msg.sender].push(c);
    return c;
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
