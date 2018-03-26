
pragma solidity ^0.4.0;

import "../Token/Token.sol";
import "./SensorLibrary.sol";
import "./PurchaseData.sol";
import "./MinimalPurchase.sol";

contract Purchase {
  Token t = Token(0x2492ff0373197367f8503f201cefa484df7d8351);
  PurchaseData p;
  bool purchaseDataSet;

  modifier condition(bool _condition) {
    require(_condition);
    _;
  }

  modifier onlyBuyer(address purchase) {
    require(p.buyer(purchase) == msg.sender);
    _;
  }

  modifier onlySeller(address purchase) {
    require(p.seller(purchase) == msg.sender);
    _;
  }

  modifier onlyDeliveryCompany(address purchase) {
    require(p.deliveryCompany(purchase) == msg.sender);
    _;
  }

  modifier notSeller(address purchase) {
    require(!(p.seller(purchase) == msg.sender));
    _;
  }

  modifier inState(address purchase, PurchaseData.State _state) {
    require(p.state(purchase) == _state);
    _;
  }

  event Proposed(address from);
  event Declined(address from);
  event Accepted(address from);
  event Delivered(address from);
  event Satisfied(address from);
  event Dissatisfied(address from);

  function Purchase() public {}

  function setPurchaseData(address _purchaseData)
    public
    condition(!purchaseDataSet)
    returns(bool)
  {
    purchaseDataSet = true;
    p = PurchaseData(_purchaseData);
    return true;
  }

  function newPurchase(address purchase, uint _price, address _seller) {
    p.newPurchase(purchase, _price, _seller);
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
  condition(p.state(purchase) == PurchaseData.State.Created)
  {
    p.setPrice(purchase, _price);
  }

  function abort(address purchase)
  public
  onlySeller(purchase)
  inState(purchase, PurchaseData.State.Created)
  {
    p.setState(purchase, PurchaseData.State.Inactive);
  }

  function propose(address purchase, string deliveryAddress, int maxTemp, int minTemp, int acceleration, int humidity, int pressure)
  public
  notSeller(purchase)
  inState(purchase, PurchaseData.State.Created)
  {
    p.addPotentialBuyer(purchase, deliveryAddress, maxTemp, minTemp, acceleration, humidity, pressure);
  }

  ////////////////////
  ///---Proposed---///
  ////////////////////

  function decline(address purchase, uint buyer)
    public
    onlySeller(purchase)
    inState(purchase, PurchaseData.State.Created)
  {
    p.deleteBuyer(purchase, buyer);
  }

  function accept(address purchase, uint _buyer)
    public
    onlySeller(purchase)
    inState(purchase, PurchaseData.State.Created)
  {
    p.setBuyer(purchase, _buyer);
    MinimalPurchase(purchase).transferFrom(t, p.buyer(purchase), purchase, p.price(purchase));
    p.setState(purchase, PurchaseData.State.Locked);
    Accepted(msg.sender);
  }

  //////////////////
  ///---Locked---///
  //////////////////

  function setProvider(address purchase, string sensorType)
    public
    condition(p.state(purchase) == PurchaseData.State.Locked || p.state(purchase) == PurchaseData.State.Dissatisfied)
  {
    p.setProvider(purchase, sensorType, msg.sender);
  }

  function transport(address purchase, string returnAddress)
    public
    inState(purchase, PurchaseData.State.Locked)
  {
    p.setState(purchase, PurchaseData.State.Transit);
    p.setDeliveryCompany(purchase, msg.sender, returnAddress);
    MinimalPurchase(purchase).transferFrom(t, msg.sender, purchase, p.price(purchase));
  }

  ///////////////////
  ///---Transit---///
  ///////////////////

  function sensorData(address purchase, string sensorType, int value)
    public
    condition(p.state(purchase) == PurchaseData.State.Transit || p.state(purchase) == PurchaseData.State.Return)
  {
    p.sensorData(purchase, sensorType, msg.sender, value);
  }

  function requestData(address purchase, string sensorType)
    public
    condition(p.state(purchase) == PurchaseData.State.Transit || p.state(purchase) == PurchaseData.State.Return)
  {
    p.requestData(purchase, sensorType);
  }

  function deliver(address purchase)
    public
    inState(purchase, PurchaseData.State.Transit)
    onlyDeliveryCompany(purchase)
  {
    p.setState(purchase, PurchaseData.State.Confirm);
    Delivered(msg.sender);
  }

  ///////////////////
  ///---Confirm---///
  ///////////////////

  function satisfied(address purchase)
    public
    onlyBuyer(purchase)
    inState(purchase, PurchaseData.State.Confirm)
  {
    p.setState(purchase, PurchaseData.State.Inactive);
    uint _price = p.price(purchase);
    MinimalPurchase(purchase).approve(t, p.seller(purchase), _price);
    MinimalPurchase(purchase).approve(t, p.deliveryCompany(purchase), _price);
    Satisfied(msg.sender);
  }

  function dissatisfied(address purchase)
    public
    onlyBuyer(purchase)
    inState(purchase, PurchaseData.State.Confirm)
  {
    p.setState(purchase, PurchaseData.State.Dissatisfied);
    Dissatisfied(msg.sender);
  }
}

