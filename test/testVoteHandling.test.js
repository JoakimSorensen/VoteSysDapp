const VoteHandling = artifacts.require("VoteHandling");
const truffleAssert = require("truffle-assertions");

contract("VoteHandling", (accounts) => {
	let voteHandling;
	let candidate;

	before(async () => {
		voteHandling = await VoteHandling.deployed();
	});

	it("Adding a candidate", async () => {
		candidate = accounts[0];
		let tx = await voteHandling.addCandidate(candidate);
		truffleAssert.eventEmitted('candidateAdded', (ev) => {
			ev.candidate === candidate;
		});
	});

	it("Vote for candidate", async () => {
		let voter = accounts[1]
		let tx = await voteHandling.vote(candidate, { from: voter });

		truffleAssert.eventEmitted(tx, 'voteCast', (ev) => {
			return ev.candidate === candidate && ev.voter === voter;
		});
	});
});
