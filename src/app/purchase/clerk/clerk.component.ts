import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-clerk',
  templateUrl: './clerk.component.html',
  styleUrls: ['./clerk.component.css']
})
export class ClerkComponent implements OnInit {
  @Input() account;
  @Input() clerk;
  @Input() agreementReturn;
  @Input() contractAddress;
  @Input() token;

  clerkPayment = 0;
  balance = 0;
  increasedReward = 0;
  isClerk = false;

  amountSeller = 0;
  amountBuyer = 0;
  amountLogistics = 0;

  constructor() { }

  ngOnInit() {
    setInterval(() => this.getClerkPayment(), 100);
    setInterval(() => this.getContractBalance(), 100);
    setInterval(() => this.getClerk(), 1000);
  }

  /**
   * Get the number of tokens trapped in the contract.
   * @returns {Promise<void>}
   */
  async getContractBalance() {
    const deployedToken = await this.token.deployed();
    this.balance = await deployedToken.balanceOf.call(this.contractAddress);
  }

  /**
   * Get the number of tokens that will be given as a reward to the clerk.
   * @returns {Promise<void>}
   */
  async getClerkPayment() {
    this.clerkPayment = await this.agreementReturn.methods.clerkPayment(this.contractAddress).call();
  }

  /**
   * Check if the current user is a clerk
   * @returns {Promise<void>}
   */
  async getClerk() {
    this.isClerk = await this.clerk.methods.isClerk(this.account).call();
  }

  /**
   * Propose a solution to the problem
   * @returns {Promise<void>}
   */
  async solve() {
    try {
      this.agreementReturn.methods.solve(this.contractAddress, this.amountSeller, this.amountBuyer, this.amountLogistics)
        .send({from: this.account});
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * Propose a return to previous state of the agreement
   * @returns {Promise<void>}
   */
  async returnToPrevState() {
    try {
      this.agreementReturn.methods.returnToPreviousState(this.contractAddress).send({from: this.account});
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * Increase the clerk reward
   * @returns {Promise<void>}
   */
  async increaseClerkPayment() {
    try {
      const deployedToken = await this.token.deployed();
      await deployedToken.approve.sendTransaction(this.contractAddress, this.increasedReward, {from: this.account});
      await this.agreementReturn.methods.increaseClerkPayment(this.contractAddress, this.increasedReward).send({from: this.account});
    } catch (e) {
      console.log(e);
    }
  }
}
