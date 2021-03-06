pragma solidity ^0.4.0;

import "./AgreementData.sol";
import "./MinimalPurchase.sol";

contract AgreementDeliver {

  AgreementData p;
  bool agreementDataSet;

  mapping(address => address) public deliveryCompany;
  mapping(address => string) public returnAddress;
  mapping(address => uint) public arrivalTime;
  uint constant public day = 2;

  modifier condition(bool _condition) {
    require(_condition);
    _;
  }

  modifier inState(address purchase, AgreementData.State _state) {
    require(p.state(purchase) == _state);
    _;
  }

  modifier onlySeller(address purchase) {
    require(p.seller(purchase) == msg.sender);
    _;
  }

  modifier onlyDeliveryCompany(address purchase) {
    require(deliveryCompany[purchase] == msg.sender);
    _;
  }

  modifier onlyBuyer(address purchase) {
    require(p.buyer(purchase) == msg.sender);
    _;
  }

  event Delivered(address from);
  event Satisfied(address from);
  event Dissatisfied(address from);

  function AgreementDeliver(){
  }

  function setAgreementData()
    public
    condition(!agreementDataSet)
    returns(bool)
  {
    agreementDataSet = true;
    p = AgreementData(msg.sender);
    return true;
  }

  ///////////////////
  ///---Created---///
  ///////////////////

  /** @dev Abort the agreement
    * @param purchase The address of the agreement
    */
  function abort(address purchase)
    public
    onlySeller(purchase)
    inState(purchase, AgreementData.State.Created)
  {
    p.setState(purchase, AgreementData.State.Inactive);
  }

  //////////////////
  ///---Locked---///
  //////////////////

  /** @dev Starts the transportation
    * @param purchase The address of the agreement
    * @param _returnAddress The location the goods are being transported from
    */
  function transport(address purchase, string _returnAddress)
    public
    inState(purchase, AgreementData.State.Locked)
  {
    p.setState(purchase, AgreementData.State.Transit);
    deliveryCompany[purchase] = msg.sender;
    returnAddress[purchase] = _returnAddress;
    MinimalPurchase(purchase).transferFrom(msg.sender, p.price(purchase));
  }

  ///////////////////
  ///---Transit---///
  ///////////////////

  /** @dev Deliver the goods
    * @param purchase The address of the agreement
    */
  function deliver(address purchase)
    public
    inState(purchase, AgreementData.State.Transit)
    onlyDeliveryCompany(purchase)
  {
    p.setState(purchase, AgreementData.State.Confirm);
    arrivalTime[purchase] = now;
    Delivered(msg.sender);
  }

  ///////////////////
  ///---Confirm---///
  ///////////////////

  /** @dev Successful agreement. Can be called by anyone after a certain time.
    * @param purchase The address of the agreement
    */
  function success(address purchase)
    public
    condition(now > arrivalTime[purchase] + day)
    inState(purchase, AgreementData.State.Confirm)
  {
    p.setState(purchase, AgreementData.State.Inactive);
    uint _price = p.price(purchase);
    MinimalPurchase(purchase).approve(p.seller(purchase), _price);
    MinimalPurchase(purchase).approve(deliveryCompany[purchase], _price);
    Satisfied(msg.sender);
  }

  /** @dev Can be called by the buyer to return the goods.
    * @param purchase The address of the agreement
    */
  function dissatisfied(address purchase)
    public
    onlyBuyer(purchase)
    inState(purchase, AgreementData.State.Confirm)
    condition(now <= arrivalTime[purchase] + day)
  {
    p.setState(purchase, AgreementData.State.Dissatisfied);
    Dissatisfied(msg.sender);
  }
}
