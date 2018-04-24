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
  now = Date.now();
  time;

  constructor() { }

  ngOnInit() {
    setInterval(() => this.updateTime(), 100);
    setInterval(() => this.getArrivalTime(), 100);
  }

  /**
   * Update current time. Used by function available after or before a certain time.
   */
  updateTime() {
    this.now = Date.now();
  }

  /**
   * Get the arrival time of the package.
   * @returns {Promise<void>}
   */
  async getArrivalTime() {
    this.time = await this.agreementReturn.methods.arrivalTime(this.contractAddress).call();
  }

  /**
   * Finalize the agreement. Available if the seller does not claim that the goods are damaged.
   * @returns {Promise<void>}
   */
  async successReturn() {
    await this.agreementReturn.methods.successReturn(this.contractAddress).send({from: this.account});
  }

  /**
   * Ask the logistics company for a compensation for damaged goods.
   * @returns {Promise<void>}
   */
  async goodsDamaged() {
    await this.agreementReturn.methods.goodsDamaged(this.contractAddress).send({from: this.account});
  }
}
