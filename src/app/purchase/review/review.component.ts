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
  @Input() agreementDeliver;
  @Input() state;
  @Input() seller;
  logistics;

  constructor(private web3Service: Web3Service) { }

  ngOnInit() {
    setInterval(() => this.getLogistics(), 100);
  }

  /**
   * Get the logistics company.
   * @returns {Promise<void>}
   */
  async getLogistics() {
    this.logistics = await this.agreementDeliver.methods.deliveryCompany(this.contractAddress).call();
  }

  /**
   * Compensate the seller for damaged goods and finalize the agreement.
   * @returns {Promise<void>}
   */
  async compensate() {
    await this.agreementReturn.methods.compensate(this.contractAddress).send({from: this.account});
  }
}
