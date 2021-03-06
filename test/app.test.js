
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

jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;

const deployNum = 9;

describe('deploy contract ' + contractName, () => {

	const contract_royalty = 0;

	/// contractAccount.accountId is the NFT contract and contractAccount is the owner
	/// see initContract in ./test-utils.js for details
	const contractId = contractAccount.accountId;
	console.log('\n\n contractId:', contractId, '\n\n');

	let alice, aliceId, bob, bobId;

	const tokens = data.map(({ token_type, metadata }) => ({
		token_type,
		token_id: token_type + ':1',
		metadata: {
			...metadata,
			issued_at: Date.now().toString(),
		},
		perpetual_royalties: {
			'escrow-42.uhhm.near': 1000,
			'uhhm.near': 100,
			'andreleroydavis.near': 200,
			'edyoung.near': 200,
		}
	}));


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

		for (let i = 0; i < deployNum; i++) {
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