import {Component, Input, OnInit} from '@angular/core';
import {Web3Service} from '../../util/web3.service';
import purchase_artifact from '../../../../build/contracts/purchase.json';


@Component({
  selector: 'app-agreement',
  templateUrl: './agreement.component.html',
  styleUrls: ['./agreement.component.css']
})
export class AgreementComponent implements OnInit {
  @Input() contractAddress: string;
  @Input() account: string;
  @Input() token: any;
  state = 0;
  contract: any;
  purchase: any;
  maxT = ['Not set'];
  minT = ['Not set'];
  acc = ['Not set'];
  model = {
    price: 0,
    seller: '',
    buyer: '',
    maxTThreshold: '',
    minTThreshold: '',
    accThreshold: '',
  };

  constructor(private web3Service: Web3Service) { }

  ngOnInit() {
    this.web3Service.artifactsToContract(purchase_artifact)
      .then((purchaseAbstraction) => {
        this.contract = purchaseAbstraction;
        this.getPurchase();
      });
    console.log(this.account);
  }

  async getPurchase() {
    this.purchase = await this.web3Service.getContract(this.contract.abi, this.contractAddress);
    setInterval(() => this.watchState(), 100);
    this.model.seller = await this.purchase.methods.seller().call();
    setInterval(() => this.getBuyer(), 1000);
    setInterval(() => this.getSensors(), 100);
    await this.getPrice();
  }
  async getBuyer() {
    this.model.buyer = await this.purchase.methods.buyer().call();
  }

  async getPrice() {
    this.model.price = await this.purchase.methods.price().call();
  }

  async getSensors() {
    this.maxT = await this.purchase.methods.getSensor('maxTemp').call();
    this.minT = await this.purchase.methods.getSensor('minTemp').call();
    this.acc = await this.purchase.methods.getSensor('acceleration').call();
  }

  async setPrice() {
    try {
      await this.purchase.methods.setPrice().send(this.model.price, {from: this.account});
      await this.getPrice();
    } catch (e) {
      console.log(e);
    }
  }

  async abort() {
    try {
      const a = await this.purchase.methods.abort().send({from: this.account});
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
      if (this.model.maxTThreshold === '') {
        maxTThreshold = -999;
      }
      if (this.model.minTThreshold === '') {
        minTThreshold = -999;
      }
      if (this.model.accThreshold === '') {
        accThreshold = -999;
      }
      await deployedToken.approve.sendTransaction(this.contractAddress, this.model.price, {from: this.account});
      await this.purchase.methods.propose(maxTThreshold, minTThreshold, accThreshold).send(
        {from: this.account});
    } catch (e) {
      console.log(e);
    }
  }
  async watchState() {
    this.state = await this.purchase.methods.state().call();
  }
}
