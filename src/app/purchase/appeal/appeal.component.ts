import {Component, Input, OnInit} from '@angular/core';
import {Web3Service} from '../../util/web3.service';

@Component({
  selector: 'app-appeal',
  templateUrl: './appeal.component.html',
  styleUrls: ['./appeal.component.css']
})
export class AppealComponent implements OnInit {
  @Input() token;
  @Input() agreementReturn;
  @Input() account;
  @Input() contractAddress;

  balance;
  clerkReward;
  allowedSeller;
  allowedBuyer;
  allowedLogistics;
  returnToPreviousState;

  now = Date.now();

  time;

  constructor(private web3Service: Web3Service) { }

  ngOnInit() {
    setInterval(() => this.getClerkDecision(), 100);
    setInterval(() => this.updateTime(), 100);
  }

  /**
   * Get the decision made by the clerk
   * @returns {Promise<void>}
   */
  async getClerkDecision() {
    const deployedToken = await this.token.deployed();
    this.balance = await deployedToken.balanceOf(this.contractAddress);
    this.time = await this.agreementReturn.methods.arrivalTime(this.contractAddress).call();
    this.clerkReward = await this.agreementReturn.methods.clerkPayment(this.contractAddress).call();
    this.allowedSeller = await this.agreementReturn.methods.sellerTokens(this.contractAddress).call();
    this.allowedBuyer = await this.agreementReturn.methods.buyerTokens(this.contractAddress).call();
    this.allowedLogistics = await this.agreementReturn.methods.logisticsTokens(this.contractAddress).call();
    this.returnToPreviousState = await this.agreementReturn.methods.returnToPrevState(this.contractAddress).call();
  }

  /**
   * Describes the decision made by the clerk (distribute tokens or return to previous state)
   * @returns {string}
   */
  message() {
    let m = 'Return to previous state';
    if (!this.returnToPreviousState) {
      m = 'Distribute tokens and finalize agreement';
    }
    return m;
  }

  /**
   * Update current time. Used to see if it is still possible to appeal against the clerk's decision
   */
  updateTime() {
    this.now = Date.now();
  }

  /**
   * Finilize the clerk's decision. Available after a certain time.
   * @returns {Promise<void>}
   */
  async finalize() {
    try {
      //const gas = await this.agreementReturn.methods.finalizeClerkDecision(this.contractAddress).estimateGas({from: this.account});
      await this.agreementReturn.methods.finalizeClerkDecision(this.contractAddress).send({from: this.account});
      //console.log(gas);
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * Appeal against the clerk's decision. Only available during a limited time.
   * @returns {Promise<void>}
   */
  async reject() {
    try {
      this.agreementReturn.methods.rejectClerkDecision(this.contractAddress).send({from: this.account});
    } catch (e) {
      console.log(e);
    }
  }
}
