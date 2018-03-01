import { Injectable } from '@angular/core';

@Injectable()
export class TransportService {

  stdTemp = 20;
  currTemp = 20;
  pressure = 1;
  humidity = 20;
  notStdTemp = false;
  constructor() { }

  randomTemp(i) {
    if (this.notStdTemp && Math.floor(Math.random() * 2) === 0) {
      this.currTemp = this.stdTemp + Math.random() * 3 - 1;
      this.notStdTemp = false;
    }
    if (Math.floor(Math.random() * 100) === 99) {
      this.currTemp = Math.random() * 80 - 40;
      this.notStdTemp = true;
    }
    this.currTemp = this.currTemp + Math.random() - 0.5;
    return{'temp': this.currTemp, 'time': i};
  }

  randomAcceleration(i) {
    let acc = 0;
    if (Math.floor(Math.random() * 20) === 0) {
      acc = Math.random() * 10 - 5;
    } else {
      acc = Math.random() * 0.01 - 0.005;
    }
    return {'acc': acc, 'time': i};
  }

  randomPressure(i) {
    if (Math.floor(Math.random() * 20) === 0) {
      this.pressure = Math.random() * 100000;
    } else {
      this.pressure = Math.random() * 5;
    }
    return {'press': this.pressure, 'time': i};
  }

  randomHumidity(i) {
    if (Math.floor(Math.random() * 20) === 0) {
      this.humidity = Math.random() * 100;
    } else {
      this.humidity += Math.random() - 0.5;
      if (this.humidity < 0) {
        this.humidity = 0;
      }
    }
    return {'humidity': this.humidity, 'time': i};
  }
}
