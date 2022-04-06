App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    return await App.initWeb3();
  },

  initWeb3: async function() {
	// Modern dapp browsers
	var Web3 = require("web3");
	if (window.ethereum) {
		App.web3Provider = window.ethereum;
		try {
			// request account access
			await window.ethereum.request({ method: "eth_requestAccounts"});
			console.log('the very first acc: ' + acc);
		} catch (error) {
			console.error("User denied access");
		}
	} else if (window.web3) {
	// Legacy dapp browsers
	App.web3Provider = window.web3.currentProvider;
	} else {
	// if no injected web3 instance is detected, fall back to develop network
		App.web3Provider = new Web3.providers.HttpProvider("http://localhost:8545");
	}

	

	web3 = new Web3(App.web3Provider);
    return App.initContract();
  },

  initContract: function() {
	$.getJSON('VoteHandling.json', function (data) {
		// Get the necessary contract artifact file and instantiate it 
		// with @truffle/contract
		var VoteHandlingArtifact = data;
		App.contracts.VoteHandling = TruffleContract(VoteHandlingArtifact);

		// set provider for contract
		App.contracts.VoteHandling.setProvider(App.web3Provider);

		// use contract to add candidate(s)
		return App.addCandidate();
	
	});
    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-vote', App.handleVote);
  },

  // TODO: Move this to a button!
  addCandidate: function () {
	var candidates;
	var candidateList = [];
	
   	$.getJSON('../candidate.json', function (data) {
	
	  candidates = data;		
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
	}).then(function () {

		console.log(web3.eth.accounts);
		web3.eth.getAccounts(function (error, accounts) {
			if (error) {
				console.log(error);
			}

			var account = accounts[0];// only returns current selected

			for (i = 0; i < candidates.length; i++) {
				console.log('Adding candidate ' + candidates[i].eth_address);
				candidateList.push(candidates[i].eth_address);
			}

			App.contracts.VoteHandling.deployed().then(function (instance) {
				voteHandlingInstance = instance;
				console.log('adding candidate list ' + candidateList);

				return voteHandlingInstance.addCandidateList(candidateList,
														{from: account});	
			}).then(function(result) {
				return App.getContractCandidates();
			}).catch(function(err) {
				console.log(err);
			});
		});
	});
  },


  getContractCandidates: function () {
	  var voteHandlingInstance;
      var candidateRow = $('#candidateRow');
      var candidateTemplate = $('#candidateTemplate');


	  App.contracts.VoteHandling.deployed().then(function(instance) {
		voteHandlingInstance = instance;
		return voteHandlingInstance.getCandidates.call();
	  }).then(function(candidates) {
		if (candidates.length == 0) {
			console.log("Couldn't retrieve candidates");
		} 
		console.log("candidates retrieved from contract: " + candidates);
	
		// If the addresses aren't in the candidates.json then bind them here.
		// Example below:
       		// $('.panel-candidate').eq(i)
			// .find('button').attr('data-id', candidates[i]);

	  }).then(function () {
		return App.checkVoted();
	  }).catch(function(err) {
		console.log(err.message);
	  });
  },

  // check if current account has voted
  checkVoted: function() {
	  var voteHandlingInstance;

	  web3.eth.getAccounts(function(error, accounts) {
		if (error) {
			console.log(error);
		}
		var account = accounts[0];
	  	App.contracts.VoteHandling.deployed().then(function(instance) {
			voteHandlingInstance = instance;
			return voteHandlingInstance.hasVoted.call(accounts);
	  	}).then(function(hasVoted) {
			console.log('Account ' + account + ' has voted: ' + hasVoted);
			if (hasVoted) {
				// disable button
				$('.panel-candidate').find('button')
									 .text('Collecting votes...')
									 .attr('disabled', true);
				return App.showVotes();
			}
	  	}).catch(function(err) {
			console.log(err);
	  	});
	  });
  },

  showVotes: function() {
	var voteHandlingInstance;
	var candidates;

   	$.getJSON('../candidate.json', function (data) {
		candidates = data;		
	}).then(function() {

		App.contracts.VoteHandling.deployed().then(function(instance) {
			voteHandlingInstance = instance;
			return voteHandlingInstance.getVotes.call();
		}).then(function(_votes) {
			var votes = _votes;
			console.log('votes: ' + votes);
			console.log('candates.length = ' + candidates.length);
			for (i = 0; i < candidates.length; i++) {
				/*TODO: For some reason the vote array is acting strange here.
						Normal during testing and in the contract, 
						but needs fix.*/
				var j = candidates.length - 1 - i;  
				if (votes[j] == '') {votes[j] = '0';}

        		$('.panel-candidate').eq(i).find('button')
										   .text('Votes: ' + votes[j]);
			}
		}).catch(function(err) {
			console.log(err);
		});
	});
  },

  // call the vote function
  handleVote: function(event) {
    event.preventDefault();

    var candidateId = $(event.target).data('id');
	var voteHandlingInstance;

	web3.eth.getAccounts(function(error, accounts) {
		if (error) {
			console.log(error);
		}

		var account = accounts[0];

		App.contracts.VoteHandling.deployed().then(function(instance) {
			voteHandlingInstance = instance;
			console.log('Voting for candidate: ' + candidateId);
			
			return voteHandlingInstance.vote(candidateId, {from: account});
		}).then(function() {
			return App.checkVoted();
		}).catch(function(err) {
			console.log(err.message);
		});

	});

  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
