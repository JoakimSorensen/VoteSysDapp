// SPDX-License-Identifier: UNLICENSED

pragma solidity >= 0.7.0 < 0.9.0;

contract VoteHandling {
	mapping (address => address[]) private voteMap;
	mapping (address => bool) private isCandidate;
	address[] private candidates;
	mapping (address => bool) private voted;
	string public description;

	constructor() {
		description = "A vote handler for users to vote on candidates, added by the contract";
	}

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
	
	function getCandidates() public view returns (address[] memory) {
		return candidates;
	}

	event voteCast(address voter, address candidate); 
	event voteFailed(address voter, string message);
	event candidateAdded(address candidate);
	event candidateFail(address candidate, string message);
}
