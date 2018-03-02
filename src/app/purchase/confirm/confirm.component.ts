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
  contract: any;
  purchase: any;
  seller: string;
  constructor(private web3Service: Web3Service, private transportService: TransportService) { }

  ngOnInit() {
    this.web3Service.artifactsToContract(purchase_artifact)
      .then((purchaseAbstraction) => {
        this.contract = purchaseAbstraction;
        this.getPurchase();
      });
  }

  async getPurchase() {
    this.purchase = await this.web3Service.getContract(this.contract.abi, this.contractAddress);
    this.purchase.options.from = this.account;
    this.seller = await this.purchase.methods.seller().call();
  }

  async satisfied() {
    this.transportService.getSensors();
    await this.purchase.methods.satisfied().send({from: this.account});
  }

  async dissatisfied() {
    this.transportService.getSensors();
    await this.purchase.methods.dissatisfied().send({from: this.account});
  }

  async withdraw() {
    try {
      this.transportService.setContract(this.purchase);
      this.transportService.getSensors();
      const deployedToken = await this.token.deployed();
      const allowance = await deployedToken.allowance(this.contractAddress, this.account, {from: this.account});
      await deployedToken.transferFrom.sendTransaction(this.contractAddress, this.account, allowance, {from: this.account});
    } catch (e) {
      console.log(e);
    }
  }
}
