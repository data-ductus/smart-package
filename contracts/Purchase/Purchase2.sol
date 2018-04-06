pragma solidity ^0.4.0;

import "../Token/Token.sol";
import "./SensorLibrary.sol";
import "./PurchaseData.sol";
import "./MinimalPurchase.sol";
import "../Voting/Clerk.sol";

contract Purchase2 {

  Token t;
  Clerk c;
  PurchaseData p;
  bool purchaseDataSet;
  mapping(address => uint) clerkPayment;
  mapping(address => PurchaseData.State) previousState;

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
    require(c.isClerk(msg.sender));
    _;
  }

  event Proposed(address from);
  event Declined(address from);
  event Accepted(address from);
  event Delivered(address from);
  event Satisfied(address from);
  event Dissatisfied(address from);

  function Purchase2(address _token, address _clerk) public {
    t = Token(_token);
    c = Clerk(_clerk);
  }

  function setPurchaseData(address _purchaseData)
    public
    condition(!purchaseDataSet)
    returns(bool)
  {
    purchaseDataSet = true;
    p = PurchaseData(_purchaseData);
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
    MinimalPurchase(purchase).approve(p.buyer(purchase), p.price(purchase));
    MinimalPurchase(purchase).approve(p.deliveryCompany(purchase), p.price(purchase));
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
    MinimalPurchase(purchase).approve(p.buyer(purchase), p.price(purchase));
    MinimalPurchase(purchase).approve(p.seller(purchase), p.price(purchase));
  }

  /////////////////
  ///---Clerk---///
  /////////////////

  function solve(address purchase, uint _seller, uint _buyer, uint _delivery)
    public
    onlyClerk()
    inState(purchase, PurchaseData.State.Clerk)
    condition(_seller+_buyer+_delivery+clerkPayment[purchase] == t.balanceOf(purchase))
  {
    p.setState(purchase, PurchaseData.State.Inactive);

    uint tokens = clerkPayment[purchase];
    clerkPayment[purchase] = 0;

    MinimalPurchase(purchase).approve(p.seller(purchase), _seller);
    MinimalPurchase(purchase).approve(p.deliveryCompany(purchase), _delivery);
    MinimalPurchase(purchase).approve(p.buyer(purchase), _buyer);
    MinimalPurchase(purchase).approve(msg.sender, tokens);
  }

  function returnToPreviousState(address purchase)
    public
    onlyClerk()
    inState(purchase, PurchaseData.State.Clerk)
  {
    p.setState(purchase, PurchaseData.State.Inactive);

    uint tokens = clerkPayment[purchase];
    clerkPayment[purchase] = 0;
  }

  function increaseClerkPayment(address purchase, uint amount)
    public
    inState(purchase, PurchaseData.State.Clerk)
  {
    clerkPayment[purchase] += payment;
    MinimalPurchase(purchase).transferFrom(msg.sender, payment);
  }

  ///////////////////////////
  ///---Other functions---///
  ///////////////////////////

  function clerk(address purchase, uint payment)
    public
    condition(p.state(purchase) != PurchaseData.State.Clerk)
  {
    PurchaseData.State s = p.state(purchase);

    p.setState(purchase, PurchaseData.State.Clerk);
    previousState[purchase] = s;

    clerkPayment[purchase] += payment;
    MinimalPurchase(purchase).transferFrom(msg.sender, payment);
  }
}
