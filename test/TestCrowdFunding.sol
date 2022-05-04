pragma solidity >= 0.7.0 < 0.9.0;

import "truffle/Assert.sol"
import "DeployedAddresses.sol"
import "../contracts/CrowdFunding.sol"

contract TestCrowdFunding {
  // The addresses to be tested
  CrowdFunding crowdfounding = CrowdFunding(DeployedAddresses.CrowdFunding);

  uint256 amountToTest; 
  address expectedInvestor = address(this);

}
