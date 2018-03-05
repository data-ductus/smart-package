import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-accept',
  templateUrl: './accept.component.html',
  styleUrls: ['./accept.component.css']
})
export class AcceptComponent implements OnInit {
  @Input() account: any;
  @Input() purchase: any;
  @Input() state: number;

  constructor() { }

  ngOnInit() {
  }

  async acceptProposal() {
    try {
      await this.purchase.methods.accept().send({from: this.account})
    } catch (e) {
      console.log(e)
    }
  }

  async declineProposal() {
    try {
      await this.purchase.methods.decline().send({from: this.account})
    } catch (e) {
      console.log(e)
    }
  }

}
