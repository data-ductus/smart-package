import {Component, Input, OnInit} from '@angular/core';
import {Web3Service} from '../../util/web3.service';
import dapp_artifact from '../../../../build/contracts/dapp.json';


@Component({
  selector: 'app-create-contract',
  templateUrl: './create-contract.component.html',
  styleUrls: ['./create-contract.component.css']
})
export class CreateContractComponent implements OnInit {
  @Input() account: string;
  @Input() token: any;
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

  async getContracts() {
    try {
      const deployedDapp = await this.dapp.deployed();
      this.contracts = await deployedDapp.getAllContracts.call({from: this.account});
      console.log(this.contracts)
    } catch (e) {
      console.log(e);
    }
  }

}
