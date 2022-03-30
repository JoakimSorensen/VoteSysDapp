App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load pets.
    $.getJSON('../candidate.json', function(data) {
      var candidateRow = $('#candidateRow');
      var candidateTemplate = $('#candidateTemplate');

      for (i = 0; i < data.length; i ++) {
        candidateTemplate.find('.panel-title').text(data[i].name);
        candidateTemplate.find('img').attr('src', data[i].picture);
        candidateTemplate.find('.age').text(data[i].age);
        candidateTemplate.find('.location').text(data[i].location);
        candidateTemplate.find('.btn-vote').attr('data-id', data[i].id);

        candidateRow.append(candidateTemplate.html());
      }
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

		// use contract to retrieve candidates
		return App.markAdopted();
	
	});
    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
  },

  markAdopted: function() {
	  var voteHandlingInstance;

	  App.contracts.VoteHandling.deployed().then(function(instance) {
		voteHandlingInstance = instance;
		return voteHandlingInstance.getCandidates.call();
	  }).then(function(candidates) {
		for (i = 0; i < candidates.length; i++) {
			// update candidates here
			continue;
		}
	  }).catch(function(err) {
		console.log(err.message);
	  });
  },

  // to be handleVote, call the vote function
  handleAdopt: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    /*
     * Replace me...
     */
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
