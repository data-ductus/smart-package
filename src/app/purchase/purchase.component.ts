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

  async sendTokens() {
    const deployedToken = await this.token.deployed();
    await deployedToken.transfer.sendTransaction('0x5a1813C2F7F0183b374Fd0faa3952a945202EcB0', 10000, {from: this.model.account});
    await deployedToken.transfer.sendTransaction('0x1Db698682F691d0604e33Ab803fb32533EAb5F39', 10000, {from: this.model.account});
  }

}
