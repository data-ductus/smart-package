pragma solidity ^0.4.0;

import "./Purchase/AgreementData.sol";
import "./Purchase/AgreementReturn.sol";
import "./Purchase/MinimalPurchase.sol";
import "./Token/Token.sol";

contract DApp {
  address[] public allContracts;
  address public agreementData;
  address public agreementDeliver;
  address public agreementReturn;
  address public token;

  function DApp(address _agreementData, address _agreementDeliver, address _agreementReturn, address _token) public {
    agreementData = _agreementData;
    agreementDeliver = _agreementDeliver;
    agreementReturn = _agreementReturn;
    token = _token;
    require(AgreementData(_agreementData).setDapp());
  }

  function createMinimalPurchase(
    uint price,
    string description,
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
    AgreementData(agreementData).newPurchase(c, price, description, msg.sender, maxTemp, minTemp, acceleration, humidity, pressure, gps);
    allContracts.push(c);
  }

  function getAllContracts()
    public
    constant
    returns(address[])
  {
    return allContracts;
  }

  function isAgreementContract(address a)
    public
    constant
    returns(bool)
  {
    return (a == agreementData || a == agreementDeliver || a == agreementReturn);
  }
}
