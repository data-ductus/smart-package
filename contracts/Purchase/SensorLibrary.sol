pragma solidity ^0.4.0;

library SensorLibrary {
  struct Sensor {
    uint value;
    bool warning;
    string provider;
  }
  struct Sensors {
    mapping(string => Sensor) sensors;
  }
  /*
  function setMaxTemp(Sensors storage self, uint value)
    public
    returns(bool)
  {
    self.sensors["maxTemp"].value = value;
    if (value == 0) {
      self.sensors["maxTemp"].active = false;
    } else {
      self.sensors["maxTemp"].active = true;
    }
    return true;
  }

  function setMinTemp(Sensors storage self, uint value)
    public
    returns(bool)
  {
    self.sensors["minTemp"].value = value;
    self.sensors["minTemp"].forbidLower = true;
    if (value == 0) {
      self.sensors["minTemp"].active = false;
    } else {
      self.sensors["minTemp"].active = true;
    }
    return true;
  }

  function setMaxAcceleration(Sensors storage self, uint value)
    public
    returns(bool)
  {
    self.sensors["acceleration"].value = value;
    if (value == 0) {
      self.sensors["acceleration"].active = false;
    } else {
      self.sensors["acceleration"].active = true;
    }
    return true;
  }
  */
  function setSensors(Sensors storage self, uint maxTemp, uint minTemp, uint acceleration)
    public
    returns(bool)
  {
    self.sensors["maxTemp"].value = maxTemp;
    self.sensors["minTemp"].value = minTemp;
    self.sensors["acceleration"].value = acceleration;
    return true;
  }

}
