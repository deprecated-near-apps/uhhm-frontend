import React, { useContext, useEffect, useState } from 'react';

import { appStore, onAppMount } from './state/app';
import { getForOwner, getAll } from './state/near';
import { useHistory } from './utils/history';

import { Token } from './components/Token';

import './App.scss';

const PATH_SPLIT = '?c=';
const SUB_SPLIT = '&t=';
const numPerPage = 9;

const App = () => {
	const { state, dispatch, update } = useContext(appStore);
	const { contracts, app: { loading, snack } } = state;

	const [page, setPage] = useState(0);
	const [owner, setOwner] = useState('');
	const [path, setPath] = useState(window.location.href);
	useHistory(() => {
		setPath(window.location.href);
	});
	let contractIndex, contract, contractId, tokenId;
	let pathSplit = path.split(PATH_SPLIT)[1]?.split(SUB_SPLIT);
	if (contracts.length && pathSplit?.length > 0) {
		contractId = pathSplit[0];
		contractIndex = contracts.findIndex(({ id }) => id === contractId);
		contract = contracts[contractIndex];
		tokenId = pathSplit[1];
	}

	useEffect(() => dispatch(onAppMount()), []);
	useEffect(() => {
		if (!!contracts.length && path.indexOf(PATH_SPLIT) === -1) {
			const contract = contracts.find(({ tokens }) => tokens.length === Math.max(...contracts.map(({ tokens }) => tokens.length)));
			history.pushState({}, '', PATH_SPLIT + contract.id);
		}
		if (contract && !contract.tokens.length) {
			const contractWithTokens = contracts.find(({ tokens }) => tokens.length > 0);
			if (contractWithTokens) {
				history.pushState({}, '', PATH_SPLIT + contractWithTokens.id);
			}
		}
	}, [contracts]);

	const handleGetForOwner = async (e) => {
		if (e && e.keyCode !== 13) {
			return;
		}
		if (!owner.length) {
			return dispatch(snackAttack('Enter an owner accountId you want to check!'));
		}
		const result = await dispatch(getForOwner(owner));
		if (!result) {
			return setOwner('');
		}
	};

	const handleContract = (e) => {
		if (e.clientX > window.innerWidth * 0.75) {
			let nextIndex = contractIndex + 1;
			if (nextIndex === contracts.length) {
				nextIndex = 0;
			}
			history.pushState({}, '', PATH_SPLIT + contracts[nextIndex].id);
		} else if (e.clientX < window.innerWidth * 0.25) {
			let nextIndex = contractIndex - 1;
			if (nextIndex === -1) {
				nextIndex = contracts.length - 1;
			}
			history.pushState({}, '', PATH_SPLIT + contracts[nextIndex].id);
		} else {
			window.scrollTo(0, 0);
		}
	};

	return <>
		{
			tokenId &&
			<Token {...{ dispatch, contracts, contractId, tokenId }} />
		}
		{
			snack &&
			<div className="snack">
				{snack}
			</div>
		}

		<header>
			<h1>UHHM NFTs</h1>
			<h4>A Love Letter to Hip Hop</h4>
			{
				contract &&
				<div className="page-controls">
					<div onClick={() => setPage(page - 1)}>{ page !== 0 ? 'Prev' : ''}</div>
					<div onClick={() => setPage(page + 1)}>{ (page+1) * numPerPage <= contract.tokens.length ? 'Next' : ''}</div>
				</div>
			}
		</header>


		{
			contract && <div className="contract">
				
				<div className="tokens">
					{
						contract.tokens.slice(page * numPerPage, (page+1) * numPerPage).map(({
							displayTitle,
							token_id,
							displayFrag,
							displayHowLongAgo
						}) => {
							return <div key={token_id} onClick={() => history.pushState({}, '', PATH_SPLIT + contract.id + SUB_SPLIT + token_id)}>
								{displayFrag}
								<div className="token-detail">
									<div>{displayTitle}</div>
									<div className="time">Minted {displayHowLongAgo} ago</div>
								</div>
							</div>;
						})
					}
				</div>
			</div>
		}
	</>;
};

export default App;
