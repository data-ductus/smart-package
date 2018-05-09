import {Component, Input, OnInit} from '@angular/core';
import {AgreementService} from '../../services/agreement.service';
import {Web3Service} from '../../util/web3.service';

@Component({
  selector: 'app-set-terms',
  templateUrl: './set-terms.component.html',
  styleUrls: ['./set-terms.component.css']
})
export class SetTermsComponent implements OnInit {

  @Input() create: boolean;
  @Input() dapp;
  @Input() token;
  @Input() account;
  @Input() contractAddress;
  @Input() agreementData;
  @Input() price: number;

  maxTemp = {
    threshold: '',
    set: false
  };
  minTemp = {
    threshold: '',
    set: false
  };
  acceleration = {
    threshold: '',
    set: false
  };
  humidity = {
    threshold: '',
    set: false
  };
  pressure = {
    threshold: '',
    set: false
  };
  deliveryAddress: string;

  constructor(private agreementService: AgreementService, private web3Service: Web3Service) { }

  ngOnInit() {
  }

  /**
   * Create a new agreement.
   * @returns {Promise<void>}
   */
  async createMinimalPurchase() {
    try {
      const maxT = this.agreementService.sensorThreshold(this.maxTemp.threshold, this.maxTemp.set);
      const minT = this.agreementService.sensorThreshold(this.minTemp.threshold, this.minTemp.set);
      const acc = this.agreementService.sensorThreshold(this.acceleration.threshold, this.acceleration.set);
      const hum = this.agreementService.sensorThreshold(this.humidity.threshold, this.humidity.set);
      const press = this.agreementService.sensorThreshold(this.pressure.threshold, this.pressure.set);
      await this.dapp.methods.createMinimalPurchase(this.price, maxT, minT, acc, hum, press, false).send({from: this.account});
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * Add a proposal to an agreement.
   * @returns {Promise<void>}
   */
  async propose() {
    try {
      const deployedToken = await this.token.deployed();
      const maxT = this.agreementService.sensorThreshold(this.maxTemp.threshold, this.maxTemp.set);
      const minT = this.agreementService.sensorThreshold(this.minTemp.threshold, this.minTemp.set);
      const acc = this.agreementService.sensorThreshold(this.acceleration.threshold, this.acceleration.set);
      const hum = this.agreementService.sensorThreshold(this.humidity.threshold, this.humidity.set);
      const press = this.agreementService.sensorThreshold(this.pressure.threshold, this.pressure.set);
      const batch = this.web3Service.getBatch();
      batch.add(deployedToken.approve.sendTransaction(this.contractAddress, this.price, {from: this.account}));
      batch.add(await this.agreementData.methods.propose(this.contractAddress, this.deliveryAddress, maxT, minT, acc, hum, press, false)
        .send({from: this.account}));
      await batch.execute();
    } catch (e) {
      console.log(e);
    }
  }

}
