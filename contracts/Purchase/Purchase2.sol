pragma solidity ^0.4.0;

import "../Token/Token.sol";
import "./SensorLibrary.sol";
import "./MinimalPurchase.sol";
import "../DApp.sol";

contract Purchase2 {

  DApp dapp;
  Token t = Token(0x2492ff0373197367f8503f201cefa484df7d8351);
  enum State { Created, Locked, Transit, Confirm, Dissatisfied, Return, Returned, Review, Clerk, Inactive }

  struct Purchase {
    uint price;
    State state;
    Token t;
    address seller;
    address buyerAddress;
    address deliveryCompany;
    uint buyerIndex;
    address[] potentialBuyers;
    mapping(address => string) deliveryAddresses;
    mapping(uint => SensorLibrary.Sensors) terms;
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
    require(msg.sender == purchases[purchase].buyerAddress);
    _;
  }

  modifier onlySeller(address purchase) {
    require(msg.sender == purchases[purchase].seller);
    _;
  }

  modifier onlyDeliveryCompany(address purchase) {
    require(msg.sender == purchases[purchase].deliveryCompany);
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

  modifier onlyClerk() {
    require(dapp.isClerk(msg.sender));
    _;
  }

  function Purchase2(address _dapp) public
  {
    dapp = DApp(_dapp);
  }

  function newPurchase(address purchase, uint _price, address _seller) {
    purchases[purchase].price = _price;
    purchases[purchase].seller = _seller;
    purchases[purchase].buyerIndex = uint(-1);
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
    delete purchases[purchase].potentialBuyers;
    purchases[purchase].price = _price;
  }

  function abort(address purchase)
    public
    onlySeller(purchase)
    inState(purchase, State.Created)
  {
    purchases[purchase].state = State.Inactive;
  }

  function propose(address purchase, string deliveryAddress, int maxTemp, int minTemp, int acceleration, int humidity, int pressure)
    public
    notSeller(purchase)
    inState(purchase, State.Created)
  {
    uint i =  purchases[purchase].potentialBuyers.length;
    purchases[purchase].potentialBuyers.push(msg.sender);
    purchases[purchase].deliveryAddresses[msg.sender] = deliveryAddress;
    require(SensorLibrary.setSensors(purchases[purchase].terms[i], maxTemp, minTemp, acceleration, humidity, pressure));
    Proposed(msg.sender);
  }

  ////////////////////
  ///---Proposed---///
  ////////////////////

  function decline(address purchase, uint buyer)
    public
    onlySeller(purchase)
    inState(purchase, State.Created)
  {
    Declined(purchases[purchase].potentialBuyers[buyer]);
    delete purchases[purchase].potentialBuyers[buyer];
  }

  function accept(address purchase, uint buyer)
    public
    onlySeller(purchase)
    inState(purchase, State.Created)
  {
    purchases[purchase].buyerAddress = purchases[purchase].potentialBuyers[buyer];
    purchases[purchase].buyerIndex = buyer;
    MinimalPurchase(purchase).transferFrom(purchases[purchase].t, purchases[purchase].buyerAddress, purchase, purchases[purchase].price);
    purchases[purchase].state = State.Locked;
    Accepted(msg.sender);
  }

  //////////////////
  ///---Locked---///
  //////////////////

  function setProvider(address purchase, string sensorType)
    public
    condition(purchases[purchase].state == State.Locked || purchases[purchase].state == State.Dissatisfied)
  {
    purchases[purchase].terms[purchases[purchase].buyerIndex].sensors[sensorType].provider = msg.sender;
  }

  function transport(address purchase)
    public
    inState(purchase, State.Locked)
  {
    purchases[purchase].deliveryCompany = msg.sender;
    MinimalPurchase(purchase).transferFrom(purchases[purchase].t, msg.sender, purchase, purchases[purchase].price);
    purchases[purchase].state = State.Transit;
  }

  ///////////////////
  ///---Transit---///
  ///////////////////

  function sensorData(address purchase, string sensorType, int value)
    public
    condition(purchases[purchase].state == State.Transit || purchases[purchase].state == State.Return)
  {
    SensorLibrary.sensorData(purchases[purchase].terms[purchases[purchase].buyerIndex], sensorType, msg.sender, value);
  }

  function requestData(address purchase, string sensorType)
    public
    condition(purchases[purchase].state == State.Transit || purchases[purchase].state == State.Return)
  {
    SesnorLibrary.requestData(purchases[purchase].terms[purchases[purchase].buyerIndex], sensorType);
  }

  function deliver(address purchase)
    public
    inState(purchase, State.Transit)
    onlyDeliveryCompany(purchase)
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
    MinimalPurchase(purchase).approve(purchases[purchase].t, purchases[purchase].deliveryCompany, purchases[purchase].price);
    Satisfied(msg.sender);
  }

  function dissatisfied(address purchase)
    public
    onlyBuyer(purchase)
    inState(purchase, State.Confirm)
  {
    purchases[purchase].state = State.Dissatisfied;
    Dissatisfied(msg.sender);
  }

  ////////////////////////
  ///---Dissatisfied---///
  ////////////////////////

  function transportReturn(address purchase)
    public
    inState(purchase, State.Dissatisfied)
    onlyDeliveryCompany(purchase)
  {
    purchases[purchase].state = State.Return;
    MinimalPurchase(purchase).approve(purchases[purchase].t, purchases[purchase].buyerAddress, purchases[purchase].price);
  }

  //////////////////
  ///---Return---///
  //////////////////

  function deliverReturn(address purchase)
    public
    inState(purchase, State.Return)
    onlyDeliveryCompany(purchase)
  {
    purchases[purchase].state = State.Returned;
  }

  ////////////////////
  ///---Returned---///
  ////////////////////

  function sellerSatisfied(address purchase)
    public
    onlySeller(purchase)
    inState(purchase, State.Returned)
  {
    purchases[purchase].state = State.Inactive;
    MinimalPurchase(purchase).approve(purchases[purchase].t, purchases[purchase].deliveryCompany, purchases[purchase].price);
  }

  function goodsDamaged(address purchase)
    public
    onlySeller(purchase)
    inState(purchase, State.Returned)
    condition(SensorLibrary.warning(purchases[purchase].terms[purchases[purchase].buyerIndex]))
  {
    purchases[purchase].state = State.Review;
  }

  //////////////////
  ///---Review---///
  //////////////////

  function compensate(address purchase)
    public
    onlyDeliveryCompany(purchase)
    inState(purchase, State.Review)
  {
    purchases[purchase].state = State.Inactive;
    MinimalPurchase(purchase).approve(purchases[purchase].t, purchases[purchase].seller, purchases[purchase].price);
  }

  function clerk(address purchase)
    public
    onlyDeliveryCompany(purchase)
    inState(purchase, State.Review)
  {
    purchases[purchase].state = State.Clerk;
  }

  /////////////////
  ///---Clerk---///
  /////////////////

  function solve(address purchase, uint dividend, uint divisor)
    public
    onlyClerk()
    inState(purchase, State.Clerk)
  {
    purchases[purchase].state = State.Inactive;
    uint share = purchases[purchase].price/dividend * divisor;
    MinimalPurchase(purchase).approve(purchases[purchase].t, purchases[purchase].seller, share);
    MinimalPurchase(purchase).approve(purchases[purchase].t, purchases[purchase].deliveryCompany, purchases[purchase].price - share);
  }

  ///////////////////////////
  ///---Other functions---///
  ///////////////////////////

  function getSensor(address purchase, string name, uint _buyer)
    public
    constant
    returns(int threshold, bool warning, address provider, bool set)
  {
    return(SensorLibrary.getSensor(purchases[purchase].terms[_buyer], name));
  }

  function getActiveSensor(address purchase, string name)
    public
    constant
    returns(int threshold, bool warning, address provider, bool set)
  {
    return(SensorLibrary.getSensor(purchases[purchase].terms[purchases[purchase].buyerIndex], name));
  }

  function getPurchase(address purchase)
    public
    constant
    returns(uint price, State state, address seller, address buyerAddress, uint buyerIndex)
  {
    return (purchases[purchase].price, purchases[purchase].state, purchases[purchase].seller, purchases[purchase].buyerAddress,
      purchases[purchase].buyerIndex);
  }

  function getPotentialBuyers(address purchase)
    public
    constant
    returns(address[] potentialBuyers)
  {
    return purchases[purchase].potentialBuyers;
  }
}
