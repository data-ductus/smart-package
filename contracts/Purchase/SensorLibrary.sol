pragma solidity ^0.4.0;

library SensorLibrary {
  struct Sensor {
    uint value;
    bool forbidGreater;
    bool warning;
    string provider;
  }
  struct Sensors {
    mapping(string => Sensor) sensors;
    string[] availableSensors;
  }

  function setMaxTemp(Sensors storage self, uint value)
    public
    returns(bool)
  {
    if (self.sensors["maxTemp"].value == 0) {
      self.availableSensors.push("maxTemp");
      self.sensors["maxTemp"] = Sensor(value, true, false, "");
      return true;
    } else {
      self.sensors["maxTemp"].value = value;
      return true;
    }
  }

  function setMinTemp(Sensors storage self, uint value)
    public
    returns(bool)
  {
    if (self.sensors["minTemp"].value == 0) {
      self.availableSensors.push("minTemp");
      self.sensors["minTemp"] = Sensor(value, false, false, "");
      return true;
    } else {
      self.sensors["minTemp"].value = value;
      return true;
    }
  }

  function setMaxAcceleration(Sensors storage self, uint value)
    public
    returns(bool)
  {
    if (self.sensors["acceleration"].value == 0) {
      self.availableSensors.push("acceleration");
      self.sensors["acceleration"] = Sensor(value, true, false, "");
      return true;
    } else {
      self.sensors["acceleration"].value = value;
      return true;
    }
  }

}
