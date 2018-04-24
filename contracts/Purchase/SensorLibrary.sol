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

  /** @dev Store sensor specs
    * @param self The instance of the struct where the information should be stored
    * @param maxTemp Maximum temperature (-999 = not set)
    * @param minTemp Minimum temperature (-999 = not set)
    * @param acceleration Maximum acceleration (-999 = not set)
    * @param humidity Maximum humidity (-999 = not set)
    * @param pressure Maximum pressure (-999 = not set)
    * @param gps True if gps included
    */
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

  /** @dev Combine the seller's terms with the accepted proposal
    * @param self The seller's terms
    * @param additionalTerms The buyer's proposal
    */
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

  /** @dev Set warning to true if threshold violated
    * @param self The instance of the struct where the information should be stored
    * @param sensorType The sensor that sent the data
    * @param id The address of the sensor that sent the data
    * @param value The value sent from the sensor
    */
  function sensorData(Sensors storage self, string sensorType, address id, int value)
    public
    condition(self.sensors[sensorType].provider == id &&
    (value < self.sensors[sensorType].threshold) == (keccak256(sensorType) == keccak256('minTemp')))
  {
    self.sensors[sensorType].warning = true;
  }

  /** @dev Get the information about a sensor
    * @param self The instance of the struct where the information is stored
    * @param sensorType The sensor to get the information about
    */
  function getSensor(Sensors storage self, string sensorType)
    public
    constant
    returns(int threshold, bool warning, address provider, bool set)
  {
    if (keccak256(sensorType) == keccak256('gps')) {
      return (0, false, self.gpsProvider, self.gps);
    }
    return (self.sensors[sensorType].threshold, self.sensors[sensorType].warning, self.sensors[sensorType].provider, self.sensors[sensorType].set);
  }

  /** @dev Send an event with the current value of the sensor
    * @param value The current value
    * @param purchase The address of the agreement
    */
  function currentValue(int value, address purchase)
    public
  {
    Data(value, purchase);
  }

  /** @dev Send an event with the current location of the package
    * @param lat The latitude of the package
    * @param lng The longitude of the package
    * @param purchase The address of the agreement
    */
  function currentLocation(int lat, int lng, address purchase)
    public
  {
    Location(lat, lng, purchase);
  }
}
