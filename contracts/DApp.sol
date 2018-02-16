pragma solidity ^0.4.0;

import "./Purchase/Purchase.sol";

contract DApp {
  mapping (address => address[]) userContracts;
  address[] public allContracts;

  function DApp(){

  }

  function createContract(uint price) public returns(address){
    address c = new Purchase(price, msg.sender);
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
