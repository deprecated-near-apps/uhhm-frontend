import { addFrag, tagToFrag } from './utils/react-helpers';
import { getTokens, getTokensForOwner } from './utils/api-helper';
import { contractId } from './utils/near-utils';

/// helpers for NFT Market example tokens
/// https://github.com/near-apps/nft-market

const getTokensNFTMarket = async (account, contract_id) => {
	const totalSupply = parseInt(await account.viewFunction(contract_id, 'nft_total_supply'));
	const tokens = await getTokens(contract_id, totalSupply);
	if (!tokens.length) {
		return [];
	}
	// get the right batch of tokens from the api-helper call
	const result = tokens[0];
	
	// add React fragment for displaying in gallery
	result.forEach((t) => {
		addFrag(t, t.metadata.media, 'img')
		t.displayVideo = tagToFrag('video', t.metadata.media)
	});
	return result; 
};

const getTokensForOwnerNFTMarket = async (account, contract_id, account_id) => {
	const totalSupply = await account.viewFunction(contract_id, 'nft_supply_for_owner', {
		account_id
	});
	const tokens = await getTokensForOwner(contract_id, account_id, totalSupply);
	if (!tokens.length) {
		return [];
	}
	// get the right batch of tokens from the api-helper call
	const result = tokens[0];
	// add React fragment for displaying in gallery
	result.forEach((t) => addFrag(t, t.metadata.media, 'img'));
	return result;
};

/// Begin contract specific handling here

const uhhmMarketId = contractId;
const uhhmMarket = {
	id: uhhmMarketId,
	name: 'UHHM NFTs',
	getTokens: (account) => getTokensNFTMarket(account, uhhmMarketId),
	getTokensForOwner: (account, account_id) => getTokensForOwnerNFTMarket(account, uhhmMarketId, account_id)
};

export const contracts = [
	uhhmMarket,
];