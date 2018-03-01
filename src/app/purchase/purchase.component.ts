import { Component, OnInit } from '@angular/core';
import token_artifact from '../../../build/contracts/token.json';
import {Web3Service} from '../util/web3.service';

@Component({
  selector: 'app-purchase',
  templateUrl: './purchase.component.html',
  styleUrls: ['./purchase.component.css']
})
export class PurchaseComponent implements OnInit {

  accounts: string[];
  token: any;

  model = {
    balance: 0,
    account: ''
  };

  status = '';

  constructor(private web3Service: Web3Service) {
    console.log('Constructor: ' + web3Service);
  }

  ngOnInit() {
    console.log('OnInit: ' + this.web3Service);
    console.log(this);
    this.watchAccount();
    this.web3Service.artifactsToContract(token_artifact)
      .then((tokenAbstraction) => {
        this.token = tokenAbstraction;
      });
  }

  watchAccount() {
    this.web3Service.accountsObservable.subscribe((accounts) => {
      this.accounts = accounts;
      this.model.account = accounts[0];
      this.refreshBalance();
    });
  }

  async refreshBalance() {
    console.log('Refreshing balance');

    try {
      const deployedToken = await this.token.deployed();
      const knvBalance = await deployedToken.balanceOf.call(this.model.account);
      console.log('Found balance: ' + knvBalance);
      this.model.balance = knvBalance;
    } catch (e) {
      console.log(e);
      this.setStatus('Error getting balance; see log.');
    }
  }

  setStatus(status) {
    this.status = status;
  }

  clickAddress(e) {
    this.model.account = e.target.value;
    this.refreshBalance();
  }

}
