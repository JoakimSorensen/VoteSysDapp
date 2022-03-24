// SPDX-License-Identifier: UNLICENSED

pragma solidity >= 0.7.0 < 0.9.0;

contract VoteHandling {
	mapping (address => address[]) private voteMap;
	mapping (address => bool) private voted;
	address private constant EMPTY_ADDRESS = 0x0000000000000000000000000000000000000000;
	string public description;

	constructor() {
		description = "A vote handler for users to vote on candidates, added by the contract";
	}

	function vote(address candidate) public returns (address) {
		// check if address is valid
		require(candidate == address(candidate));
		address voter = msg.sender;
	
		// append to candidates votes and voted
		if (!voted[voter]) {
			voted[voter] = true; //bool value doesn't really matter in current state
			voteMap[candidate].push(voter);
			emit voteCast(voter, candidate);
		} else if (voted[voter]) {
			emit voteFailed(voter, "Already Voted");
			return EMPTY_ADDRESS;
		}
		return candidate;
	}

	function addCandidate(address candidate) public {
		// check if address is valid	
		require(candidate == address(candidate));
		voteMap[candidate].push(EMPTY_ADDRESS);

	}

	event voteCast(address voter, address candidate); 
	event voteFailed(address voter, string message);
}
