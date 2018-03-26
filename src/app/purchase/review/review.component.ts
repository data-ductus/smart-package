import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.css']
})
export class ReviewComponent implements OnInit {
  @Input() contractAddress;
  @Input() account;
  @Input() purchase;
  @Input() state;
  @Input() seller;
  @Input() dapp;
  amountSeller: number;
  amountBuyer: number;
  amountDelivery: number;
  isClerk = false;
  constructor() { }

  ngOnInit() {
    setInterval(() => this.getClerks(), 1000);
  }
  async compensate() {
    await this.purchase.methods.compensate(this.contractAddress).send({from: this.account});
  }
  async clerk() {
    await this.purchase.methods.clerk(this.contractAddress).send({from: this.account});
  }
  async solve() {
    await this.purchase.methods.solve(this.contractAddress, this.amountSeller, this.amountBuyer, this.amountDelivery)
      .send({from: this.account});
  }
  async getClerks() {
    const clerks = await this.dapp.getClerks.call();
    for (let i = 0; i < clerks.length; i++) {
      if (clerks[i] === this.account) {
        this.isClerk = true;
        return;
      }
    }
    this.isClerk = false;
    return;
  }
}
