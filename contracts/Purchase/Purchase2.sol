pragma solidity ^0.4.0;

import "../Token/Token.sol";
import "./SensorLibrary.sol";
import "./PurchaseData.sol";
import "./MinimalPurchase.sol";
import "../Voting/Clerk.sol";

contract Purchase2 {

  uint constant day = 20;

  Token t;
  Clerk c;
  PurchaseData p;
  bool purchaseDataSet;
  mapping(address => uint) public clerkPayment;
  mapping(address => PurchaseData.State) previousState;
  mapping(address => uint) public arrivalTime;
  mapping(address => uint) public sellerTokens;
  mapping(address => uint) public buyerTokens;
  mapping(address => uint) public logisticsTokens;
  mapping(address => bool) public returnToPrevState;
  mapping(address => address) public currentClerk;

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

  /** @dev Set the address of the contract handling the agreement data. Can only be called once.
    * @param _purchaseData The address of the data contract.
    */
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

  /** @dev Begin the return of the goods
    * @param purchase The address of the agreement
    */
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

  /** @dev Deliver the returned goods
    * @param purchase The address of the agreement
    */
  function deliverReturn(address purchase)
    public
    inState(purchase, PurchaseData.State.Return)
    onlyDeliveryCompany(purchase)
  {
    p.setState(purchase, PurchaseData.State.Returned);
    arrivalTime[purchase] = now;
  }

  ////////////////////
  ///---Returned---///
  ////////////////////

  /** @dev Successful return of goods. Can be called by anyone after a certain time.
    * @param purchase The address of the agreement
    */
  function successReturn(address purchase)
    public
    inState(purchase, PurchaseData.State.Returned)
    condition(now > arrivalTime[purchase] + day)
  {
    p.setState(purchase, PurchaseData.State.Inactive);
    MinimalPurchase(purchase).approve(p.buyer(purchase), p.price(purchase));
    MinimalPurchase(purchase).approve(p.deliveryCompany(purchase), p.price(purchase));
  }

  /** @dev Can be called by the seller to ask for compensation for the goods.
    * @param purchase The address of the agreement
    */
  function goodsDamaged(address purchase)
    public
    onlySeller(purchase)
    inState(purchase, PurchaseData.State.Returned)
    condition(now <= arrivalTime[purchase] + day)
  {
    p.setState(purchase, PurchaseData.State.Review);
  }

  //////////////////
  ///---Review---///
  //////////////////

  /** @dev Can be called by the seller to ask for compensation for the goods.
    * @param purchase The address of the agreement
    */
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

  /** @dev A clerk proposes a solution to a disagreement
    * @param purchase The address of the agreement
    * @param _seller Tokens to seller
    * @param _seller Tokens to buyer
    * @param _delivery Tokens to delivery company
    */
  function solve(address purchase, uint _seller, uint _buyer, uint _delivery)
    public
    onlyClerk()
    inState(purchase, PurchaseData.State.Clerk)
    condition(_seller+_buyer+_delivery+clerkPayment[purchase] == t.balanceOf(purchase))
  {
    p.setState(purchase, PurchaseData.State.Appeal);
    currentClerk[purchase] = msg.sender;
    arrivalTime[purchase] = now;

    sellerTokens[purchase] = _seller;
    buyerTokens[purchase] = _buyer;
    logisticsTokens[purchase] = _delivery;
  }

  /** @dev A clerk proposes a return to the previous state
    * @param purchase The address of the agreement
    */
  function returnToPreviousState(address purchase)
    public
    onlyClerk()
    inState(purchase, PurchaseData.State.Clerk)
  {
    p.setState(purchase, PurchaseData.State.Appeal);
    currentClerk[purchase] = msg.sender;
    arrivalTime[purchase] = now;
    returnToPrevState[purchase] = true;
  }

  /** @dev Increase the reward given to a clerk with an acceptable solution
    * @param purchase The address of the agreement
    * @param amount The amount to increase the reward with
    */
  function increaseClerkPayment(address purchase, uint amount)
    public
    inState(purchase, PurchaseData.State.Clerk)
  {
    clerkPayment[purchase] += amount;
    MinimalPurchase(purchase).transferFrom(msg.sender, amount);
  }

  //////////////////
  ///---Appeal---///
  //////////////////

  /** @dev Appeal against a clerk's decision
    * @param purchase The address of the agreement
    */
  function rejectClerkDecision(address purchase)
    public
    inState(purchase, PurchaseData.State.Appeal)
    condition(now <= arrivalTime[purchase] + day)
    condition(msg.sender == p.seller(purchase)
      || msg.sender == p.buyer(purchase)
      || msg.sender == p.deliveryCompany(purchase))
  {
    p.setState(purchase, PurchaseData.State.Clerk);

    delete sellerTokens[purchase];
    delete buyerTokens[purchase];
    delete logisticsTokens[purchase];
    returnToPrevState[purchase] = false;
  }

  /** @dev Accept the decision made by a clerk. Available for anyone after a certain time.
    * @param purchase The address of the agreement
    */
  function finalizeClerkDecision(address purchase)
    public
    inState(purchase, PurchaseData.State.Appeal)
    condition(now > arrivalTime[purchase] + day)
  {
    if (returnToPrevState[purchase]) {
      p.setState(purchase, previousState[purchase]);
    } else {
      p.setState(purchase, PurchaseData.State.Inactive);

      MinimalPurchase(purchase).approve(p.seller(purchase), sellerTokens[purchase]);
      MinimalPurchase(purchase).approve(p.deliveryCompany(purchase), logisticsTokens[purchase]);
      MinimalPurchase(purchase).approve(p.buyer(purchase), buyerTokens[purchase]);
    }
    uint tokens = clerkPayment[purchase];
    clerkPayment[purchase] = 0;

    MinimalPurchase(purchase).approve(currentClerk[purchase], tokens);
  }

  ///////////////////////////
  ///---Other functions---///
  ///////////////////////////

  /** @dev Lock the contract and wait for a clerk to come up with a solution
    * @param purchase The address of the agreement
    * @param payment The reward promised to the clerk
    */
  function clerk(address purchase, uint payment)
    public
    condition(p.state(purchase) != PurchaseData.State.Clerk)
    condition(msg.sender == p.seller(purchase)
      || msg.sender == p.buyer(purchase)
      || msg.sender == p.deliveryCompany(purchase))
  {
    PurchaseData.State s = p.state(purchase);

    p.setState(purchase, PurchaseData.State.Clerk);
    previousState[purchase] = s;

    clerkPayment[purchase] += payment;
    MinimalPurchase(purchase).transferFrom(msg.sender, payment);
  }
}
