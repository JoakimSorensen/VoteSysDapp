// SPDX-License-Identifier: UNLICENSED

pragma solidity >= 0.7.0 < 0.9.0;

contract CrowdFunding {
	uint numberOfInvestors = 10;
	address[] investors; // keep dynamic to allow change
	mapping(address => uint256) investments;
	mapping(address => bool) isInvestor;

	constructor() {
		investors = new address[](numberOfInvestors);
	}

	function invest(uint256 amount) payable public {
		require(msg.value == amount);
		if (!isInvestor[msg.sender]) {
			investors.push(msg.sender);
			investments[msg.sender] = amount;
			isInvestor[msg.sender] = true;
		} else {
			investments[msg.sender] += amount;
		}
	}

	function getCurrentFunds() public view returns (uint256) {
		return address(this).balance;
	}
}
