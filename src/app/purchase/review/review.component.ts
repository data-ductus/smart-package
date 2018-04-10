import {Component, Input, OnInit} from '@angular/core';
import clerk_artifact from '../../../../build/contracts/clerk.json';
import {Web3Service} from '../../util/web3.service';

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.css']
})
export class ReviewComponent implements OnInit {
  @Input() contractAddress;
  @Input() account;
  @Input() agreementReturn;
  @Input() state;
  @Input() seller;
  clerkContract: any;
  amountSeller: number;
  amountBuyer: number;
  amountDelivery: number;
  isClerk = false;

  constructor(private web3Service: Web3Service) { }

  ngOnInit() {
    this.getClerkContract();
  }

  async compensate() {
    await this.agreementReturn.methods.compensate(this.contractAddress).send({from: this.account});
  }

  async clerk() {
    await this.agreementReturn.methods.clerk(this.contractAddress).send({from: this.account});
  }

  async solve() {
    await this.agreementReturn.methods.solve(this.contractAddress, this.amountSeller, this.amountBuyer, this.amountDelivery)
      .send({from: this.account});
  }

  async getClerkContract() {
    const clerkAbstraction = await this.web3Service.artifactsToContract(clerk_artifact);
    const c = await clerkAbstraction.deployed();
    this.clerkContract = await this.web3Service.getContract(c.abi, c.address);
    setInterval(() => this.getClerks(), 1000);
  }

  async getClerks() {
    const clerks = await this.clerkContract.methods.getClerks.call();
    for (let i = 0; i < clerks.length; i++) {
      if (clerks[i] === this.account) {
        this.isClerk = true;
        return;
      }
    }
    this.isClerk = false;
    return;
  }
}
