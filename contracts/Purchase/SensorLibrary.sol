pragma solidity ^0.4.0;

library SensorLibrary {

  int constant notSet = int(-999);

  struct Sensor {
    int threshold;
    bool warning;
    address provider;
    bool set;
  }
  struct Sensors {
    mapping(string => Sensor) sensors;
  }
  event Threshold(int maxTemp, int minTemp, int Acceleration);
  event Request(address provider);
  event Data(int value, address purchase);
  event Location(int lat, int long, address purchase);

  modifier condition(bool _condition) {
    require(_condition);
    _;
  }

  function setSensors(Sensors storage self, int maxTemp, int minTemp, int acceleration, int humidity, int pressure)
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
    if(keccak256(humidity) != keccak256(notSet)) {
      self.sensors["humidity"].threshold = humidity;
      self.sensors["humidity"].set = true;
    }
    if(keccak256(pressure) != keccak256(notSet)) {
      self.sensors["pressure"].threshold = pressure;
      self.sensors["pressure"].set = true;
    }
    Threshold(self.sensors["maxTemp"].threshold, self.sensors["minTemp"].threshold, self.sensors["acceleration"].threshold);
    return true;
  }

  function warning(Sensors storage self)
    public
    constant
    returns(bool)
  {
    if(self.sensors["maxTemp"].warning) {
      return true;
    }
    if(self.sensors["minTemp"].warning) {
      return true;
    }
    if(self.sensors["acceleration"].warning) {
      return true;
    }
    if(self.sensors["humidity"].warning) {
      return true;
    }
    if(self.sensors["pressure"].warning) {
      return true;
    }
    return false;
  }

  function sensorData(Sensors storage self, string sensorType, address id, int value)
    public
    condition(self.sensors[sensorType].provider == id &&
    (value < self.sensors[sensorType].threshold) == (keccak256(sensorType) == keccak256('minTemp')))
  {
    self.sensors[sensorType].warning = true;
  }

  function getSensor(Sensors storage self, string name)
    public
    constant
    returns(int threshold, bool warning, address provider, bool set)
  {
    return (self.sensors[name].threshold, self.sensors[name].warning, self.sensors[name].provider, self.sensors[name].set);
  }

  function requestData(Sensors storage self, string sensorType)
    public
  {
    Request(self.sensors[sensorType].provider);
  }

  function currentValue(int value, address purchase)
    public
  {
    Data(value, purchase);
  }

  function currentLocation(int lat, int lng, address purchase)
    public
  {
    Location(lat, lng, purchase);
  }
}
