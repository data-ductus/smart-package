import { Injectable } from '@angular/core';
import { Web3Service } from '../util/web3.service';

@Injectable()
export class TransportService {

  stdTemp = 20;
  currTemp = 20;
  pressure = 1;
  humidity = 20;
  notStdTemp = false;
  account;
  contract;
  maxTemp;
  maxTempWarning = false;
  minTemp;
  minTempWarning = false;
  acc;
  accWarning = false;
  constructor(private web3Service: Web3Service) { this.watchAccount(); }

  async randomTemp(i) {
    if (this.notStdTemp && Math.floor(Math.random() * 2) === 0) {
      this.currTemp = this.stdTemp + Math.random() * 3 - 1;
      this.notStdTemp = false;
    }
    if (Math.floor(Math.random() * 15) === 0) {
      this.currTemp = Math.random() * 80 - 30;
      this.notStdTemp = true;
    }
    this.currTemp = this.currTemp + Math.random() - 0.5;
    console.log('warning', this.maxTempWarning);
    if (this.currTemp > this.maxTemp[0] && this.maxTemp['set'] && !this.maxTempWarning) {
      try {
        await this.contract.methods.sensorData('maxTemp', 'temp', Math.floor(this.currTemp)).send({from: this.account});
        this.maxTempWarning = true;
      } catch (e) {
        console.log(e);
      }
    }
    if (this.currTemp < this.minTemp[0] && this.minTemp['set'] && !this.minTempWarning) {
      try {
        await this.contract.methods.sensorData('minTemp', 'temp', Math.floor(this.currTemp)).send({from: this.account});
        this.minTempWarning = true;
      } catch (e) {
        console.log(e);
      }
    }
    return {'temp': this.currTemp, 'time': i};
  }

  async randomAcceleration(i) {
    let acc = 0;
    if (Math.floor(Math.random() * 15) === 0) {
      acc = Math.random() * 10 - 5;
    } else {
      acc = Math.random() * 0.01 - 0.005;
    }
    if (Math.abs(acc) > this.acc[0] && this.acc['set'] && !this.accWarning) {
      try {
        await this.contract.methods.sensorData('acceleration', 'acc', Math.ceil(Math.abs(acc))).send({from: this.account});
        this.accWarning = true;
      } catch (e) {
        console.log(e);
      }
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
  setContract(contract) {
    this.contract = contract;
  }

  async getSensors() {
    this.maxTemp = await this.contract.methods.getSensor('maxTemp').call();
    this.minTemp = await this.contract.methods.getSensor('minTemp').call();
    this.acc = await this.contract.methods.getSensor('acceleration').call();
  }

  watchAccount() {
    this.web3Service.accountsObservable.subscribe((accounts) => {
      this.account = accounts[0];
    });
  }
}
