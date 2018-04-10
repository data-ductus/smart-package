import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-accept',
  templateUrl: './accept.component.html',
  styleUrls: ['./accept.component.css']
})
export class AcceptComponent implements OnInit {
  @Input() account: any;
  @Input() agreementDeliver: any;
  @Input() id: number;
  @Input() terms: any;
  @Input() contractAddress: any;

  constructor() { }

  ngOnInit() {
  }

  async acceptProposal() {
    try {
      await this.agreementDeliver.methods.accept(this.contractAddress, this.id).send({from: this.account});
    } catch (e) {
      console.log(e);
    }
  }

  async declineProposal() {
    try {
      await this.agreementDeliver.methods.decline(this.contractAddress, this.id).send({from: this.account});
    } catch (e) {
      console.log(e);
    }
  }

}
