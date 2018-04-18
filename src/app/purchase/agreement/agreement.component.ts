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
  @Input() clerk: any;
  price = 0;
  proposalAmount = 0;
  purchaseInfo = {
    seller: '',
    buyer: '',
    price: 0,
    state: 0,
  };
  proposals: any[];
  maxT = ['Not included'];
  minT = ['Not included'];
  acc = ['Not included'];
  hum = ['Not included'];
  press = ['Not included'];

  state = ['Created', 'Locked', 'Transit', 'Confirm', 'Dissatisfied', 'Return', 'Returned', 'Review', 'Clerk', 'Appeal', 'Inactive'];

  toggleProposals = false;
  clerkPayment;

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

  async getSensors() {
    this.maxT = await this.agreementData.methods.getSensor(this.contractAddress, 'maxTemp').call();
    this.minT = await this.agreementData.methods.getSensor(this.contractAddress, 'minTemp').call();
    this.acc = await this.agreementData.methods.getSensor(this.contractAddress, 'acceleration').call();
    this.hum = await this.agreementData.methods.getSensor(this.contractAddress, 'humidity').call();
    this.press = await this.agreementData.methods.getSensor(this.contractAddress, 'pressure').call();
    const deployedToken = await this.token.deployed();
  }

  async setPrice() {
    try {
      await this.agreementDeliver.methods.setPrice(this.contractAddress, this.price).send({from: this.account});
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

  async watchPurchase() {
    this.purchaseInfo.price = await this.agreementData.methods.price(this.contractAddress).call();
    this.purchaseInfo.seller = await this.agreementData.methods.seller(this.contractAddress).call();
    this.purchaseInfo.buyer = await this.agreementData.methods.buyer(this.contractAddress).call();
    this.purchaseInfo.state = await this.agreementData.methods.state(this.contractAddress).call();
  }

  async getProposals() {
    const a = [];
    let n = 0;
    let update = false;
    const p = await this.agreementData.methods.getPotentialBuyers(this.contractAddress).call();
    if (!this.proposals || this.proposals.length !== p.length) {
      update = true;
    }
    for (let i = 0; i < p.length; i++) {
      const maxT = await this.agreementData.methods.getProposedTerms(this.contractAddress, 'maxTemp', i).call();
      const minT = await this.agreementData.methods.getProposedTerms(this.contractAddress, 'minTemp', i).call();
      const acc = await this.agreementData.methods.getProposedTerms(this.contractAddress, 'acceleration', i).call();
      const hum = await this.agreementData.methods.getProposedTerms(this.contractAddress, 'humidity', i).call();
      const press = await this.agreementData.methods.getProposedTerms(this.contractAddress, 'pressure', i).call();
      a.push({address: p[i], maxT: maxT, minT: minT, acc: acc, hum: hum, press: press});
      if (p[i] !== this.contractAddress) {
        n++;
      }
      if (!update) {
        update = this.proposals[i].address !== p[i];
      }
    }
    if (update) {
      this.proposals = a;
      this.proposalAmount = n;
    }
  }

  async callClerk() {
    try {
      const deployedToken = await this.token.deployed();
      await deployedToken.approve.sendTransaction(this.contractAddress, this.clerkPayment, {from: this.account});
      await this.agreementReturn.methods.clerk(this.contractAddress, this.clerkPayment).send({from: this.account});
    } catch (e) {
      console.log(e);
    }
  }
}
