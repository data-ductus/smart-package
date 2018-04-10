import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-returned',
  templateUrl: './returned.component.html',
  styleUrls: ['./returned.component.css']
})
export class ReturnedComponent implements OnInit {
  @Input() contractAddress;
  @Input() account;
  @Input() agreementReturn;
  @Input() seller;
  @Input() state;

  constructor() { }

  ngOnInit() {
  }
  async successReturn() {
    await this.agreementReturn.methods.successReturn(this.contractAddress).send({from: this.account});
  }
  async goodsDamaged() {
    await this.agreementReturn.methods.goodsDamaged(this.contractAddress).send({from: this.account});
  }
}
