import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-accept',
  templateUrl: './accept.component.html',
  styleUrls: ['./accept.component.css']
})
export class AcceptComponent implements OnInit {
  @Input() account: any;
  @Input() agreementData: any;
  @Input() id: number;
  @Input() terms: any;
  @Input() contractAddress: any;

  constructor() { }

  ngOnInit() {
    console.log(this.agreementData.methods);
  }

  async acceptProposal() {
    try {
      await this.agreementData.methods.accept(this.contractAddress, this.id).send({from: this.account});
    } catch (e) {
      console.log(e);
    }
  }

  async declineProposal() {
    try {
      console.log(this.contractAddress, this.id);
      const decl = await this.agreementData.methods.decline(this.contractAddress, this.id).send({from: this.account});
      console.log('decline ', decl);
    } catch (e) {
      console.log(e);
    }
  }
}
