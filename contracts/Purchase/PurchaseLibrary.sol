pragma solidity ^0.4.0;

import "../Token/Token.sol";

library PurchaseLibrary {

  uint constant notSet = uint(-999);

  struct Sensor {
    uint threshold;
    bool warning;
    string provider;
    bool set;
  }
  struct Sensors {
    mapping(string => Sensor) sensors;
  }

  Token constant t = Token(0x2492ff0373197367f8503f201cefa484df7d8351);
  enum State { Created, Proposed, Locked, Transit, Confirm, Inactive }

  struct Purchase {
    uint price;
    State state;
    Token t;
    address seller;
    address buyer;
  }

  event Threshold(uint maxTemp, uint minTemp, uint Acceleration);
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

  modifier onlyBuyer(Purchase storage self) {
    require(msg.sender == self.buyer);
    _;
  }

  modifier onlySeller(Purchase storage self) {
    require(msg.sender == self.seller);
    _;
  }

  modifier notSeller(Purchase storage self) {
    require(msg.sender != self.seller);
    _;
  }

  modifier inState(Purchase storage self, State _state) {
    require(self.state == _state);
    _;
  }

  /*function setTokenAddress(address tokenAddress) public {
    t = Token(tokenAddress);
  }*/

  function initPurchase(Purchase storage self, uint _price, address _seller)
    public
    inState(self, State.Created)
  {
    self.seller = _seller;
    self.price = _price;
    self.state = State.Created;
    self.t = t;
  }

  function setPrice(Purchase storage self, uint _price)
    public
    onlySeller(self)
    inState(self, State.Created)
  {
    self.price = _price;
  }

  function abort(Purchase storage self)
    public
    onlySeller(self)
    inState(self, State.Created)
  {
    self.state = State.Inactive;
  }

  function propose(Purchase storage self, Sensors storage sensors, uint maxTemp, uint minTemp, uint acceleration)
    public
    notSeller(self)
    inState(self, State.Created)
  {
    self.state = State.Proposed;

    require(setSensors(sensors, maxTemp, minTemp, acceleration));

    //t.approve(buyer, payed[msg.sender]-price);
    self.buyer = msg.sender;
    Proposed(msg.sender);
  }

  ////////////////////
  ///---Proposed---///
  //////////////////// - payed[buyer]

  function decline(Purchase storage self)
    public
    onlySeller(self)
    inState(self, State.Proposed)
  {
    self.state = State.Created;
    Declined(msg.sender);
  }

  function accept(Purchase storage self)
    public
    onlySeller(self)
    inState(self, State.Proposed)
  {
    require(t.transferFrom(self.buyer, this, self.price));
    self.state = State.Locked;
    Accepted(msg.sender);
  }

  //////////////////
  ///---Locked---///
  //////////////////

  function setProvider(Purchase storage self, Sensors storage sensors, string sensorType, string id)
    public
    inState(self, State.Locked)
  {
    sensors.sensors[sensorType].provider = id;
  }

  function transport(Purchase storage self)
    public
    inState(self, State.Locked)
  {
    self.state = State.Transit;
  }

  ///////////////////
  ///---Transit---///
  ///////////////////

  function sensorData(Purchase storage self, Sensors storage sensors, string sensorType, string id, uint value)
    public
    inState(self, State.Transit)
    condition(keccak256(sensors.sensors[sensorType].provider) == keccak256(id) &&
    (value < sensors.sensors[sensorType].threshold) == (keccak256(sensorType) == keccak256('minTemp')))
  {
    sensors.sensors[sensorType].warning = true;
  }

  function deliver(Purchase storage self)
    public
    inState(self, State.Transit)
  {
    self.state = State.Confirm;
    Delivered(msg.sender);
  }

  ///////////////////
  ///---Confirm---///
  ///////////////////

  function satisfied(Purchase storage self)
    public
    onlyBuyer(self)
    inState(self, State.Confirm)
  {
    self.state = State.Inactive;
    t.approve(self.seller, self.price);
    Satisfied(msg.sender);
  }

  function dissatisfied(Purchase storage self)
    public
    onlyBuyer(self)
    inState(self, State.Confirm)
  {
    self.state = State.Inactive;
    t.approve(self.buyer, self.price);
    Dissatisfied(msg.sender);
  }

  ///////////////////////////
  ///---Other functions---///
  ///////////////////////////

  function withdrawTokens() public {
    uint amount = t.allowance(this, msg.sender);
    t.transferFrom(this, msg.sender, amount);
  }


  function getSensor(Sensors storage sensors, string name)
    public
    constant
    returns(uint threshold, bool warning, string provider, bool set)
  {
    return (sensors.sensors[name].threshold, sensors.sensors[name].warning, sensors.sensors[name].provider, sensors.sensors[name].set);
  }


  function setSensors(Sensors storage self, uint maxTemp, uint minTemp, uint acceleration)
    private
    returns(bool)
  {
    if(keccak256(maxTemp) != keccak256(notSet)) {
      self.sensors["maxTemp"].threshold = maxTemp;
      self.sensors["maxTemp"].set = true;
    }
    if(keccak256(minTemp) != keccak256(notSet)) {
      self.sensors["minTemp"].threshold = minTemp;
      self.sensors["minTemp"].set = true;
    }
    if(keccak256(acceleration) != keccak256(notSet)) {
      self.sensors["acceleration"].threshold = acceleration;
      self.sensors["acceleration"].set = true;
    }
    Threshold(self.sensors["maxTemp"].threshold, self.sensors["minTemp"].threshold, self.sensors["acceleration"].threshold);
    return true;
  }
}
