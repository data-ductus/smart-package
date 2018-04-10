pragma solidity ^0.4.0;

import "./Purchase/Purchase.sol";
import "./Purchase/Purchase2.sol";
import "./Purchase/MinimalPurchase.sol";
import "./Token/Token.sol";
import "../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol";

contract DApp is Ownable {
  address[] public allContracts;
  address public purchase;
  address public purchase2;
  address public token;

  function DApp(address _purchase1, address _purchase2, address _token) public {
    purchase = _purchase1;
    purchase2 = _purchase2;
    token = _token;
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
    Purchase(purchase).newPurchase(c, price, msg.sender, maxTemp, minTemp, acceleration, humidity, pressure, gps);
    allContracts.push(c);
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
