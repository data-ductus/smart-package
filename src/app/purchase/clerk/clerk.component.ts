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

  async getContractBalance() {
    const deployedToken = await this.token.deployed();
    this.balance = await deployedToken.balanceOf.call(this.contractAddress);
  }

  async getClerkPayment() {
    this.clerkPayment = await this.agreementReturn.methods.clerkPayment(this.contractAddress).call();
  }

  async getClerk() {
    this.isClerk = await this.clerk.methods.isClerk(this.account).call();
  }

  async solve() {
    try {
      this.agreementReturn.methods.solve(this.contractAddress, this.amountSeller, this.amountBuyer, this.amountLogistics)
        .send({from: this.account});
    } catch (e) {
      console.log(e);
    }
  }

  async returnToPrevState() {
    try {
      this.agreementReturn.methods.returnToPreviousState(this.contractAddress).send({from: this.account});
    } catch (e) {
      console.log(e);
    }
  }

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
