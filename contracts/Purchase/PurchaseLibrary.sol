pragma solidity ^0.4.0;

import "../Token/Token.sol";

library PurchaseLibrary {

  Token constant t = Token(0x2492ff0373197367f8503f201cefa484df7d8351);
  enum State { Created, Proposed, Locked, Transit, Confirm, Inactive }

  struct Purchase {
    uint price;
    State state;
    Token t;
    address seller;
    address buyer;
  }

  event Proposed();
  event Declined();
  event Accepted();
  event Delivered();
  event Satisfied();
  event Dissatisfied();

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
}
