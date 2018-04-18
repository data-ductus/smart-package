import {Injectable} from '@angular/core';
import Web3 from 'web3';
import {default as contract} from 'truffle-contract';
import {Subject} from 'rxjs/Rx';

declare let window: any;

@Injectable()
export class Web3Service {
  private web3: Web3;
  private accounts: string[];
  public ready = false;
  public accountsObservable = new Subject<string[]>();
  private Tx = require('ethereumjs-tx');

  constructor() {
    window.addEventListener('load', (event) => {
      this.bootstrapWeb3();
    });
  }

  public bootstrapWeb3() {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof window.web3 !== 'undefined') {
      // Use Mist/MetaMask's provider
      this.web3 = new Web3(window.web3.currentProvider);
    } else {
      console.log('No web3? You should consider trying MetaMask!');

      // Hack to provide backwards compatibility for Truffle, which uses web3js 0.20.x
      Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send;
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      this.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
    }
    setInterval(() => this.refreshAccounts(), 100);
  }

  async signAndSend(data, addressTo, addressFrom) {
    const privateKey = new Buffer('43b4af531c9c7fa66fc43386f493f92d240ed7e129cfbe44c10a772ce8d36239', 'hex');
    const nonce = await this.web3.eth.getTransactionCount(addressFrom);
    const rawTx = {
      nonce: this.web3.utils.toHex(nonce),
      //gasLimit: this.web3.utils.toHex(250000),
      //gasPrice: this.web3.utils.toHex(10e9), // 10 Gwei
      to: addressTo,
      value: 0,
      gas: 2000000,
      data: data
    };
    const tx = new this.Tx(rawTx);
    tx.sign(privateKey);
    const serializedTx = tx.serialize();
    this.web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
      .on('receipt', console.log);
  }

  public async artifactsToContract(artifacts) {
    if (!this.web3) {
      const delay = new Promise(resolve => setTimeout(resolve, 100));
      await delay;
      return await this.artifactsToContract(artifacts);
    }

    const contractAbstraction = contract(artifacts);
    contractAbstraction.setProvider(this.web3.currentProvider);
    return contractAbstraction;

  }

  public async getContract(abi, address) {
    const c = await new this.web3.eth.Contract(abi);
    c.options.address = address;
    console.log('c ', c);
    return c;
  }

  private refreshAccounts() {
    this.web3.eth.getAccounts((err, accs) => {
      console.log('Refreshing accounts');
      if (err != null) {
        console.warn('There was an error fetching your accounts.');
        return;
      }

      // Get the initial account balance so it can be displayed.
      if (accs.length === 0) {
        console.warn('Couldn\'t get any accounts! Make sure your Ethereum client is configured correctly.');
        return;
      }

      if (!this.accounts || this.accounts.length !== accs.length || this.accounts[0] !== accs[0]) {
        console.log('Observed new accounts');

        this.accountsObservable.next(accs);
        this.accounts = accs;
      }

      this.ready = true;
    });
  }
}
