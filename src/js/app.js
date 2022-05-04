App = {
	web3Provider: null,
	contracts: {},
	vHandler: null,

	init: async function () {
		return await App.initWeb3();
	},


	initWeb3: async function () {
		// Modern dapp browsers
		var Web3 = require("web3");

		if (window.ethereum) {
			App.web3Provider = window.ethereum;

			try {
				// request account access
				await window.ethereum.request({ method: "eth_requestAccounts"});
			} catch (error) {
				console.error("User denied access");
				console.log(error);
			}

		} else if (window.web3) {

			// Legacy dapp browsers
			App.web3Provider = window.web3.currentProvider;

		} else {
			// if no injected web3 instance is detected, 
			// fall back to develop network
			App.web3Provider = new Web3.providers
				.HttpProvider("http://localhost:8545");
		}

		web3 = new Web3(App.web3Provider);
		return App.initContract();
	},


	initContract: async function () {

		await $.getJSON('VoteHandling.json', function (data) {
			// Get the necessary contract artifact file and instantiate it 
			// with @truffle/contract
			var VoteHandlingArtifact = data;
			App.contracts.VoteHandling = TruffleContract(VoteHandlingArtifact);

			// set provider for contract
			App.contracts.VoteHandling.setProvider(App.web3Provider);
		});


		await $.getJSON('CrowdFunding.json', (data) => {
			var CrowdFundingArtifact = data;
			App.contracts.CrowdFunding = TruffleContract(CrowdFundingArtifact);
			App.contracts.CrowdFunding.setProvider(App.web3Provider);

		});

		return App.bindEvents();
	},


	bindEvents: async function () {
		const _contract = App.contracts.VoteHandling;
		const vHandler = await import('./VoteHandler.js');

		// $('.<class>').click() doesn't work
		$(document).on('click', '.btn-vote', {contract:_contract}, vHandler.handleVote);
		$(document).on('click', '.btn-add-candidate', {contract: _contract}, vHandler.addCandidate);
		$(document).on('click', '.btn-crowdfounding', () => {return;});
		return vHandler.getContractCandidates(_contract);
	}
};


$(function() {
	$(window).load(function() {
		App.init();
	});
});
