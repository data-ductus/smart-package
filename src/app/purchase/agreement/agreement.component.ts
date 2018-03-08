import {Component, Input, OnInit} from '@angular/core';
import {Web3Service} from '../../util/web3.service';
import purchase_artifact from '../../../../build/contracts/purchase.json';
import minimal_artifact from '../../../../build/contracts/minimalPurchase.json';
import {LowerCasePipe} from '@angular/common';


@Component({
  selector: 'app-agreement',
  templateUrl: './agreement.component.html',
  styleUrls: ['./agreement.component.css']
})
export class AgreementComponent implements OnInit {
  @Input() contractAddress: string;
  @Input() account: string;
  @Input() token: any;
  @Input() purchase: any;
  price = 0;
  /*
  contract: any;
  purchase: any;
  */
  purchaseInfo = {
    seller: '',
    buyer: '',
    price: 0,
    state: 0,
  };
  maxT = ['Not set'];
  minT = ['Not set'];
  acc = ['Not set'];
  model = {
    maxTThreshold: '',
    minTThreshold: '',
    accThreshold: '',
  };

  constructor(private web3Service: Web3Service) { }

  ngOnInit() {
    /*this.web3Service.artifactsToContract(minimal_artifact)
      .then((purchaseAbstraction) => {
        this.contract = purchaseAbstraction;
        this.getPurchase();
      });
    console.log(this.account);
    */
    this.getPurchase();
  }

  async getPurchase() {
    // this.purchase = await this.web3Service.getContract(this.contract.abi, this.contractAddress);
    await this.watchPurchase();
    this.price = this.purchaseInfo.price;
    setInterval(() => this.watchPurchase(), 100);
    setInterval(() => this.getSensors(), 100);
  }

  async getPrice() {
    const info = await this.purchase.getPurchase.call(this.contractAddress);
    this.price = info['price'];
  }

  async getSensors() {
    this.maxT = await this.purchase.methods.getSensor(this.contractAddress, 'maxTemp').call();
    this.minT = await this.purchase.methods.getSensor(this.contractAddress, 'minTemp').call();
    this.acc = await this.purchase.methods.getSensor(this.contractAddress, 'acceleration').call();
  }

  async setPrice() {
    try {
      await this.purchase.methods.setPrice().send(this.contractAddress, this.price, {from: this.account});
      await this.getPrice();
    } catch (e) {
      console.log(e);
    }
  }

  async abort() {
    try {
      const a = await this.purchase.methods.abort(this.contractAddress).send({from: this.account});
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
      await deployedToken.approve.sendTransaction(this.contractAddress, this.price, {from: this.account});
      await this.purchase.methods.propose(this.contractAddress, maxTThreshold, minTThreshold, accThreshold).send({from: this.account});
    } catch (e) {
      console.log(e);
    }
  }
  async watchPurchase() {
    this.purchaseInfo = await this.purchase.methods.getPurchase(this.contractAddress).call();
  }
}
