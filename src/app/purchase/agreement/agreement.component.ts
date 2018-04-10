import {Component, Input, OnInit} from '@angular/core';


@Component({
  selector: 'app-agreement',
  templateUrl: './agreement.component.html',
  styleUrls: ['./agreement.component.css']
})
export class AgreementComponent implements OnInit {
  @Input() contractAddress: string;
  @Input() account: string;
  @Input() token: any;
  @Input() agreementData: any;
  @Input() agreementDeliver: any;
  @Input() agreementReturn: any;
  @Input() dapp: any;
  price = 0;
  purchaseInfo = {
    seller: '',
    buyer: '',
    price: 0,
    state: 0,
  };
  proposals: any[];
  maxT = ['Not set'];
  minT = ['Not set'];
  acc = ['Not set'];
  hum = ['Not set'];
  press = ['Not set'];
  model = {
    deliveryAddress: '',
    maxTThreshold: '',
    minTThreshold: '',
    accThreshold: '',
    humThreshold: '',
    pressThreshold: '',
  };

  constructor() { }

  ngOnInit() {
    this.getPurchase();
  }

  async getPurchase() {
    await this.watchPurchase();
    this.price = this.purchaseInfo.price;
    setInterval(() => this.watchPurchase(), 100);
    setInterval(() => this.getSensors(), 100);
    setInterval(() => this.getProposals(), 100);
  }

  async getPrice() {

  }

  async getSensors() {
    this.maxT = await this.agreementData.methods.getSensor(this.contractAddress, 'maxTemp').call();
    this.minT = await this.agreementData.methods.getSensor(this.contractAddress, 'minTemp').call();
    this.acc = await this.agreementData.methods.getSensor(this.contractAddress, 'acceleration').call();
    this.hum = await this.agreementData.methods.getSensor(this.contractAddress, 'humidity').call();
    this.press = await this.agreementData.methods.getSensor(this.contractAddress, 'pressure').call();
  }

  async setPrice() {
    try {
      await this.agreementDeliver.methods.setPrice(this.contractAddress, this.price).send({from: this.account});
      await this.getPrice();
    } catch (e) {
      console.log(e);
    }
  }

  async abort() {
    try {
      const a = await this.agreementDeliver.methods.abort(this.contractAddress).send({from: this.account});
      console.log(a);
    } catch (e) {
      console.log(e);
    }
  }

  async propose() {
    try {
      const deployedToken = await this.token.deployed();
      let maxTThreshold = +this.model.maxTThreshold;
      let minTThreshold = +this.model.minTThreshold;
      let accThreshold = +this.model.accThreshold;
      let humThreshold = +this.model.humThreshold;
      let pressThreshold = +this.model.pressThreshold;
      if (this.model.maxTThreshold === '') {
        maxTThreshold = -999;
      }
      if (this.model.minTThreshold === '') {
        minTThreshold = -999;
      }
      if (this.model.accThreshold === '') {
        accThreshold = -999;
      }
      if (this.model.humThreshold === '') {
        humThreshold = -999;
      }
      if (this.model.pressThreshold === '') {
        pressThreshold = -999;
      }
      await deployedToken.approve.sendTransaction(this.contractAddress, this.price, {from: this.account});
      await this.agreementDeliver.methods.propose(this.contractAddress, this.model.deliveryAddress, maxTThreshold, minTThreshold,
        accThreshold, humThreshold, pressThreshold).send({from: this.account});
    } catch (e) {
      console.log(e);
    }
  }
  async watchPurchase() {
    this.price = await this.agreementData.methods.price(this.contractAddress).call();
  }
  async getProposals() {
    const a = [];
    const p = await this.agreementData.methods.getPotentialBuyers(this.contractAddress).call();
    for (let i = 0; i < p.length; i++) {
      const maxT = await this.agreementData.methods.getProposedTerms(this.contractAddress, 'maxTemp', i).call();
      const minT = await this.agreementData.methods.getProposedTerms(this.contractAddress, 'minTemp', i).call();
      const acc = await this.agreementData.methods.getProposedTerms(this.contractAddress, 'acceleration', i).call();
      const hum = await this.agreementData.methods.getProposedTerms(this.contractAddress, 'humidity', i).call();
      const press = await this.agreementData.methods.getProposedTerms(this.contractAddress, 'pressure', i).call();
      a.push({address: p[i], maxT: maxT, minT: minT, acc: acc, hum: hum, press: press});
    }
    this.proposals = a;
  }
}
