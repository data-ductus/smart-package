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

  /** @dev Add the sender to the candidate list
    */
  function becomeCandidate() public {
    candidates.push(msg.sender);
  }

  /** @dev Vote for a candidate
    * @param candidate The candidate the sender is voting for
    */
  function vote(address candidate) public {
    require(!hasVotedFor[msg.sender][candidate]);
    hasVotedFor[msg.sender][candidate] = true;
    votes[candidate].push(msg.sender);
  }

  /** @dev Vote for a candidate as a clerk
    * @param candidate The candidate the sender is voting for
    */
  function clerkVote(address candidate) public {
    require(isClerk(msg.sender));
    require(!hasVotedFor[msg.sender][candidate]);

    hasVotedFor[msg.sender][candidate] = true;
    votes[candidate].push(msg.sender);
    clerkVotes[candidate] += 1;
  }

  /** @dev The sender becomes clerk if the requirements are met
    */
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

  /** @dev Check if the sender has enough votes to become clerk
    */
  function checkVotes() public returns(bool){
    var (tokens, cVotes) = getVotes();
    if(tokens >= t.totalSupply()/2 && cVotes >= clerks.length/2) {
      return true;
    }
    return false;
  }

  /** @dev Check if an address is a clerk
    * @param clerk The address to check
    */
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

  /** @dev Get the list of clerks
    * @return The list of clerks
    */
  function getClerks()
    public
    constant
    returns(address[] _clerks)
  {
    return clerks;
  }

  /** @dev Get the number of votes for the sender
    * @return _votes The total number of votes
    * @return _clerkVotes The number of votes by a clerk
    */
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

  /** @dev Get the list of candidates
    * @return _candidates The list of candidates
    */
  function getCandidates()
    public
    constant
    returns(address[] _candidates)
  {
    return candidates;
  }
}
