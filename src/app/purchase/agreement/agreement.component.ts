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

  sensor_id = {
    maxTemp: 0,
    minTemp: 1,
    acceleration: 2,
    humidity: 3,
    pressure: 4,
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

  /**
   * Start the polling of the information from the contracts needed for this component
   * @returns {Promise<void>}
   */
  async getPurchase() {
    await this.watchPurchase();
    this.price = this.purchaseInfo.price;
    setInterval(() => this.watchPurchase(), 100);
    setInterval(() => this.getSensors(), 100);
    setInterval(() => this.getProposals(), 100);
  }

  /**
   * Get the data about the sensors
   * @returns {Promise<void>}
   */
  async getSensors() {
    this.maxT = await this.agreementData.methods.getSensor(this.contractAddress, this.sensor_id.maxTemp).call();
    this.minT = await this.agreementData.methods.getSensor(this.contractAddress, this.sensor_id.minTemp).call();
    this.acc = await this.agreementData.methods.getSensor(this.contractAddress, this.sensor_id.acceleration).call();
    this.hum = await this.agreementData.methods.getSensor(this.contractAddress, this.sensor_id.humidity).call();
    this.press = await this.agreementData.methods.getSensor(this.contractAddress, this.sensor_id.pressure).call();
  }

  /**
   * Update the price
   * @returns {Promise<void>}
   */
  async setPrice() {
    try {
      await this.agreementData.methods.setPrice(this.contractAddress, this.price).send({from: this.account});
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * Abort the agreement
   * @returns {Promise<void>}
   */
  async abort() {
    try {
      const a = await this.agreementDeliver.methods.abort(this.contractAddress).send({from: this.account});
      console.log(a);
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * Get price, seller, buyer and state of the agreement
   * @returns {Promise<void>}
   */
  async watchPurchase() {
    this.purchaseInfo.price = await this.agreementData.methods.price(this.contractAddress).call();
    this.purchaseInfo.seller = await this.agreementData.methods.seller(this.contractAddress).call();
    this.purchaseInfo.buyer = await this.agreementData.methods.buyer(this.contractAddress).call();
    this.purchaseInfo.state = await this.agreementData.methods.state(this.contractAddress).call();
  }

  /**
   * Get the proposals for the agreement
   * @returns {Promise<void>}
   */
  async getProposals() {
    const a = [];
    let n = 0;
    let update = false;
    const p = await this.agreementData.methods.getPotentialBuyers(this.contractAddress).call();
    if (!this.proposals || this.proposals.length !== p.length) {
      update = true;
    }
    for (let i = 0; i < p.length; i++) {
      const maxT = await this.agreementData.methods.getProposedTerms(this.contractAddress, 0, i).call();
      const minT = await this.agreementData.methods.getProposedTerms(this.contractAddress, 1, i).call();
      const acc = await this.agreementData.methods.getProposedTerms(this.contractAddress, 2, i).call();
      const hum = await this.agreementData.methods.getProposedTerms(this.contractAddress, 3, i).call();
      const press = await this.agreementData.methods.getProposedTerms(this.contractAddress, 4, i).call();
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

  /**
   * Lock the contract by calling a clerk
   * @returns {Promise<void>}
   */
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
