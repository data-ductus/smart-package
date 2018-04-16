import { Injectable } from '@angular/core';

@Injectable()
export class AgreementService {

  constructor() { }

  sensorThreshold(threshold: string, set: boolean) {
    if (!set || threshold === '') {
      return -999;
    } else {
      return +threshold;
    }
  }
}
