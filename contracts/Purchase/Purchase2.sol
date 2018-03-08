pragma solidity ^0.4.0;

import "../Token/Token.sol";
import "./SensorLibrary.sol";
import "./MinimalPurchase.sol";

contract Purchase2 {

  Token t = Token(0x2492ff0373197367f8503f201cefa484df7d8351);
  enum State { Created, Proposed, Locked, Transit, Confirm, Inactive }

  struct Purchase {
    SensorLibrary.Sensors sensors;
    uint price;
    State state;
    Token t;
    address seller;
    address buyer;
  }

  mapping(address => Purchase) purchases;

  event Proposed(address from);
  event Declined(address from);
  event Accepted(address from);
  event Delivered(address from);
  event Satisfied(address from);
  event Dissatisfied(address from);

  modifier condition(bool _condition) {
    require(_condition);
    _;
  }

  modifier onlyBuyer(address purchase) {
    require(msg.sender == purchases[purchase].buyer);
    _;
  }

  modifier onlySeller(address purchase) {
    require(msg.sender == purchases[purchase].seller);
    _;
  }

  modifier notSeller(address purchase) {
    require(msg.sender != purchases[purchase].seller);
    _;
  }

  modifier inState(address purchase, State _state) {
    require(purchases[purchase].state == _state);
    _;
  }

  function Purchase2(){}

  function newPurchase(address purchase, uint _price, address _seller) {
    purchases[purchase].price = _price;
    purchases[purchase].seller = _seller;
    purchases[purchase].t = t;
  }

  function setTokenAddress(address tokenAddress) public {
    t = Token(tokenAddress);
  }

  ///////////////////
  ///---Created---///
  ///////////////////

  function setPrice(address purchase, uint _price)
    public
    onlySeller(purchase)
    inState(purchase, State.Created)
  {
    purchases[purchase].price = _price;
  }

  function abort(address purchase)
    public
    onlySeller(purchase)
    inState(purchase, State.Created)
  {
    purchases[purchase].state = State.Inactive;
  }

  function propose(address purchase, uint maxTemp, uint minTemp, uint acceleration)
    public
    notSeller(purchase)
    inState(purchase, State.Created)
  {
    purchases[purchase].state = State.Proposed;
    require(SensorLibrary.setSensors(purchases[purchase].sensors, maxTemp, minTemp, acceleration));
    purchases[purchase].buyer = msg.sender;
    Proposed(msg.sender);
  }

  ////////////////////
  ///---Proposed---///
  ////////////////////

  function decline(address purchase)
    public
    onlySeller(purchase)
    inState(purchase, State.Proposed)
  {
    purchases[purchase].state = State.Created;
    Declined(msg.sender);
  }

  function accept(address purchase)
    public
    onlySeller(purchase)
    inState(purchase, State.Proposed)
  {
    MinimalPurchase(purchase).transferFrom(purchases[purchase].t, purchases[purchase].buyer, purchase, purchases[purchase].price);
    purchases[purchase].state = State.Locked;
    Accepted(msg.sender);
  }

  //////////////////
  ///---Locked---///
  //////////////////

  function setProvider(address purchase, string sensorType, string id)
    public
    inState(purchase, State.Locked)
  {
    purchases[purchase].sensors.sensors[sensorType].provider = id;
  }

  function transport(address purchase)
    public
    inState(purchase, State.Locked)
  {
    purchases[purchase].state = State.Transit;
  }

  ///////////////////
  ///---Transit---///
  ///////////////////

  function sensorData(address purchase, string sensorType, string id, uint value)
    public
    inState(purchase, State.Transit)
    condition(keccak256(purchases[purchase].sensors.sensors[sensorType].provider) == keccak256(id) &&
    (value < purchases[purchase].sensors.sensors[sensorType].threshold) == (keccak256(sensorType) == keccak256('minTemp')))
  {
    purchases[purchase].sensors.sensors[sensorType].warning = true;
  }

  function deliver(address purchase)
    public
    inState(purchase, State.Transit)
  {
    purchases[purchase].state = State.Confirm;
    Delivered(msg.sender);
  }

  ///////////////////
  ///---Confirm---///
  ///////////////////

  function satisfied(address purchase)
    public
    onlyBuyer(purchase)
    inState(purchase, State.Confirm)
  {
    purchases[purchase].state = State.Inactive;
    MinimalPurchase(purchase).approve(purchases[purchase].t, purchases[purchase].seller, purchases[purchase].price);
    Satisfied(msg.sender);
  }

  function dissatisfied(address purchase)
    public
    onlyBuyer(purchase)
    inState(purchase, State.Confirm)
  {
    purchases[purchase].state = State.Inactive;
    MinimalPurchase(purchase).approve(purchases[purchase].t, purchases[purchase].buyer, purchases[purchase].price);
    Dissatisfied(msg.sender);
  }

  ///////////////////////////
  ///---Other functions---///
  ///////////////////////////

  function getSensor(address purchase, string name)
    public
    constant
    returns(uint threshold, bool warning, string provider, bool set)
  {
    return (purchases[purchase].sensors.sensors[name].threshold, purchases[purchase].sensors.sensors[name].warning,
    purchases[purchase].sensors.sensors[name].provider, purchases[purchase].sensors.sensors[name].set);
  }

  function getPurchase(address purchase)
    public
    constant
    returns(uint price, State state, address seller, address buyer)
  {
    return (purchases[purchase].price, purchases[purchase].state, purchases[purchase].seller, purchases[purchase].buyer);
  }
}
