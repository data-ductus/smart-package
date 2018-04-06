pragma solidity ^0.4.0;

import "../Token/Token.sol";

contract Clerk {

  address[] public candidates;
  mapping(address => address[]) public votes;
  mapping(address => uint) public clerkVotes;
  mapping(address => mapping(address => bool)) public hasVotedFor;
  address[] public clerks;
  Token t;

  function Clerk(address _token){
    t = Token(_token);
  }

  function becomeCandidate() public {
    candidates.push(msg.sender);
  }

  function vote(address candidate) public {
    require(!hasVotedFor[msg.sender][candidate]);
    hasVotedFor[msg.sender][candidate] = true;
    votes[candidate].push(msg.sender);
  }

  function clerkVote(address candidate) public {
    require(isClerk(msg.sender));
    require(!hasVotedFor[msg.sender][candidate]);

    hasVotedFor[msg.sender][candidate] = true;
    votes[candidate].push(msg.sender);
    clerkVotes[candidate] += 1;
  }

  function becomeClerk() public {
    require(checkVotes());
    for (uint i = 0; i < candidates.length; i++) {
      if (candidates[i] == msg.sender) {
        delete candidates[i];
        break;
      }
    }
    clerks.push(msg.sender);
  }

  function checkVotes() public returns(bool){
    var (tokens, cVotes) = getVotes();
    if(tokens >= t.totalSupply()/2 && cVotes >= clerks.length/2) {
      return true;
    }
    return false;
  }

  function isClerk(address clerk)
    public
    constant
    returns(bool)
  {
    for (uint i = 0; i < clerks.length; i++) {
      if (clerks[i] == clerk) {
        return true;
      }
    }
    return false;
  }

  function getClerks()
    public
    constant
    returns(address[])
  {
    return clerks;
  }

  function getVotes()
    public
    constant
    returns(uint _votes, uint _clerkVotes)
  {
    uint tokens;
    for (uint i = 0; i < votes[msg.sender].length; i++) {
      tokens += t.balanceOf(votes[msg.sender][i]);
    }
    return (tokens, clerkVotes[msg.sender]);
  }

  function getCandidates()
    public
    constant
    returns(address[])
  {
    return candidates;
  }
}
