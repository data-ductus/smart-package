pragma solidity ^0.4.0;

import "../Token/Token.sol";
import "./SensorLibrary.sol";
import "./AgreementData.sol";
import "./AgreementReturn.sol";

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
    //require(Purchase(_contract1).setPurchaseData(this));
    //require(Purchase2(_contract2).setPurchaseData(this));
  }

  ///////////////////
  ///---Setters---///
  ///////////////////

  /** @dev Create a new agreement
    * @param purchase The address of the agreement
    * @param _price The price of the goods
    * @param _seller The seller
    * @param maxTemp Maximum temperature (-999 = not set)
    * @param minTemp Minimum temperature (-999 = not set)
    * @param acceleration Maximum acceleration (-999 = not set)
    * @param humidity Maximum humidity (-999 = not set)
    * @param pressure Maximum pressure (-999 = not set)
    * @param gps True if gps is included
    */
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
    //onlyPurchaseContract()
  {
    price[purchase] = _price;
    seller[purchase] = _seller;
    require(SensorLibrary.setSensors(terms[purchase], maxTemp, minTemp, acceleration, humidity, pressure, gps));
  }

  /** @dev Update the state of an agreement
    * @param purchase The address of the agreement
    * @param _state The new state
    */
  function setState(address purchase, State _state)
    public
    onlyPurchaseContract()
  {
    state[purchase] = _state;
  }

  /** @dev Fire an event to request data
    * @param purchase The address of the agreement
    * @param sensorType The sensor that is being sent the request
    */
  function requestData(address purchase, uint sensorType) public {
    Request(terms[purchase].sensors[sensorType].provider);
  }

  /** @dev Fire an event to request data
    * @param purchase The address of the agreement
    * @param sensorType The sensor that is being sent the request
    */
  function sensorData(address purchase, uint sensorType, address sender, int value)
    public
    onlyPurchaseContract()
  {
    SensorLibrary.sensorData(terms[purchase], sensorType, sender, value);
  }

  /** @dev Set the buyer for an agreement
    * @param purchase The address of the agreement
    * @param _buyer The index of the buyer's proposal
    */
  function setBuyer(address purchase, uint _buyer)
    public
    onlyPurchaseContract()
  {
    buyer[purchase] = potentialBuyers[purchase][_buyer];
    SensorLibrary.combineTerms(terms[purchase], proposals[purchase][_buyer]);
  }

  /** @dev Set the buyer for an agreement
    * @param purchase The address of the agreement
    * @param _deliveryCompany The address of the delivery company
    * @param _returnAddress The location the goods are being transported from
    */
  function setDeliveryCompany(address purchase, address _deliveryCompany, string _returnAddress)
    public
    onlyPurchaseContract()
  {
    deliveryCompany[purchase] = _deliveryCompany;
    returnAddress[purchase] = _returnAddress;
  }

  /** @dev Delete a proposal
    * @param purchase The address of the agreement
    * @param _buyer The index of the proposal
    */
  function deleteBuyer(address purchase, uint _buyer)
    public
    onlyPurchaseContract()
  {
    potentialBuyers[purchase][_buyer] = purchase;
  }

  /** @dev Propose additional terms
    * @param purchase The address of the agreement
    * @param _deliveryAddress The location where the goods should be delivered
    * @param maxTemp Maximum temperature (-999 = not set)
    * @param minTemp Minimum temperature (-999 = not set)
    * @param acceleration Maximum acceleration (-999 = not set)
    * @param humidity Maximum humidity (-999 = not set)
    * @param pressure Maximum pressure (-999 = not set)
    * @param gps True if gps included
    */
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

  /** @dev Update price for an agreement
    * @param purchase The address of the agreement
    * @param _price The new price
    */
  function setPrice(address purchase, uint _price)
    public
    onlyPurchaseContract()
  {
    potentialBuyers[purchase] = [purchase];
    price[purchase] = _price;
  }

  /** @dev Sets the address of the sensor
    * @param purchase The address of the agreement
    * @param sensorType The sensor to set the address for
    * @param _provider The address of the sensor
    */
  function setProvider(address purchase, uint sensorType, address _provider)
    public
    onlyPurchaseContract()
  {
   terms[purchase].sensors[sensorType].provider = _provider;
  }

}
