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
    address gpsProvider;
    bool gps;
  }
  event Threshold(int maxTemp, int minTemp, int Acceleration);
  event Data(int value, address purchase);
  event Location(int lat, int long, address purchase);

  modifier condition(bool _condition) {
    require(_condition);
    _;
  }

  function setSensors(Sensors storage self, int maxTemp, int minTemp, int acceleration, int humidity, int pressure, bool gps)
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
    if(gps) {
      self.gps = true;
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

  function combineTerms(Sensors storage self, Sensors storage additionalTerms)
    public
    returns(bool)
  {
    if(additionalTerms.sensors["maxTemp"].set) {
      self.sensors["maxTemp"] = additionalTerms.sensors["maxTemp"];
    }
    if(additionalTerms.sensors["minTemp"].set) {
      self.sensors["minTemp"] = additionalTerms.sensors["minTemp"];
    }
    if(additionalTerms.sensors["acceleration"].set) {
      self.sensors["acceleration"] = additionalTerms.sensors["acceleration"];
    }
    if(additionalTerms.sensors["humidity"].set) {
      self.sensors["humidity"] = additionalTerms.sensors["humidity"];
    }
    if(additionalTerms.sensors["pressure"].set) {
      self.sensors["pressure"] = additionalTerms.sensors["pressure"];
    }
    if(additionalTerms.gps) {
      self.gps = true;
    }
    return true;
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
