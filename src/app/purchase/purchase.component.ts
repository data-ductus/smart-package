import { Component, OnInit } from '@angular/core';
import token_artifact from '../../../build/contracts/token.json';
import {Web3Service} from '../util/web3.service';

import dapp_artifact from '../../../build/contracts/dapp.json';
import sale_artifact from '../../../build/contracts/sale.json';
import agreement_deliver_artifact from '../../../build/contracts/agreementDeliver.json';
import purchase_artifact from '../../../build/contracts/purchase.json';
import purchase2_artifact from '../../../build/contracts/purchase2.json';
import clerk_artifact from '../../../build/contracts/clerk.json';

@Component({
  selector: 'app-purchase',
  templateUrl: './purchase.component.html',
  styleUrls: ['./purchase.component.css']
})
export class PurchaseComponent implements OnInit {

  dapp: any;
  sale: any;
  agreementData: any;
  agreementDeliver: any;
  agreementReturn: any;
  clerk: any;

  contracts: any;
  ether: number;

  accounts: string[];
  token: any;
  model = {
    balance: 0,
    account: ''
  };


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
    this.getSale();
    this.getDapp();
  }

  /**
   * Check who's currently logged in.
   */
  watchAccount() {
    this.web3Service.accountsObservable.subscribe((accounts) => {
      this.accounts = accounts;
      this.model.account = accounts[0];
      this.refreshBalance();
    });
  }

  /**
   * Refresh the amount of tokens a user has.
   * @returns {Promise<void>}
   */
  async refreshBalance() {
    console.log('Refreshing balance');

    try {
      const deployedToken = await this.token.deployed();
      const knvBalance = await deployedToken.balanceOf.call(this.model.account);
      console.log('Found balance: ' + knvBalance);
      this.model.balance = knvBalance;
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * Get token sale contract.
   * @returns {Promise<void>}
   */
  async getSale() {
    const saleAbstraction = await this.web3Service.artifactsToContract(sale_artifact);
    this.sale = await saleAbstraction.deployed();
  }

  /**
   * Get the contracts used by the components on the site.
   * @returns {Promise<void>}
   */
  async getDapp() {
    const dappAbstraction = await this.web3Service.artifactsToContract(dapp_artifact);
    const agreementDataAbstraction = await this.web3Service.artifactsToContract(purchase_artifact);
    const agreementDeliverAbstraction = await this.web3Service.artifactsToContract(agreement_deliver_artifact);
    const agreementReturnAbstraction = await this.web3Service.artifactsToContract(purchase2_artifact);
    const clerkAbstraction = await this.web3Service.artifactsToContract(clerk_artifact);
    const deployedDapp = await dappAbstraction.deployed();
    this.dapp = await this.web3Service.getContract(deployedDapp.abi, deployedDapp.address);
    console.log('dapp ', this.dapp);
    const agrData = await agreementDataAbstraction.deployed();
    const agrDeliver = await agreementDeliverAbstraction.deployed();
    const agrReturn = await agreementReturnAbstraction.deployed();
    const cl = await clerkAbstraction.deployed();
    await this.getContracts(agrData, agrDeliver, agrReturn, cl);
    setInterval(() => this.getAgreements(), 1000);
  }

  /**
   * Helper function for getting contracts.
   * @param agrData Agreement data contract
   * @param agrDeliver Agreement deliver contract
   * @param agrReturn Agreement return contract
   * @param cl Clerk contract
   * @returns {Promise<void>}
   */
  async getContracts(agrData, agrDeliver, agrReturn, cl) {
    try {
      this.agreementData = await this.web3Service.getContract(agrData.abi, agrData.address);
      this.agreementDeliver = await this.web3Service.getContract(agrDeliver.abi, agrDeliver.address);
      this.agreementReturn = await this.web3Service.getContract(agrReturn.abi, agrReturn.address);
      this.clerk = await this.web3Service.getContract(cl.abi, cl.address);
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * Get all created agreements.
   * @returns {Promise<void>}
   */
  async getAgreements() {
    this.contracts = await this.dapp.methods.getAllContracts().call({from: this.model.account});
  }

  /**
   * Buy tokens by spending ether.
   * @returns {Promise<void>}
   */
  async buyTokens() {
    await this.sale.buyTokens.sendTransaction(this.model.account, {from: this.model.account, value: this.ether});
  }

}
