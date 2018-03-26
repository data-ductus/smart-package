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
  address: string;
  constructor(private web3Service: Web3Service) { }

  ngOnInit() {
    this.getDapp();
  }
  async getDapp() {
    const dappAbstraction = await this.web3Service.artifactsToContract(dapp_artifact);
    this.dapp = await dappAbstraction.deployed();
    await this.getContracts();
  }
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
      const purchaseAddress = await this.dapp.purchase2.call();
      const purchaseAbstraction = await this.web3Service.artifactsToContract(purchase2_artifact);
      this.purchase = await this.web3Service.getContract(purchaseAbstraction.abi, purchaseAddress);
      this.contracts = await this.dapp.getAllContracts.call({from: this.account});
      console.log('contracts ', this.contracts);
    } catch (e) {
      console.log(e);
    }
  }
  async addClerk() {
    try {
      await this.dapp.addClerk.sendTransaction(this.address, {from: this.account});
    } catch (e) {
      console.log(e);
    }
  }

}
