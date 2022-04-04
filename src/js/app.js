App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load canidates
    $.getJSON('../candidate.json', function(data) {
	  /*
      var candidateRow = $('#candidateRow');
      var candidateTemplate = $('#candidateTemplate');

      for (i = 0; i < data.length; i ++) {
        candidateTemplate.find('.panel-title').text(data[i].name);
        candidateTemplate.find('img').attr('src', data[i].picture);
        candidateTemplate.find('.age').text(data[i].age);
        candidateTemplate.find('.location').text(data[i].location);
        candidateTemplate.find('.btn-vote').attr('data-id', data[i].id);

        candidateRow.append(candidateTemplate.html());
      }*/
    });

    return await App.initWeb3();
  },

  initWeb3: async function() {
	// Modern dapp browsers
	if (window.ethereum) {
		App.web3Provider = window.ethereum;
		try {
			// request account access
			await window.ethereum.request({ method: "eth_requestAccounts"});
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

        candidateRow.append(candidateTemplate.html());
      }
	}).then(function () {

		web3.eth.getAccounts(function (error, accounts) {
			if (error) {
				console.log(error);
			}

			var accounts = accounts;

			for (i = 0; i < candidates.length; i++) {
				candidateList.push(accounts[candidates[i].acc_index]);
			}

			App.contracts.VoteHandling.deployed().then(function (instance) {
				voteHandlingInstance = instance;

				return voteHandlingInstance.addCandidateList(candidateList,
														{from: accounts[0]});	
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
		} else {
			for (i = 0; i < candidates.length; i++) {
				// bind candidate id to the vote button
        		$('.panel-candidate').eq(i).find('.button').attr('data-id', 
														candidates[i]);
			}
		}
	  }).then(function () {
		return App.checkVoted();
	  }).catch(function(err) {
		console.log(err.message);
	  });
  },

  // check if current account has voted
  checkVoted: function() {
	  var voteHandlingInstance;

	  web3.eth.getAccounts(function(error, _accounts) {
		if (error) {
			console.log(error);
		}
		var accounts = _accounts;
	  	App.contracts.VoteHandling.deployed().then(function(instance) {
			voteHandlingInstance = instance;
			return voteHandlingInstance.hasVoted(accounts[0]);
	  	}).then(function(hasVoted) {
			if (hasVoted) {
				// disable button
				$('.panel-candidate').find('button')
									 .text('Thank you for your vote')
									 .attr('disabled', true);
			}
	  	}).catch(function(err) {
			console.log(err);
	  	});
	  });
  },

  // call the vote function
  handleVote: function(event) {
    event.preventDefault();

    var candidateId = parseInt($(event.target).data('id'));
	var voteHandlingInstance;

	web3.eth.getAccounts(function(error, accounts) {
		if (error) {
			console.log(error);
		}

		var account = accounts[0];

		App.contracts.VoteHandling.deployed().then(function(instance) {
			voteHandlingInstance = instance;
			
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
