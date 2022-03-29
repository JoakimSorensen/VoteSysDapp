const VoteHandling = artifacts.require("VoteHandling");
const truffleAssert = require("truffle-assertions");

contract("VoteHandling", (accounts) => {
	let voteHandling;
	let candidate;
	let voter;

	before(async () => {
		voteHandling = await VoteHandling.deployed();
		voter = accounts[1];
	});

	it("Adding a candidate", async () => {
		candidate = accounts[0];
		let tx = await voteHandling.addCandidate(candidate);
		// doesn't return recepit but emits candidateAdded
	});

	it("Adding the same candidate", async () => {
		let tx = await voteHandling.addCandidate(candidate);
		// doesn't return recepit but emits candidateFailed
	});

	it("Vote for candidate", async () => {
		let tx = await voteHandling.vote(candidate, { from: voter });

		truffleAssert.eventEmitted(tx, 'voteCast', (ev) => {
			return ev.candidate === candidate && ev.voter === voter;
		});
	});
	
	it("Vote again", async () => {
		let tx = await voteHandling.vote(candidate, { from: voter });
		// doesn't return recepit but emits voteFailed
	});

	it("Adding an additional candidate", async () => {
		candidate = accounts[2];
		let tx = await voteHandling.addCandidate(candidate);
		// doesn't return recepit but emits candidateAdded
	});
	
	it("Vote again, different candidate", async () => {
		let tx = await voteHandling.vote(candidate, { from: voter });
		// doesn't return recepit but emits voteFailed
	});
	
	it("Candidate vote for self", async () => {
		let tx = await voteHandling.vote(candidate, { from: candidate });

		truffleAssert.eventEmitted(tx, 'voteCast', (ev) => {
			return ev.candidate === candidate && ev.voter === candidate;
		});
	});

	it("Vote for candidate, different voter", async () => {
		voter = accounts[3];
		let tx = await voteHandling.vote(candidate, { from: voter });

		truffleAssert.eventEmitted(tx, 'voteCast', (ev) => {
			return ev.candidate === candidate && ev.voter === voter;
		});
	});
});
