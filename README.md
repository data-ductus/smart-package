Blockchain technology has exploded in 2017. Especially now when Etherium (www.entethalliance.org) is
stabilizing and improving such as privacy and speed. Etherium is the vNext of bitcoin (www.bitcoin.org)
whereas the latter is a currency (at the time of writing; 1 BTC costs around 5.000 EUR).

Etherium supports something called smart contracts that are written in a language called solidity. There are
good tooling around implementing smart contracts and run a Etherium network (consortium). Smart
contracts are executed during the mining process and when consensus in the network is reached the outcome
is agreed upon. This can be used for anything such as commit the withdrawal of money, a position and a
temperature is embedded into the contract etc.
The key thing is that this system is a distributed ledger and is therefore hard to compromise. Thus,
applications that want to achieve mutual trust but not need to trust the individual parties is a good target.
This work is about emulating the Blocket secure package. Where two parties have decided to trade FIAT
money for some goods. When the agreed amount of money and an insurance of the goods quality from the
seller side the seller sends this package. The buyer picks up the package and have 24 hours to confirm that the
goods in the shape agreed upon. Blocket will act as a broker and keep the money that the buyer has paid and
transfer to seller after 24 hours. If buyer disagrees, s/he returns the package within 24 hours and the Blocket
will transfer the money to the buyer.

In this work, we wish to eliminate the third party, instead make use of smart contracts that is a currency itself
that will be delivered to seller’s wallet when buyer do not return the package and automatically reverts the
transaction when buyer do return the package. The package delivery company do get paid in each case, but
after the result of the transaction outcome.
Since package management from, in transit, reception may be subject to damage. The package shall be
instrumented accordingly, e.g. temperature sensor, shake / acceleration sensor. All shall deliver data into the
running contract transaction. This allows e.g. the buyer to check if this package has been mistreated of the
quality parameter set when buying the goods (e.g. temperature over a certain value for goods needs to be
cooled). All data should be combined with location tracking such as GPS or RFID based system.
There are different actors in this system all of which needs their information, but others should be obfuscated.
Therefore, encryption of the payload is needed where different, and overlapping, data needs to be concealed
and recovered by correct actor.
