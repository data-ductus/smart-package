import {Component, Input, OnInit} from '@angular/core';
import {Web3Service} from '../../util/web3.service';
import { TransportService } from '../../transport/transport.service';
import purchase_artifact from '../../../../build/contracts/purchase.json';

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.css']
})
export class ConfirmComponent implements OnInit {
  @Input() contractAddress;
  @Input() account;
  @Input() token;
  @Input() buyer: string;
  @Input() state: number;
  contract: any;
  purchase: any;
  deployedToken: any;
  allowance = 0;
  constructor(private web3Service: Web3Service, private transportService: TransportService) { }

  ngOnInit() {
    this.web3Service.artifactsToContract(purchase_artifact)
      .then((purchaseAbstraction) => {
        this.contract = purchaseAbstraction;
        this.getPurchase();
        this.getToken();
      });
  }

  async getToken() {
    this.deployedToken = await this.token.deployed();
    this.getAllowance();
  }

  async getPurchase() {
    this.purchase = await this.web3Service.getContract(this.contract.abi, this.contractAddress);
    this.purchase.options.from = this.account;
  }

  async satisfied() {
    this.transportService.getSensors();
    await this.purchase.methods.satisfied().send({from: this.account});
  }

  async dissatisfied() {
    this.transportService.getSensors();
    await this.purchase.methods.dissatisfied().send({from: this.account});
  }
  async getAllowance() {
    this.allowance = await this.deployedToken.allowance(this.contractAddress, this.account, {from: this.account});
  }

  async withdraw() {
    try {
      await this.deployedToken.transferFrom.sendTransaction(this.contractAddress, this.account, this.allowance, {from: this.account, gas: 64461});
    } catch (e) {
      console.log(e);
    }
  }
}
