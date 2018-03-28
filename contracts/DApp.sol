pragma solidity ^0.4.0;

import "./Purchase/Purchase.sol";
import "./Purchase/Purchase2.sol";
import "./Purchase/MinimalPurchase.sol";
import "./Token/Token.sol";
import "../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol";

contract DApp is Ownable {
  mapping (address => address[]) userContracts;
  address[] public allContracts;
  address public purchase;
  address public purchase2;
  address[] public clerks;
  address public token;

  function DApp(address p1, address p2, address t) public {
    purchase = p1;
    purchase2 = p2;
    token = t;
    require(Purchase2(p2).setDapp(this));
  }

  function createMinimalPurchase(
    uint price,
    int maxTemp,
    int minTemp,
    int acceleration,
    int humidity,
    int pressure,
    bool gps
  )
    public
  {
    address c = new MinimalPurchase(this, token);
    Purchase p = Purchase(purchase);
    p.newPurchase(c, price, msg.sender, maxTemp, minTemp, acceleration, humidity, pressure, gps);
    allContracts.push(c);
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

  function isPurchaseContract(address a)
    public
    constant
    returns(bool)
  {
    return (a == purchase || a == purchase2);
  }
}
