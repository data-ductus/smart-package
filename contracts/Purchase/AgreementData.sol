
pragma solidity ^0.4.0;

import "../Token/Token.sol";
import "./SensorLibrary.sol";
import "./MinimalPurchase.sol";
import "./AgreementDeliver.sol";
import "./AgreementReturn.sol";

contract AgreementData {

  enum State { Created, Locked, Transit, Confirm, Dissatisfied, Return, Returned, Review, Clerk, Appeal, Inactive }

  Token t;
  //PurchaseData p;
  address[] purchaseContracts;
  address dapp;
  bool dappSet;

  mapping(address => uint) public price;
  mapping(address => string) public description;
  mapping(address => State) public state;
  mapping(address => address) public seller;
  mapping(address => address) public buyer;
  mapping(address => mapping(address => string)) public deliveryAddress;
  mapping(address => SensorLibrary.Sensors) internal terms;
  mapping(address => address[]) public potentialBuyers;
  mapping(address => mapping(uint => SensorLibrary.Sensors)) proposals;

  event Proposed(address from);
  event Declined(address from);
  event Accepted(address from);
  event Request(address indexed provider);

  modifier condition(bool _condition) {
    require(_condition);
    _;
  }

  modifier onlySeller(address purchase) {
    require(seller[purchase] == msg.sender);
    _;
  }

  modifier notSeller(address purchase) {
    require(!(seller[purchase] == msg.sender));
    _;
  }

  modifier inState(address purchase, State _state) {
    require(state[purchase] == _state);
    _;
  }

  modifier onlyPurchaseContract() {
    require(msg.sender == purchaseContracts[0] || msg.sender == purchaseContracts[1]);
    _;
  }

  function AgreementData(address _token, address agreementDeliver, address agreementReturn) public {
    t = Token(_token);
    purchaseContracts.push(agreementDeliver);
    purchaseContracts.push(agreementReturn);
    require(AgreementDeliver(agreementDeliver).setAgreementData());
    require(AgreementReturn(agreementReturn).setAgreementData());
  }

  function setDapp()
    public
    condition(!dappSet)
    returns(bool)
  {
    dappSet = true;
    dapp = msg.sender;
    return true;
  }

  /** @dev Create a new agreement
    * @param purchase The address of the agreement
    * @param _price The price of the goods
    * @param _seller The seller
    * @param maxTemp Maximum temperature (-999 = not set)
    * @param minTemp Minimum temperature (-999 = not set)
    * @param acceleration Maximum acceleration (-999 = not set)
    * @param humidity Maximum humidity (-999 = not set)
    * @param pressure Maximum pressure (-999 = not set)
    * @param gps True if gps included
    */
  function newPurchase
  (
    address purchase,
    uint _price,
    string _description,
    address _seller,
    int maxTemp,
    int minTemp,
    int acceleration,
    int humidity,
    int pressure,
    bool gps
  )
    public
    condition(msg.sender == dapp)
  {
    price[purchase] = _price;
    description[purchase] = _description;
    seller[purchase] = _seller;
    SensorLibrary.setSensors(terms[purchase], maxTemp, minTemp, acceleration, humidity, pressure, gps);
  }

  ///////////////////
  ///---Created---///
  ///////////////////

  /** @dev Update price
    * @param purchase The address of the agreement
    * @param _price The new price
    */
  function setPrice(address purchase, uint _price)
    public
    onlySeller(purchase)
    condition(state[purchase] == State.Created)
  {
    delete potentialBuyers[purchase];
    price[purchase] = _price;
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
  function propose
  (
    address purchase,
    string _deliveryAddress,
    int maxTemp,
    int minTemp,
    int acceleration,
    int humidity,
    int pressure,
    bool gps
  )
    public
    notSeller(purchase)
    inState(purchase, State.Created)
  {
    uint i =  potentialBuyers[purchase].length;
    potentialBuyers[purchase].push(msg.sender);
    deliveryAddress[purchase][msg.sender] = _deliveryAddress;
    SensorLibrary.setSensors(proposals[purchase][i], maxTemp, minTemp, acceleration, humidity, pressure, gps);
    Proposed(msg.sender);
  }

  /** @dev Decline a proposal
    * @param purchase The address of the agreement
    * @param _buyer The index of the proposal to decline
    */
  function decline(address purchase, uint _buyer)
    public
    condition(msg.sender == seller[purchase] || msg.sender == potentialBuyers[purchase][_buyer])
    inState(purchase, State.Created)
  {
    delete potentialBuyers[purchase][_buyer];
  }

  /** @dev Accept a proposal
    * @param purchase The address of the agreement
    * @param _buyer The index of the proposal to accept
    */
  function accept(address purchase, uint _buyer)
    public
    onlySeller(purchase)
    inState(purchase, State.Created)
    condition(potentialBuyers[purchase][_buyer] != 0x0)
  {
    state[purchase] = State.Locked;
    buyer[purchase] = potentialBuyers[purchase][_buyer];

    SensorLibrary.combineTerms(terms[purchase], proposals[purchase][_buyer]);
    MinimalPurchase(purchase).transferFrom(buyer[purchase], price[purchase]);

    Accepted(msg.sender);
  }

  //////////////////
  ///---Locked---///
  //////////////////

  /** @dev Sets the address of the sensor
    * @param purchase The address of the agreement
    * @param sensorType The sensor to set the address for
    */
  function setProvider(address purchase, uint sensorType)
    public
    condition(state[purchase] == State.Locked || state[purchase] == State.Dissatisfied)
  {
    terms[purchase].sensors[sensorType].provider = msg.sender;
  }

  function setGPSProvider(address purchase)
    public
    condition(state[purchase] == State.Locked || state[purchase] == State.Dissatisfied)
  {
    terms[purchase].gpsProvider = msg.sender;
  }

  ///////////////////
  ///---Transit---///
  ///////////////////

  /** @dev Sends sensor data to the contract
    * @param purchase The address of the agreement
    * @param sensorType The sensor that is sending the data
    * @param value The value of the data
    */
  function sensorData(address purchase, uint sensorType, int value)
    public
    condition(state[purchase] == State.Transit || state[purchase] == State.Return)
  {
    SensorLibrary.sensorData(terms[purchase], sensorType, msg.sender, value);
  }

  /** @dev User requests data from a sensor
    * @param purchase The address of the agreement
    * @param sensorType The sensor that is being sent the request
    */
  function requestData(address purchase, uint sensorType)
    public
    condition(state[purchase] == State.Transit || state[purchase] == State.Return)
  {
    Request(terms[purchase].sensors[sensorType].provider);
  }

  ///////////////////
  ///---Setters---///
  ///////////////////

  function setState(address purchase, State _state)
    public
    onlyPurchaseContract()
  {
    state[purchase] = _state;
  }

  ///////////////////
  ///---Getters---///
  ///////////////////

  /** @dev Get the information about a sensor
    * @param purchase The address of the agreement
    * @param sensorType The sensor to get the information about
    * @return threshold The threshold of the sensor
    * @return warning True if the threshold has been violated
    * @return provider The address of the sensor
    * @return set True if the sensor is included
    */
  function getSensor(address purchase, uint sensorType)
    public
    constant
    returns(int threshold, bool warning, address provider, bool set)
  {
    return(SensorLibrary.getSensor(terms[purchase], sensorType));
  }

  /** @dev Get the information about a proposed sensor
    * @param purchase The address of the agreement
    * @param sensorType The sensor to get the information about
    * @param _buyer The index of the requested proposal
    * @return threshold The threshold of the sensor
    * @return warning True if the threshold has been violated
    * @return provider The address of the sensor
    * @return set True if the sensor is included
    */
  function getProposedTerms(address purchase, uint sensorType, uint _buyer)
    public
    constant
    returns(int threshold, bool warning, address provider, bool set)
  {
    return(SensorLibrary.getSensor(proposals[purchase][_buyer], sensorType));
  }

  /** @dev Get the list of proposals
    * @param purchase The address of the agreement
    * @return proposals The list of proposals
    */
  function getPotentialBuyers(address purchase)
    public
    constant
    returns(address[] _proposals)
  {
    return potentialBuyers[purchase];
  }
}

