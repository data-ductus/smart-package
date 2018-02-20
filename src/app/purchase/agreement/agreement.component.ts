import {Component, Input, OnInit} from '@angular/core';
import {Web3Service} from "../../util/web3.service";
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
  contract: any;
  purchase: any;
  model = {
    price: 0,
    seller: '',
    maxT: [0],
    minT: [0],
    acc: [0],
  };

  constructor(private web3Service: Web3Service) { }

  ngOnInit() {
    this.web3Service.artifactsToContract(purchase_artifact)
      .then((purchaseAbstraction) => {
        this.contract = purchaseAbstraction;
        this.getPurchase()
      });
    console.log(this.account);
  }

  async getPurchase() {
    this.purchase = await this.web3Service.getContract(this.contract.abi, this.contractAddress);
    this.model.seller = await this.purchase.methods.seller().call();
    this.getSensors();
    console.log('purchase', this.purchase);
    await this.getPrice();
  }

  async getPrice() {
    this.model.price = await this.purchase.methods.price().call();
    console.log(this.model.price);
  }

  async getSensors() {
    this.model.maxT = await this.purchase.methods.getSensor('maxTemp').call();
    this.model.minT = await this.purchase.methods.getSensor('minTemp').call();
    this.model.acc = await this.purchase.methods.getSensor('acceleration').call();
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
      await deployedToken.approve.sendTransaction(this.contractAddress, this.model.price, {from: this.account});
      await this.purchase.methods.propose(this.model.maxT[0], this.model.minT[0], this.model.acc[0]).send(
        {from: this.account});
    } catch (e) {
      console.log(e);
    }
  }
}
