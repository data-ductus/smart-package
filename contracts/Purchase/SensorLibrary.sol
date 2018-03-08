pragma solidity ^0.4.0;

library SensorLibrary {

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
  event Threshold(uint maxTemp, uint minTemp, uint Acceleration);
  /*
  function setMaxTemp(Sensors storage self, uint threshold)
    public
    returns(bool)
  {
    self.sensors["maxTemp"].threshold = threshold;
    if (threshold == 0) {
      self.sensors["maxTemp"].active = false;
    } else {
      self.sensors["maxTemp"].active = true;
    }
    return true;
  }

  function setMinTemp(Sensors storage self, uint threshold)
    public
    returns(bool)
  {
    self.sensors["minTemp"].threshold = threshold;
    self.sensors["minTemp"].forbidLower = true;
    if (threshold == 0) {
      self.sensors["minTemp"].active = false;
    } else {
      self.sensors["minTemp"].active = true;
    }
    return true;
  }

  function setMaxAcceleration(Sensors storage self, uint threshold)
    public
    returns(bool)
  {
    self.sensors["acceleration"].threshold = threshold;
    if (threshold == 0) {
      self.sensors["acceleration"].active = false;
    } else {
      self.sensors["acceleration"].active = true;
    }
    return true;
  }
  */
  function initSensor(Sensors storage self, string sensor, uint threshold) {

  }
  function setSensors(Sensors storage self, uint maxTemp, uint minTemp, uint acceleration)
    public
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
