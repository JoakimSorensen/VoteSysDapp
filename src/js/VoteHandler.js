export {addCandidate, getContractCandidates, 
				checkVoted, showVotes, handleVote};

async function addCandidate(event) {

	/* For easy testing, this functionality is
		 supposed to be on admin page or similar */

	const contract = event.data.contract;
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

		for (var i = 0; i < candidates.length; i++) {
			console.log('Adding candidate ' + candidates[i].eth_address);
			candidateList.push(candidates[i].eth_address);
		}

		var voteHandlingInstance = await contract.deployed();

		console.log('adding candidate list ' + candidateList);

		await voteHandlingInstance.addCandidateList(candidateList,
			{from: account});	

		return getContractCandidates(contract);
	});
} 


async function getContractCandidates(contract) {
	var voteHandlingInstance;

	voteHandlingInstance = await contract.deployed();

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

			for (var i = 0; i < data.length; i ++) {
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

		return checkVoted(contract);
	}
}


// check if current account has voted
async function checkVoted(contract) {

	await web3.eth.getAccounts(async (error, accounts) => {
		if (error) {
			console.log(error);
		}
		var account = accounts[0];

		var voteHandlingInstance = await contract.deployed();

		var hasVoted = await voteHandlingInstance.hasVoted.call(account);

		console.log('Account ' + account + ' has voted: ' + hasVoted);
		if (hasVoted) {
			// disable button
			$('.panel-candidate').find('button')
				.text('Collecting votes...')
				.attr('disabled', true);

			return showVotes(contract);
		}
	});
}


async function showVotes(contract) {
	var voteHandlingInstance;
	var candidates;

	await $.getJSON('../candidate.json', function (data) {
		candidates = data;		
	});

	voteHandlingInstance = await contract.deployed();
	var votes = await voteHandlingInstance.getVotes.call();

	console.log('votes: ' + votes);
	console.log('candates.length = ' + candidates.length);

	for (var i = 0; i < candidates.length; i++) {

		$('.panel-candidate').eq(i).find('button')
			.text('Votes: ' + votes[i]);
	}
}


async function handleVote(event) {
	console.log("getting contract..")
	const contract = event.data.contract;
	var candidateId = $(this).data('id');
	console.log("getting candidate id..")

	//var candidateId = event.data.id;
	var voteHandlingInstance;

	await web3.eth.getAccounts(async (error, accounts) => {
		if (error) {
			console.log(error);
		}

		var account = accounts[0];

		voteHandlingInstance = await contract.deployed();

		console.log('Voting for candidate: ' + candidateId);

		await voteHandlingInstance.vote(candidateId, {from: account});
		return checkVoted(contract);

	});
}

