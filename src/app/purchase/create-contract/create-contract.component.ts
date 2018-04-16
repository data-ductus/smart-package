import {Component, Input, OnInit} from '@angular/core';
import {Web3Service} from '../../util/web3.service';

@Component({
  selector: 'app-create-contract',
  templateUrl: './create-contract.component.html',
  styleUrls: ['./create-contract.component.css']
})
export class CreateContractComponent implements OnInit {
  @Input() account: string;
  @Input() token: any;
  @Input() dapp: any;

  address: string;

  constructor() { }

  ngOnInit() {
  }

  async addClerk() {
    try {
      await this.dapp.addClerk.sendTransaction(this.address, {from: this.account});
    } catch (e) {
      console.log(e);
    }
  }

}
