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
    console.log(this.agreementDeliver.methods);
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
      console.log(this.contractAddress, this.id);
      const decl = await this.agreementDeliver.methods.decline(this.contractAddress, this.id).send({from: this.account});
      console.log('decline ', decl);
    } catch (e) {
      console.log(e);
    }
  }
}
