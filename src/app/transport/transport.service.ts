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
  hum;
  humWarning = false;
  press;
  pressWarning = false;
  constructor(private web3Service: Web3Service) { this.watchAccount(); }

  async randomTemp(contractAddress, i) {
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
        await this.contract.methods.sensorData(contractAddress, 'maxTemp', Math.floor(this.currTemp)).send({from: this.account});
        this.maxTempWarning = true;
      } catch (e) {
        console.log(e);
      }
    }
    if (this.currTemp < this.minTemp[0] && this.minTemp['set'] && !this.minTempWarning) {
      try {
        await this.contract.methods.sensorData(contractAddress, 'minTemp', Math.floor(this.currTemp)).send({from: this.account});
        this.minTempWarning = true;
      } catch (e) {
        console.log(e);
      }
    }
    return {'temp': this.currTemp, 'time': i};
  }

  async randomAcceleration(contractAddress, i) {
    let acc = 0;
    if (Math.floor(Math.random() * 15) === 0) {
      acc = Math.random() * 10 - 5;
    } else {
      acc = Math.random() * 0.01 - 0.005;
    }
    if (Math.abs(acc) > this.acc[0] && this.acc['set'] && !this.accWarning) {
      try {
        await this.contract.methods.sensorData(contractAddress, 'acceleration', Math.ceil(Math.abs(acc))).send({from: this.account});
        this.accWarning = true;
      } catch (e) {
        console.log(e);
      }
    }
    return {'acc': acc, 'time': i};
  }

  async randomPressure(contractAddress, i) {
    if (Math.floor(Math.random() * 20) === 0) {
      this.pressure = Math.random() * 100000;
    } else {
      this.pressure = Math.random() * 5;
    }
    if (Math.abs(this.pressure) > this.press[0] && this.press['set'] && !this.pressWarning) {
      try {
        await this.contract.methods.sensorData(contractAddress, 'pressure', Math.ceil(Math.abs(this.pressure))).send({from: this.account});
        this.pressWarning = true;
      } catch (e) {
        console.log(e);
      }
    }
    return {'press': this.pressure, 'time': i};
  }

  async randomHumidity(contractAddress, i) {
    if (Math.floor(Math.random() * 20) === 0) {
      this.humidity = Math.random() * 100;
    } else {
      this.humidity += Math.random() - 0.5;
      if (this.humidity < 0) {
        this.humidity = 0;
      }
    }
    if (Math.abs(this.humidity) > this.hum[0] && this.hum['set'] && !this.humWarning) {
      try {
        await this.contract.methods.sensorData(contractAddress, 'humidity', Math.ceil(Math.abs(this.humidity))).send({from: this.account});
        this.humWarning = true;
      } catch (e) {
        console.log(e);
      }
    }
    return {'humidity': this.humidity, 'time': i};
  }
  setContract(contract) {
    this.contract = contract;
  }

  async getSensors(contractAddress) {
    try {
      this.maxTemp = await this.contract.methods.getActiveSensor(contractAddress, 'maxTemp').call();
      this.minTemp = await this.contract.methods.getActiveSensor(contractAddress, 'minTemp').call();
      this.acc = await this.contract.methods.getActiveSensor(contractAddress, 'acceleration').call();
      this.hum = await this.contract.methods.getActiveSensor(contractAddress, 'humidity').call();
      this.press = await this.contract.methods.getActiveSensor(contractAddress, 'pressure').call();
    } catch (e) {
      console.log(e);
    }
  }

  watchAccount() {
    this.web3Service.accountsObservable.subscribe((accounts) => {
      this.account = accounts[0];
    });
  }
  async setProviders(contractAddress) {
    if (this.maxTemp['set']) {
      await this.contract.methods.setProvider(contractAddress, 'maxTemp').send({from: this.account});
    }
    if (this.minTemp['set']) {
      await this.contract.methods.setProvider(contractAddress, 'minTemp').send({from: this.account});
    }
    if (this.acc['set']) {
      await this.contract.methods.setProvider(contractAddress, 'acceleration').send({from: this.account});
    }
    if (this.hum['set']) {
      await this.contract.methods.setProvider(contractAddress, 'humidity').send({from: this.account});
    }
    if (this.press['set']) {
      await this.contract.methods.setProvider(contractAddress, 'pressure').send({from: this.account});
    }
  }
}
