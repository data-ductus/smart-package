import { Injectable } from '@angular/core';

@Injectable()
export class AgreementService {

  constructor() { }

  /**
   * Checks if the sensor should be set and returns the value that should be sent to the blockchain.
   * @param {string} threshold
   * @param {boolean} set
   * @returns {number}
   */
  sensorThreshold(threshold: string, set: boolean) {
    if (!set || threshold === '') {
      return -999;
    } else {
      return +threshold;
    }
  }
}
