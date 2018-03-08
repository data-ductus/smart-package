import {Component, Input, OnInit} from '@angular/core';
@Component({
  selector: 'app-simulation',
  templateUrl: './simulation.component.html',
  styleUrls: ['./simulation.component.css']
})
export class SimulationComponent implements OnInit {
  @Input() contractAddress: string;
  @Input() account: string;
  @Input() purchase: any;

  model = {
    type: '',
    id: ''
  };
  constructor() { }

  ngOnInit() {
  }

  async setProvider() {
    console.log('set provider', this.account);
    await this.purchase.methods.setProvider(this.contractAddress, this.model.type, this.model.id).send({from: this.account});
    await this.getSensor('maxTemp');
  }

  private async getSensor(type: string) {
    const sensor = await this.purchase.methods.getSensor(this.contractAddress, type).call();
    console.log('sensor', sensor);
  }
}
