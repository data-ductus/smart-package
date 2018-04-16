import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-clerk-vote',
  templateUrl: './clerk-vote.component.html',
  styleUrls: ['./clerk-vote.component.css']
})
export class ClerkVoteComponent implements OnInit {
  @Input() clerk: any;
  @Input() account: any;

  clerks: any;
  candidates: any;
  isCandidate = false;
  isClerk = false;

  eligible = false;

  showCandidates = false;
  showClerks = false;

  constructor() { }

  ngOnInit() {
    setInterval(() => this.getClerks(), 100);
    setInterval(() => this.getCandidates(), 100);
    setInterval(() => this.checkVotes(), 100);
  }

  async getClerks() {
    if (this.clerk) {
      this.clerks = await this.clerk.methods.getClerks().call();
      this.isClerk = await this.clerk.methods.isClerk(this.account).call();
    }
  }

  async getCandidates() {
    if (this.clerk) {
      let cand = false;
      this.candidates = await this.clerk.methods.getCandidates().call();
      for (let i = 0; i < this.candidates.length; i++) {
        if (this.account === this.candidates[i]) {
          cand = true;
          break;
        }
      }
      this.isCandidate = cand;
    }
  }

  async becomeCandidate() {
    try {
      await this.clerk.methods.becomeCandidate().send({from: this.account});
    } catch (e) {
      console.log(e);
    }
  }

  async vote(candidate) {
    try {
      if (this.isClerk) {
        await this.clerk.methods.clerkVote(candidate).send({from: this.account});
      } else {
        await this.clerk.methods.vote(candidate).send({from: this.account});
      }
    } catch (e) {
      console.log(e);
    }
  }

  async checkVotes() {
    try {
      this.eligible = await this.clerk.methods.checkVotes().call({from: this.account});
    } catch (e) {
      console.log(e);
    }
  }

  async becomeClerk() {
    try {
      await this.clerk.methods.becomeClerk().send({from: this.account});
    } catch (e) {
      console.log(e);
    }
  }
}
