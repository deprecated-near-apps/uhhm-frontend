
const nearAPI = require('near-api-js');
const testUtils = require('./test-utils');
const getConfig = require('../src/config');
const {data} = require('../src/tokens');

const { 
	utils: { format: { parseNearAmount }},
} = nearAPI;
const { 
	initContract, getAccount, contractAccount, contractName,
} = testUtils;
const { 
	GAS
} = getConfig();

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

const deployNum = 103;

describe('deploy contract ' + contractName, () => {

	const contract_royalty = 500;

	/// contractAccount.accountId is the NFT contract and contractAccount is the owner
	/// see initContract in ./test-utils.js for details
	const contractId = contractAccount.accountId;
	console.log('\n\n contractId:', contractId, '\n\n');

	let alice, aliceId, bob, bobId;

	const tokens = data.slice(0, deployNum).map(({ token_type, metadata }) => ({
		token_type,
		token_id: token_type + ':1',
		metadata: {
			...metadata,
			issued_at: Date.now().toString(),
		},
		perpetual_royalties: {
			[contractId]: 500
		}
	}));

	/// most of the following code in beforeAll can be used for deploying and initializing contracts
	/// skip all tests if you want to deploy to production or testnet without any NFTs
	beforeAll(async () => {
	    await initContract();

		const t = Date.now(); 
		aliceId = 'alice-' + t + '.' + contractId;
		alice = await getAccount(aliceId);
		console.log('\n\n Alice accountId:', aliceId, '\n\n');

		bobId = 'bob-' + t + '.' + contractId;
		bob = await getAccount(bobId);
		console.log('\n\n Bob accountId:', bobId, '\n\n');

		await contractAccount.functionCall({
			contractId: contractName,
			methodName: 'set_contract_royalty',
			args: { contract_royalty },
			gas: GAS
		});
		
		// token types and caps
		const supply_cap_by_type = tokens.map(({ token_type }) => ({
			[token_type]: '47'
		})).reduce((a, c) => ({ ...a, ...c }), {});

		console.log('\n\n', supply_cap_by_type, '\n\n');

		await contractAccount.functionCall({
			contractId,
			methodName: 'add_token_types',
			args: { supply_cap_by_type },
			gas: GAS
		});

	});

	test('NFT contract owner mints 5 nfts (of type: 3,2)', async () => {

		for (let i = 0; i < tokens.length; i++) {
			await contractAccount.functionCall({
				contractId,
				methodName: 'nft_mint',
				args: tokens[i],
				gas: GAS,
				attachedDeposit: parseNearAmount('1')
			});
		}
		
	});

});