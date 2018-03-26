pragma solidity ^0.4.0;

import "../Token/Token.sol";
import "./SensorLibrary.sol";
import "./PurchaseData.sol";
import "./MinimalPurchase.sol";
import "../DApp.sol";

contract Purchase2 {

  DApp dapp;
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

  modifier onlyClerk() {
    require(dapp.isClerk(msg.sender));
    _;
  }

  event Proposed(address from);
  event Declined(address from);
  event Accepted(address from);
  event Delivered(address from);
  event Satisfied(address from);
  event Dissatisfied(address from);

  function Purchase2() public {}

  function setPurchaseData(address _purchaseData)
    public
    condition(!purchaseDataSet)
    returns(bool)
  {
    purchaseDataSet = true;
    p = PurchaseData(_purchaseData);
    return true;
  }

  function setDapp(address _dapp)
    public
    returns(bool)
  {
    dapp = DApp(_dapp);
    return true;
  }

  ////////////////////////
  ///---Dissatisfied---///
  ////////////////////////

  function transportReturn(address purchase)
    public
    inState(purchase, PurchaseData.State.Dissatisfied)
    onlyDeliveryCompany(purchase)
  {
    p.setState(purchase, PurchaseData.State.Return);
    MinimalPurchase(purchase).approve(t, p.buyer(purchase), p.price(purchase));
  }

  //////////////////
  ///---Return---///
  //////////////////

  function deliverReturn(address purchase)
    public
    inState(purchase, PurchaseData.State.Return)
    onlyDeliveryCompany(purchase)
  {
    p.setState(purchase, PurchaseData.State.Returned);
  }

  ////////////////////
  ///---Returned---///
  ////////////////////

  function sellerSatisfied(address purchase)
    public
    onlySeller(purchase)
    inState(purchase, PurchaseData.State.Returned)
  {
    p.setState(purchase, PurchaseData.State.Inactive);
    MinimalPurchase(purchase).approve(t, p.deliveryCompany(purchase), p.price(purchase));
  }

  function goodsDamaged(address purchase)
    public
    onlySeller(purchase)
    inState(purchase, PurchaseData.State.Returned)
    //condition(SensorLibrary.warning(purchases[purchase].terms[purchases[purchase].buyerIndex]))
  {
    p.setState(purchase, PurchaseData.State.Review);
  }

  //////////////////
  ///---Review---///
  //////////////////

  function compensate(address purchase)
    public
    onlyDeliveryCompany(purchase)
    inState(purchase, PurchaseData.State.Review)
  {
    p.setState(purchase, PurchaseData.State.Inactive);
    MinimalPurchase(purchase).approve(t, p.seller(purchase), p.price(purchase));
  }

  function clerk(address purchase)
    public
    onlyDeliveryCompany(purchase)
    inState(purchase, PurchaseData.State.Review)
  {
    p.setState(purchase, PurchaseData.State.Clerk);
  }

  /////////////////
  ///---Clerk---///
  /////////////////

  function solve(address purchase, uint _seller, uint _buyer, uint _delivery)
    public
    onlyClerk()
    inState(purchase, PurchaseData.State.Clerk)
    condition(_seller+_buyer+_delivery == t.balanceOf(purchase))
  {
    p.setState(purchase, PurchaseData.State.Inactive);
    MinimalPurchase(purchase).approve(t, p.seller(purchase), _seller);
    MinimalPurchase(purchase).approve(t, p.deliveryCompany(purchase), _delivery);
    MinimalPurchase(purchase).approve(t, p.buyer(purchase), _buyer);
  }

  ///////////////////////////
  ///---Other functions---///
  ///////////////////////////
}
