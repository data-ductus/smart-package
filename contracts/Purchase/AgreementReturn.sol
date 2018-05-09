pragma solidity ^0.4.0;

import "../Token/Token.sol";
import "./SensorLibrary.sol";
import "./AgreementData.sol";
import "./AgreementDeliver.sol";
import "./MinimalPurchase.sol";
import "../Voting/Clerk.sol";

contract AgreementReturn {

  uint constant day = 2;

  Token t;
  Clerk c;
  AgreementData p;
  AgreementDeliver a;
  bool agreementDataSet;

  mapping(address => uint) public clerkPayment;
  mapping(address => AgreementData.State) previousState;
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
    require(a.deliveryCompany(purchase) == msg.sender);
    _;
  }

  modifier notSeller(address purchase) {
    require(!(p.seller(purchase) == msg.sender));
    _;
  }

  modifier inState(address purchase, AgreementData.State _state) {
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

  function AgreementReturn(address _token, address _clerk, address _agreementDeliver) public {
    t = Token(_token);
    c = Clerk(_clerk);
    a = AgreementDeliver(_agreementDeliver);
  }

  /** @dev Set the address of the contract handling the agreement data. Can only be called once.
    */
  function setAgreementData()
    public
    condition(!agreementDataSet)
    returns(bool)
  {
    agreementDataSet = true;
    p = AgreementData(msg.sender);
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
    inState(purchase, AgreementData.State.Dissatisfied)
    onlyDeliveryCompany(purchase)
  {
    p.setState(purchase, AgreementData.State.Return);
  }

  //////////////////
  ///---Return---///
  //////////////////

  /** @dev Deliver the returned goods
    * @param purchase The address of the agreement
    */
  function deliverReturn(address purchase)
    public
    inState(purchase, AgreementData.State.Return)
    onlyDeliveryCompany(purchase)
  {
    p.setState(purchase, AgreementData.State.Returned);
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
    inState(purchase, AgreementData.State.Returned)
    condition(now > arrivalTime[purchase] + day)
  {
    p.setState(purchase, AgreementData.State.Inactive);
    MinimalPurchase(purchase).approve(p.buyer(purchase), p.price(purchase));
    MinimalPurchase(purchase).approve(a.deliveryCompany(purchase), p.price(purchase));
  }

  /** @dev Can be called by the seller to ask for compensation for the goods.
    * @param purchase The address of the agreement
    */
  function goodsDamaged(address purchase)
    public
    onlySeller(purchase)
    inState(purchase, AgreementData.State.Returned)
    condition(now <= arrivalTime[purchase] + day)
  {
    p.setState(purchase, AgreementData.State.Review);
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
    inState(purchase, AgreementData.State.Review)
  {
    p.setState(purchase, AgreementData.State.Inactive);
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
    inState(purchase, AgreementData.State.Clerk)
    condition(_seller+_buyer+_delivery+clerkPayment[purchase] == t.balanceOf(purchase))
  {
    p.setState(purchase, AgreementData.State.Appeal);
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
    inState(purchase, AgreementData.State.Clerk)
  {
    p.setState(purchase, AgreementData.State.Appeal);
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
    inState(purchase, AgreementData.State.Clerk)
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
    inState(purchase, AgreementData.State.Appeal)
    condition(now <= arrivalTime[purchase] + day)
    condition(msg.sender == p.seller(purchase)
      || msg.sender == p.buyer(purchase)
      || msg.sender == a.deliveryCompany(purchase))
  {
    p.setState(purchase, AgreementData.State.Clerk);

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
    inState(purchase, AgreementData.State.Appeal)
    condition(now > arrivalTime[purchase] + day)
  {
    if (returnToPrevState[purchase]) {
      p.setState(purchase, previousState[purchase]);
    } else {
      p.setState(purchase, AgreementData.State.Inactive);

      MinimalPurchase(purchase).approve(p.seller(purchase), sellerTokens[purchase]);
      MinimalPurchase(purchase).approve(a.deliveryCompany(purchase), logisticsTokens[purchase]);
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
    condition(p.state(purchase) != AgreementData.State.Clerk)
    condition(msg.sender == p.seller(purchase)
      || msg.sender == p.buyer(purchase)
      || msg.sender == a.deliveryCompany(purchase))
  {
    AgreementData.State s = p.state(purchase);

    p.setState(purchase, AgreementData.State.Clerk);
    previousState[purchase] = s;

    clerkPayment[purchase] += payment;
    MinimalPurchase(purchase).transferFrom(msg.sender, payment);
  }
}
