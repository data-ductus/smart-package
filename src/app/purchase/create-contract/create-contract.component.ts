import {Component, Input, OnInit} from '@angular/core';
import {Web3Service} from '../../util/web3.service';
import dapp_artifact from '../../../../build/contracts/dapp.json';
import purchase2_artifact from '../../../../build/contracts/purchase2.json';


@Component({
  selector: 'app-create-contract',
  templateUrl: './create-contract.component.html',
  styleUrls: ['./create-contract.component.css']
})
export class CreateContractComponent implements OnInit {
  @Input() account: string;
  @Input() token: any;
  purchase: any;
  dapp: any;
  price: number;
  contracts: any[];
  constructor(private web3Service: Web3Service) { }

  ngOnInit() {
    this.web3Service.artifactsToContract(dapp_artifact)
      .then((dappAbstraction) => {
        this.dapp = dappAbstraction;
        this.getContracts();
      });
  }
/*
  async createContract() {
    try {
      const deployedDapp = await this.dapp.deployed();
      const contractAddress = await deployedDapp.createContract.sendTransaction(this.price, {from: this.account});
      console.log(contractAddress);
      this.getContracts();
    } catch (e) {
      console.log(e);
    }
  }

  async createContractUsingLibrary() {
    try {
      const deployedDapp = await this.dapp.deployed();
      const contractAddress = await deployedDapp.createPurchaseUsingLibrary.sendTransaction(this.price, {from: this.account});
      console.log(contractAddress);
      this.getContracts();
    } catch (e) {
      console.log(e);
    }
  }
*/
  async createMinimalPurchase() {
    try {
      const deployedDapp = await this.dapp.deployed();
      await deployedDapp.createMinimalPurchase.sendTransaction(this.price, {from: this.account});
      this.getContracts();
    } catch (e) {
      console.log(e);
    }
  }

  async getContracts() {
    try {
      const deployedDapp = await this.dapp.deployed();
      const purchaseAddress = await deployedDapp.purchase2.call();
      const purchaseAbstraction = await this.web3Service.artifactsToContract(purchase2_artifact);
      this.purchase = await this.web3Service.getContract(purchaseAbstraction.abi, purchaseAddress);
      this.contracts = await deployedDapp.getAllContracts.call({from: this.account});
      console.log('contracts ', this.contracts);
    } catch (e) {
      console.log(e);
    }
  }

}
