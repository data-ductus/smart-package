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
    setInterval(() => this.getArrivalTime(), 100);
  }

  async getToken() {
    this.deployedToken = await this.token.deployed();
    this.getAllowance();
  }

  /**
   * Update the current time. Used by functions that are available during a limited time.
   */
  updateTime() {
    this.now = Date.now();
  }

  /**
   * Get the arrival time of the package
   * @returns {Promise<void>}
   */
  async getArrivalTime() {
    this.time = await this.agreementDeliver.methods.arrivalTime(this.contractAddress).call();
  }

  /**
   * Finalize a successful agreement. Available if the buyer is not dissatisfied.
   * @returns {Promise<void>}
   */
  async success() {
    await this.agreementDeliver.methods.success(this.contractAddress).send({from: this.account});
  }

  /**
   * Return the package to the seller. Available for a limited amount of time.
   * @returns {Promise<void>}
   */
  async dissatisfied() {
    await this.agreementDeliver.methods.dissatisfied(this.contractAddress).send({from: this.account});
  }

  /**
   * Get the amount of tokens allowed by the contract to the current user.
   * @returns {Promise<void>}
   */
  async getAllowance() {
    this.allowance = await this.deployedToken.allowance(this.contractAddress, this.account, {from: this.account});
  }


  /**
   * Withdraw all tokens allowed by the contract to the current user.
   * @returns {Promise<void>}
   */
  async withdraw() {
    try {
      console.log('withdraw ', this.deployedToken, this.contractAddress, this.allowance);
      await this.deployedToken.transferFrom.sendTransaction(this.contractAddress, this.account, this.allowance,
        {from: this.account, gas: 64461});
    } catch (e) {
      console.log(e);
    }
  }
}
