pragma solidity ^0.4.0;

import "../Token/Token.sol";
import "./SensorLibrary.sol";
import "./Purchase.sol";
import "./Purchase2.sol";

contract PurchaseData {
  enum State { Created, Locked, Transit, Confirm, Dissatisfied, Return, Returned, Review, Clerk, Appeal, Inactive }

  mapping(address => uint) public price;
  mapping(address => State) public state;
  mapping(address => address) public seller;
  mapping(address => string) public returnAddress;
  mapping(address => address) public buyer;
  mapping(address => address) public deliveryCompany;
  mapping(address => mapping(address => string)) public deliveryAddress;
  mapping(address => SensorLibrary.Sensors) terms;
  mapping(address => address[]) public potentialBuyers;
  mapping(address => mapping(uint => SensorLibrary.Sensors)) proposals;

  event Proposed(address from);
  event Declined(address from);
  event Accepted(address from);
  event Delivered(address from);
  event Satisfied(address from);
  event Dissatisfied(address from);
  event Request(address indexed provider);

  address[] purchaseContracts;

  modifier onlyPurchaseContract() {
    require(msg.sender == purchaseContracts[0] || msg.sender == purchaseContracts[1]);
    _;
  }

  function PurchaseData(address _contract1, address _contract2) public {
    purchaseContracts.push(_contract1);
    purchaseContracts.push(_contract2);
    require(Purchase(_contract1).setPurchaseData(this));
    require(Purchase2(_contract2).setPurchaseData(this));
  }

  ///////////////////
  ///---Setters---///
  ///////////////////

  function newPurchase
  (
    address purchase,
    uint _price,
    address _seller,
    int maxTemp,
    int minTemp,
    int acceleration,
    int humidity,
    int pressure,
    bool gps
  )
    public
    onlyPurchaseContract()
  {
    price[purchase] = _price;
    seller[purchase] = _seller;
    require(SensorLibrary.setSensors(terms[purchase], maxTemp, minTemp, acceleration, humidity, pressure, gps));
  }

  function setState(address purchase, State _state)
    public
    onlyPurchaseContract()
  {
    state[purchase] = _state;
  }

  function requestData(address purchase, string sensorType) public {
    Request(terms[purchase].sensors[sensorType].provider);
  }

  function sensorData(address purchase, string sensorType, address sender, int value)
    public
    onlyPurchaseContract()
  {
    SensorLibrary.sensorData(terms[purchase], sensorType, sender, value);
  }

  function setBuyer(address purchase, uint _buyer)
    public
    onlyPurchaseContract()
  {
    buyer[purchase] = potentialBuyers[purchase][_buyer];
    SensorLibrary.combineTerms(terms[purchase], proposals[purchase][_buyer]);
  }

  function setDeliveryCompany(address purchase, address _deliveryCompany, string _returnAddress)
    public
    onlyPurchaseContract()
  {
    deliveryCompany[purchase] = _deliveryCompany;
    returnAddress[purchase] = _returnAddress;
  }

  function deleteBuyer(address purchase, uint _buyer)
    public
    onlyPurchaseContract()
  {
    potentialBuyers[purchase][_buyer] = purchase;
  }

  function addPotentialBuyer
  (
    address purchase,
    address _buyer,
    string _deliveryAddress,
    int maxTemp,
    int minTemp,
    int acceleration,
    int humidity,
    int pressure,
    bool gps
  )
    public
    onlyPurchaseContract()
  {
    uint i =  potentialBuyers[purchase].length;
    potentialBuyers[purchase].push(_buyer);
    deliveryAddress[purchase][_buyer] = _deliveryAddress;
    require(SensorLibrary.setSensors(proposals[purchase][i], maxTemp, minTemp, acceleration, humidity, pressure, gps));
    Proposed(msg.sender);
  }

  function setPrice(address purchase, uint _price)
    public
    onlyPurchaseContract()
  {
    potentialBuyers[purchase] = [purchase];
    price[purchase] = _price;
  }

  function setProvider(address purchase, string sensorType, address _provider)
    public
  {
   terms[purchase].sensors[sensorType].provider = _provider;
  }

  ///////////////////
  ///---Getters---///
  ///////////////////

  function getSensor(address purchase, string name)
    public
    constant
    returns(int threshold, bool warning, address provider, bool set)
  {
    return(SensorLibrary.getSensor(terms[purchase], name));
  }

  function getProposedTerms(address purchase, string name, uint _buyer)
    public
    constant
    returns(int threshold, bool warning, address provider, bool set)
  {
    return(SensorLibrary.getSensor(proposals[purchase][_buyer], name));
  }

  function getPotentialBuyers(address purchase)
    public
    constant
    returns(address[])
  {
    return potentialBuyers[purchase];
  }

}
