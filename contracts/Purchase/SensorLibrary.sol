pragma solidity ^0.4.0;

library SensorLibrary {

  int constant notSet = int(-999);

  struct Sensor {
    int threshold;
    bool warning;
    string provider;
    bool set;
  }
  struct Sensors {
    mapping(string => Sensor) sensors;
  }
  event Threshold(int maxTemp, int minTemp, int Acceleration);

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
}
