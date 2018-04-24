import {Component, Input, OnInit} from '@angular/core';
import clerk_artifact from '../../../../build/contracts/clerk.json';
import {Web3Service} from '../../util/web3.service';

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.css']
})
export class ReviewComponent implements OnInit {
  @Input() contractAddress;
  @Input() account;
  @Input() agreementReturn;
  @Input() agreementData;
  @Input() state;
  @Input() seller;
  logistics;

  constructor(private web3Service: Web3Service) { }

  ngOnInit() {
    this.getLogistics();
  }

  async getLogistics() {
    this.logistics = await this.agreementData.methods.deliveryCompany(this.contractAddress).call();
  }

  async compensate() {
    await this.agreementReturn.methods.compensate(this.contractAddress).send({from: this.account});
  }
}
