import {Component, Input, OnInit} from '@angular/core';
import {Web3Service} from '../../util/web3.service';

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.css']
})
export class ConfirmComponent implements OnInit {
  @Input() contractAddress;
  @Input() account;
  @Input() token;
  @Input() buyer;
  @Input() state;
  @Input() agreementDeliver: any;
  contract: any;
  deployedToken: any;
  allowance = 0;
  now = Date.now();
  time;

  constructor() { }

  ngOnInit() {
    this.getToken();
    this.getArrivalTime();
    setInterval(() => this.updateTime(), 100);
  }

  async getToken() {
    this.deployedToken = await this.token.deployed();
    this.getAllowance();
  }

  updateTime() {
    this.now = Date.now();
  }

  async getArrivalTime() {
    this.time = await this.agreementDeliver.methods.arrivalTime(this.contractAddress).call();
  }

  async success() {
    await this.agreementDeliver.methods.success(this.contractAddress).send({from: this.account});
  }

  async dissatisfied() {
    await this.agreementDeliver.methods.dissatisfied(this.contractAddress).send({from: this.account});
  }
  async getAllowance() {
    this.allowance = await this.deployedToken.allowance(this.contractAddress, this.account, {from: this.account});
  }


  async withdraw() {
    try {
      console.log('withdraw ', this.deployedToken, this.contractAddress, this.allowance);
      const balance = await this.deployedToken.balanceOf(this.contractAddress);
      console.log('balance', balance);
      await this.deployedToken.transferFrom.sendTransaction(this.contractAddress, this.account, this.allowance,
        {from: this.account, gas: 64461});
    } catch (e) {
      console.log(e);
    }
  }
}
