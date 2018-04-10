import {Component, Input, OnInit} from '@angular/core';
import {Web3Service} from '../../util/web3.service';
import dapp_artifact from '../../../../build/contracts/dapp.json';
import purchase_data_artifact from '../../../../build/contracts/purchaseData.json';
import purchase_artifact from '../../../../build/contracts/purchase.json';
import purchase2_artifact from '../../../../build/contracts/purchase2.json';

@Component({
  selector: 'app-create-contract',
  templateUrl: './create-contract.component.html',
  styleUrls: ['./create-contract.component.css']
})
export class CreateContractComponent implements OnInit {
  @Input() account: string;
  @Input() token: any;
  agreementData: any;
  agreementDeliver: any;
  agreementReturn: any;
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
    const agreementDataAbstraction = await this.web3Service.artifactsToContract(purchase_data_artifact);
    const agreementDeliverAbstraction = await this.web3Service.artifactsToContract(purchase_artifact);
    const agreementReturnAbstraction = await this.web3Service.artifactsToContract(purchase2_artifact);
    this.dapp = await dappAbstraction.deployed();
    const agrData = await agreementDataAbstraction.deployed();
    const agrDeliver = await agreementDeliverAbstraction.deployed();
    const agrReturn = await agreementReturnAbstraction.deployed();
    await this.getContracts(agrData, agrDeliver, agrReturn);
    await this.getAgreements();
  }
  async createMinimalPurchase() {
    try {
      const deployedDapp = await this.dapp.deployed();
      await deployedDapp.createMinimalPurchase.sendTransaction(this.price, {from: this.account});
      this.getAgreements();
    } catch (e) {
      console.log(e);
    }
  }
  async getContracts(agrData, agrDeliver, agrReturn) {
    try {
      this.agreementData = await this.web3Service.getContract(agrData.abi, agrData.address);
      this.agreementDeliver = await this.web3Service.getContract(agrDeliver.abi, agrDeliver.address);
      this.agreementReturn = await this.web3Service.getContract(agrReturn.abi, agrReturn.address);
      console.log('data ', this.agreementData);
    } catch (e) {
      console.log(e);
    }
  }
  async getAgreements() {
    this.contracts = await this.dapp.getAllContracts.call({from: this.account});
  }
  async addClerk() {
    try {
      await this.dapp.addClerk.sendTransaction(this.address, {from: this.account});
    } catch (e) {
      console.log(e);
    }
  }

}
