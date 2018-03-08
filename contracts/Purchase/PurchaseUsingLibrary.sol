pragma solidity ^0.4.0;

import "./PurchaseLibrary.sol";

contract PurchaseUsingLibrary {
  PurchaseLibrary.Sensors sensors;
  PurchaseLibrary.Purchase purchaseInfo;

  /////////////////////
  ///---Modifiers---///
  /////////////////////

  function PurchaseUsingLibrary(uint _price, address _seller) {
    PurchaseLibrary.initPurchase(purchaseInfo, _price, _seller);
  }

  ///////////////////
  ///---Created---///
  ///////////////////

  function setPrice(uint _price)
  {
    PurchaseLibrary.setPrice(purchaseInfo, _price);
  }

  function abort()
  {
    PurchaseLibrary.abort(purchaseInfo);
  }

  function propose(uint maxTemp, uint minTemp, uint acceleration)
  {
    PurchaseLibrary.propose(purchaseInfo, sensors, maxTemp, minTemp, acceleration);
  }

  ////////////////////
  ///---Proposed---///
  //////////////////// - payed[buyer]

  function decline()
  {
    PurchaseLibrary.decline(purchaseInfo);
  }

  function accept()
  {
    PurchaseLibrary.accept(purchaseInfo);
  }

  //////////////////
  ///---Locked---///
  //////////////////

  function setProvider(string sensorType, string id)
  {
    PurchaseLibrary.setProvider(purchaseInfo, sensors, sensorType, id);
  }

  function transport()
    public
  {
    PurchaseLibrary.transport(purchaseInfo);
  }

  ///////////////////
  ///---Transit---///
  ///////////////////

  function sensorData(string sensorType, string id, uint value)
    public
  {
    PurchaseLibrary.sensorData(purchaseInfo, sensors, sensorType, id, value);
  }

  function deliver()
    public
  {
    PurchaseLibrary.deliver(purchaseInfo);
  }

  ///////////////////
  ///---Confirm---///
  ///////////////////

  function satisfied()
    public
  {
    PurchaseLibrary.satisfied(purchaseInfo);
  }

  function dissatisfied()
    public
  {
    PurchaseLibrary.dissatisfied(purchaseInfo);
  }

  ///////////////////////////
  ///---Other functions---///
  ///////////////////////////


  function getSensor(string name)
    public
    constant
    returns(uint threshold, bool warning, string provider, bool set)
  {
    return (sensors.sensors[name].threshold, sensors.sensors[name].warning, sensors.sensors[name].provider, sensors.sensors[name].set);
  }
}
