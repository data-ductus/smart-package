import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-returned',
  templateUrl: './returned.component.html',
  styleUrls: ['./returned.component.css']
})
export class ReturnedComponent implements OnInit {
  @Input() contractAddress;
  @Input() account;
  @Input() purchase;
  @Input() seller;

  constructor() { }

  ngOnInit() {
  }
  async sellerSatisfied() {
    await this.purchase.methods.sellerSatisfied(this.contractAddress).send({from: this.account});
  }
  async goodsDamaged() {
    await this.purchase.methods.goodsDamaged(this.contractAddress).send({from: this.account});
  }
}
