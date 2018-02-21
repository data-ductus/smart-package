pragma solidity ^0.4.0;

import "../Token/Token.sol";
import "./SensorLibrary.sol";

contract Purchase {
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

    require(t.transferFrom(msg.sender, this, price) &&
      SensorLibrary.setSensors(sensors, maxTemp, minTemp, acceleration));
    //t.approve(buyer, 0);
    buyer = msg.sender;
  }

  ////////////////////
  ///---Proposed---///
  ////////////////////

  function decline()
    public
    onlySeller
    inState(State.Proposed)
  {
    state = State.Created;
    t.approve(buyer, price);
  }

  function accept()
    public
    onlySeller
    inState(State.Proposed)
  {
    state = State.Locked;
  }

  //////////////////
  ///---Locked---///
  //////////////////

  function setProvider(string sensorType, string id)
    public
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
    (value < sensors.sensors[sensorType].value) == (keccak256(sensorType) == keccak256('minTemp')))
  {
    sensors.sensors[sensorType].warning = true;
  }

  function deliver()
    public
    inState(State.Transit)
  {
    state = State.Confirm;
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
  }

  function dissatisfied()
    public
    onlyBuyer
    inState(State.Confirm)
  {
    state = State.Inactive;
    t.approve(buyer, price);
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
    returns(uint value, bool warning, string provider)
  {
    return (sensors.sensors[name].value, sensors.sensors[name].warning, sensors.sensors[name].provider);
  }
}
