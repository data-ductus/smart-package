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
    mapping(uint => Sensor) sensors;
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
      self.sensors[0].threshold = maxTemp;
      self.sensors[0].set = true;
    }
    if(keccak256(minTemp) != keccak256(notSet)) {
      self.sensors[1].threshold = minTemp;
      self.sensors[1].set = true;
    }
    if(keccak256(acceleration) != keccak256(notSet)) {
      self.sensors[2].threshold = acceleration;
      self.sensors[2].set = true;
    }
    if(keccak256(humidity) != keccak256(notSet)) {
      self.sensors[3].threshold = humidity;
      self.sensors[3].set = true;
    }
    if(keccak256(pressure) != keccak256(notSet)) {
      self.sensors[4].threshold = pressure;
      self.sensors[4].set = true;
    }
    if(gps) {
      self.gps = true;
    }
    //Threshold(self.sensors["maxTemp"].threshold, self.sensors["minTemp"].threshold, self.sensors["acceleration"].threshold);
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
    if(additionalTerms.sensors[0].set) {
      self.sensors[0] = additionalTerms.sensors[0];
    }
    if(additionalTerms.sensors[1].set) {
      self.sensors[1] = additionalTerms.sensors[1];
    }
    if(additionalTerms.sensors[2].set) {
      self.sensors[2] = additionalTerms.sensors[2];
    }
    if(additionalTerms.sensors[3].set) {
      self.sensors[3] = additionalTerms.sensors[3];
    }
    if(additionalTerms.sensors[4].set) {
      self.sensors[4] = additionalTerms.sensors[4];
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
  function sensorData(Sensors storage self, uint sensorType, address id, int value)
    public
    condition(self.sensors[sensorType].provider == id &&
    (value < self.sensors[sensorType].threshold) == (keccak256(sensorType) == keccak256(1)))
  {
    self.sensors[sensorType].warning = true;
  }

  /** @dev Get the information about a sensor
    * @param self The instance of the struct where the information is stored
    * @param sensorType The sensor to get the information about
    */
  function getSensor(Sensors storage self, uint sensorType)
    public
    constant
    returns(int threshold, bool warning, address provider, bool set)
  {
    if (keccak256(sensorType) == keccak256(100)) {
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
