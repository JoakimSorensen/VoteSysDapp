App = {
	web3Provider: null,
	contracts: {},

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

		return App.bindEvents();
	},


	bindEvents: function () {
		$(document).on('click', '.btn-vote', App.handleVote);
		$(document).on('click', '.btn-add-candidate', App.addCandidate);
		return App.getContractCandidates();
	},


	addCandidate: async function () {

		/* For easy testing, this functionality is
		 supposed to be on admin page or similar */

		//var candidates;
		var candidateList = [];

		var candidates = await $.getJSON('../candidate.json', function (data) {
			//candidates = data;
			return data;
		});


		await web3.eth.getAccounts(async (error, accounts) => {
			if (error) {
				console.log(error);
			}

			var account = accounts[0];// only returns current selected

			for (i = 0; i < candidates.length; i++) {
				console.log('Adding candidate ' + candidates[i].eth_address);
				candidateList.push(candidates[i].eth_address);
			}

			voteHandlingInstance = await App.contracts.VoteHandling.deployed();

			console.log('adding candidate list ' + candidateList);

			await voteHandlingInstance.addCandidateList(candidateList,
				{from: account});	

			return App.getContractCandidates();
		});
	}, 


	getContractCandidates: async function () {
		var voteHandlingInstance;
		var candidateRow = $('#candidateRow');
		var candidateTemplate = $('#candidateTemplate');

		voteHandlingInstance = await App.contracts.VoteHandling.deployed();

		var candidates = await voteHandlingInstance.getCandidates.call();

		console.log("candidates retrieved from contract: " + candidates);

		if (candidates.length == 0) {
			console.log("Couldn't retrieve candidates");

			$(document).find('.btn-add-candidate').attr('style', 'visibility:visible')
				.attr('disable', false);
		} else {

			await $.getJSON('../candidate.json', function (data) {

				var candidateRow = $('#candidateRow');
				var candidateTemplate = $('#candidateTemplate');

				for (i = 0; i < data.length; i ++) {
					candidateTemplate.find('.panel-title').text(data[i].name);
					candidateTemplate.find('img').attr('src', data[i].picture);
					candidateTemplate.find('.age').text(data[i].age);
					candidateTemplate.find('.location').text(data[i].location);
					candidateTemplate.find('.btn-vote').attr('data-id', 
						data[i].eth_address);

					candidateRow.append(candidateTemplate.html());
				}

				$(document).find('.btn-add-candidate')
					.attr('style', 'visibility:hidden')
					.attr('disable', true);
			});

			/*
		If the addresses aren't in the candidates.json then bind them here.
		------------------------------Example------------------------------
					 $('.panel-candidate')
									 .eq(i)
										 .find('button')
										 .attr('data-id', candidates[i]);
		-------------------------------------------------------------------
		*/

			return App.checkVoted();
		}
	},


	// check if current account has voted
	checkVoted: async function () {

		await web3.eth.getAccounts(async (error, accounts) => {
			if (error) {
				console.log(error);
			}
			var account = accounts[0];

			var voteHandlingInstance = await App.contracts.VoteHandling.deployed();

			var hasVoted = await voteHandlingInstance.hasVoted.call(account);

			console.log('Account ' + account + ' has voted: ' + hasVoted);
			if (hasVoted) {
				// disable button
				$('.panel-candidate').find('button')
					.text('Collecting votes...')
					.attr('disabled', true);

				return App.showVotes();
			}
		});
	},


	showVotes: async function() {
		var voteHandlingInstance;
		var candidates;

		await $.getJSON('../candidate.json', function (data) {
			candidates = data;		
		});

		voteHandlingInstance = await App.contracts.VoteHandling.deployed();
		var votes = await voteHandlingInstance.getVotes.call();

		console.log('votes: ' + votes);
		console.log('candates.length = ' + candidates.length);

		for (i = 0; i < candidates.length; i++) {

			$('.panel-candidate').eq(i).find('button')
				.text('Votes: ' + votes[i]);
		}
	},


	handleVote: async function () {
		event.preventDefault();

		var candidateId = $(event.target).data('id');
		var voteHandlingInstance;

		await web3.eth.getAccounts(async (error, accounts) => {
			if (error) {
				console.log(error);
			}

			var account = accounts[0];

			voteHandlingInstance = await App.contracts.VoteHandling.deployed();

			console.log('Voting for candidate: ' + candidateId);

			await voteHandlingInstance.vote(candidateId, {from: account});
			return App.checkVoted();

		});
	}

};


$(function() {
	$(window).load(function() {
		App.init();
	});
});
