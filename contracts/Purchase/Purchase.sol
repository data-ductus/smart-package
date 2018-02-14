pragma solidity ^0.4.0;

import "../Token/Token.sol";
import "./SensorLibrary.sol";

contract Purchase {
  SensorLibrary.Sensors sensors;
  uint public price;
  enum State { Created, Proposed, Locked, Transit, Confirm, Inactive }
  State public state;
  Token t;
  address private seller;
  address private buyer;

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

  function Purchase(uint _price) {
    seller = msg.sender;
    price = _price;
    state = State.Created;
    t = Token(0xb170f0f884937860cb4117edd5d327000db90f63);
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
    condition(t.allowance(msg.sender, this) >= price)
  {
    state = State.Proposed;
    require(t.transferFrom(msg.sender, this, price));
    if (maxTemp > 0) {
      require(SensorLibrary.setMaxTemp(sensors, maxTemp));
    }
    if (minTemp > 0) {
      require(SensorLibrary.setMinTemp(sensors, minTemp));
    }
    if (acceleration > 0) {
      require(SensorLibrary.setMaxAcceleration(sensors, acceleration));
    }
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

  function setProvider() {

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

  function sensorData() {

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
    returns(uint, bool, bool, string)
  {
    return (sensors.sensors[name].value, sensors.sensors[name].forbidGreater,
      sensors.sensors[name].warning, sensors.sensors[name].provider);
  }
}
