const VoteHandling = artifacts.require("VoteHandling");
const truffleAssert = require("truffle-assertions");

contract("VoteHandling", (accounts) => {
	let voteHandling;
	let candidate;
	let voter;
	let admin;

	before(async () => {
		voteHandling = await VoteHandling.deployed();
		voter = accounts[1];
		admin = accounts[5];
	});

	it("Adding a candidate", async () => {
		candidate = accounts[0];
		let tx = await voteHandling.addCandidate(candidate, 
												{from: admin});
		// emits candidateAdded
		truffleAssert.eventEmitted(tx, 'candidateAdded', (ev) => {
			return ev.candidate === candidate;
		});
	});

	it("Adding the same candidate", async () => {
		let tx = await voteHandling.addCandidate(candidate, 
												{from: admin});
		// emits candidateFail
		truffleAssert.eventEmitted(tx, 'candidateFail', (ev) => {
			return ev.candidate === candidate;
		});
	});

	it("Vote for candidate", async () => {
		let tx = await voteHandling.vote(candidate, { from: voter });

		truffleAssert.eventEmitted(tx, 'voteCast', (ev) => {
			return ev.candidate === candidate && ev.voter === voter;
		});
	});
	
	it("Vote again", async () => {
		let tx = await voteHandling.vote(candidate, { from: voter });
		// emits voteFailed
		truffleAssert.eventEmitted(tx, 'voteFailed', (ev) => {
			return ev.voter === voter;
		});
	});

	it("Adding an additional candidate", async () => {
		candidate = accounts[2];
		let tx = await voteHandling.addCandidate(candidate, 
												{from: admin});
		// emits candidateAdded
		truffleAssert.eventEmitted(tx, 'candidateAdded', (ev) => {
			return ev.candidate === candidate;
		});
	});
	
	it("Vote again, different candidate", async () => {
		let tx = await voteHandling.vote(candidate, { from: voter });
		// emits voteFailed
		truffleAssert.eventEmitted(tx, 'voteFailed', (ev) => {
			return ev.voter === voter;
		});
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

	it("Get all candidates", async () => {
		let candidates = await voteHandling.getCandidates();
		const expectedCandidates = [accounts[0], accounts[2]];
		// use deepEqual non-value types
		assert.deepEqual(candidates, expectedCandidates, 
			"Candidates should be returned in order");
	});

	it("Get votes", async () => {
		let votes = await voteHandling.getVotes();
		console.log(votes);
	});
	
	it("Adding several additional candidates from list", async () => {
		let candidates = [accounts[6], accounts[7]];
		let tx = await voteHandling.addCandidateList(candidates, 
												{from: admin});
		// see emitted events
	});

});
