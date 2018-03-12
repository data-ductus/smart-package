
pragma solidity ^0.4.0;

import "../Token/Token.sol";
import "./SensorLibrary.sol";
import "./PurchaseLibrary.sol";

contract Purchase {
  /*
  SensorLibrary.Sensors sensors;
  uint public price;
  enum State { Created, Proposed, Locked, Transit, Confirm, Inactive }
  State public state;
  Token t;
  address public seller;
  address public buyer;

  /////////////////////
  ///---Modifiers---///
  /////////////////////

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

  modifier onlyBuyer() {
    require(msg.sender == buyer);
    _;
  }

  modifier onlySeller() {
    require(msg.sender == seller);
    _;
  }

  modifier notSeller() {
    require(msg.sender != seller);
    _;
  }

  modifier inState(State _state) {
    require(state == _state);
    _;
  }

  function Purchase(uint _price, address _seller) {
    seller = _seller;
    price = _price;
    state = State.Created;
    t = Token(0x2492ff0373197367f8503f201cefa484df7d8351);
  }

  function setTokenAddress(address tokenAddress) public {
    t = Token(tokenAddress);
  }

  ///////////////////
  ///---Created---///
  ///////////////////

  function setPrice(uint _price)
    public
    onlySeller
    inState(State.Created)
  {
    price = _price;
  }

  function abort()
    public
    onlySeller
    inState(State.Created)
  {
    state = State.Inactive;
  }

  function propose(uint maxTemp, uint minTemp, uint acceleration)
    public
    notSeller
    inState(State.Created)
  {
    state = State.Proposed;

    require(SensorLibrary.setSensors(sensors, maxTemp, minTemp, acceleration));

    //t.approve(buyer, payed[msg.sender]-price);
    buyer = msg.sender;
    Proposed(msg.sender);
  }

  ////////////////////
  ///---Proposed---///
  //////////////////// - payed[buyer]

  function decline()
    public
    onlySeller
    inState(State.Proposed)
  {
    state = State.Created;
    Declined(msg.sender);
  }

  function accept()
    public
    onlySeller
    inState(State.Proposed)
  {
    require(t.transferFrom(buyer, this, price));
    state = State.Locked;
    Accepted(msg.sender);
  }

  //////////////////
  ///---Locked---///
  //////////////////

  function setProvider(string sensorType, string id)
    public
    inState(State.Locked)
  {
    sensors.sensors[sensorType].provider = id;
  }

  function transport()
    public
    inState(State.Locked)
  {
    state = State.Transit;
  }

  ///////////////////
  ///---Transit---///
  ///////////////////

  function sensorData(string sensorType, string id, uint value)
    public
    inState(State.Transit)
    condition(keccak256(sensors.sensors[sensorType].provider) == keccak256(id) &&
    (value < sensors.sensors[sensorType].threshold) == (keccak256(sensorType) == keccak256('minTemp')))
  {
    sensors.sensors[sensorType].warning = true;
  }

  function deliver()
    public
    inState(State.Transit)
  {
    state = State.Confirm;
    Delivered(msg.sender);
  }

  ///////////////////
  ///---Confirm---///
  ///////////////////

  function satisfied()
    public
    onlyBuyer
    inState(State.Confirm)
  {
    state = State.Inactive;
    t.approve(seller, price);
    Satisfied(msg.sender);
  }

  function dissatisfied()
    public
    onlyBuyer
    inState(State.Confirm)
  {
    state = State.Inactive;
    t.approve(buyer, price);
    Dissatisfied(msg.sender);
  }

  ///////////////////////////
  ///---Other functions---///
  ///////////////////////////

  function withdrawTokens() public {
    uint amount = t.allowance(this, msg.sender);
    t.transferFrom(this, msg.sender, amount);
  }

  function getSensor(string name)
    public
    constant
    returns(uint threshold, bool warning, string provider, bool set)
  {
    return (sensors.sensors[name].threshold, sensors.sensors[name].warning, sensors.sensors[name].provider, sensors.sensors[name].set);
  }
*/
}

