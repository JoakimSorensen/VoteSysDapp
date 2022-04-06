// SPDX-License-Identifier: UNLICENSED

pragma solidity >= 0.7.0 < 0.9.0;

import "@openzeppelin/contracts/utils/Strings.sol";

contract VoteHandling {
	mapping (address => address[]) private voteMap; // who has vote for whom
	mapping (address => bool) private isCandidate; 
	address[] private candidates;
	mapping (address => bool) private voted;

	constructor() {}

	function vote(address candidate) public {
		// check if address is valid
		require(candidate == address(candidate));
		address voter = msg.sender;
	
		// append to candidates votes and voted
		if (!voted[voter]) {
			voted[voter] = true; // initialized as false by default
			voteMap[candidate].push(voter);
			emit voteCast(voter, candidate);
		} else if (voted[voter]) {
			emit voteFailed(voter, "Already Voted");
		}
	}

	function addCandidate(address candidate) public {
		// check if address is valid	
		require(candidate == address(candidate));
		if (!isCandidate[candidate]) {
			isCandidate[candidate] = true;
			candidates.push(candidate);
			emit candidateAdded(candidate);
		} else {
			emit candidateFail(candidate, "Already a candidate");
		}
	}
	
	function addCandidateList(address[] memory _candidates) public {
		for (uint i = 0; i < _candidates.length; i++) {
			addCandidate(_candidates[i]);
		}
	}
	
	function getCandidates() public view returns (address[] memory) {
		return candidates;
	}

	function hasVoted(address voter) public view returns (bool) {
		return voted[voter];
	}

	function getVotes() public view returns (string[] memory) {
		string[] memory voteCount = new string[](candidates.length);
		for (uint i = 0; i < candidates.length; i++) {
			voteCount[i] = Strings.toString(voteMap[candidates[i]].length);
		}
		return voteCount;
	}


	event voteCast(address voter, address candidate); 
	event voteFailed(address voter, string message);
	event candidateAdded(address candidate);
	event candidateFail(address candidate, string message);
}
