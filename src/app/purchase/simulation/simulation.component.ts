import {Component, Input, OnInit} from '@angular/core';
import {Web3Service} from '../../util/web3.service';
import purchase_artifact from '../../../../build/contracts/purchase.json';

@Component({
  selector: 'app-simulation',
  templateUrl: './simulation.component.html',
  styleUrls: ['./simulation.component.css']
})
export class SimulationComponent implements OnInit {
  @Input() contractAddress: string;
  @Input() account: string;
  contract: any;
  purchase: any;
  simulationData: any[];

  model = {
    type: '',
    id: '',
    value: ''
  };
  constructor(private web3Service: Web3Service) { }

  ngOnInit() {
    this.web3Service.artifactsToContract(purchase_artifact)
      .then((purchaseAbstraction) => {
        this.contract = purchaseAbstraction;
        this.getPurchase();
      });
    console.log(this.account);
    this.simulationData = [];
  }

  async getPurchase() {
    this.purchase = await this.web3Service.getContract(this.contract.abi, this.contractAddress);
    this.purchase.options.from = this.account;
  }

  async setProvider() {
    console.log('set provider', this.account);
    await this.purchase.methods.setProvider(this.model.type, this.model.id).send({from: this.account});
    await this.getSensor('maxTemp');
  }

  add() {
    this.simulationData.push(Object.assign({}, this.model));
  }

  async start() {
    await this.purchase.methods.transport().send({from: this.account});
    for (let i = 0; i < this.simulationData.length; i++) {
      await this.purchase.methods.sensorData(this.simulationData[i].type, this.simulationData[i].id,
        this.simulationData[i].value).send({from: this.account});
    }
    await this.purchase.methods.deliver().send();
    await this.getSensor('maxTemp');
  }

  private async getSensor(type: string) {
    const sensor = await this.purchase.methods.getSensor(type).call();
    console.log('sensor', sensor);
  }
}
