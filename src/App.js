import React, { useContext, useEffect, useState } from 'react';

import { appStore, onAppMount } from './state/app';
import { getForOwner, getAll } from './state/near';
import { useHistory } from './utils/history';

import { Token } from './components/Token';
import Logo from 'url:./img/logo.png';

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
      <img src={Logo} alt="UHHM Logo" />
      <div className="heading">
        <h2>A Love Letter to</h2>
        <h2 className="heading-emphasized">Hip Hop</h2>
      </div>
			<h4>Hip Hop Heads First Edition - #1 of 47 (limited for each series)</h4>
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
                <div className="img-container">
								  {displayFrag}
                </div>

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

    <footer>
      {
				contract &&
				<div className="page-controls">
					<div className="fake-button" style={{visibility: page !== 0 ? 'visible' : 'hidden' }} onClick={() => {window.scrollTo(0, 0); if (page !== 0) setPage(page - 1)}}>Prev</div>
					<div>{ page+1 } / {Math.floor(contract.tokens.length / numPerPage) + 1}</div>
					<div className="fake-button" style={{visibility: page+1 < Math.floor(contract.tokens.length / numPerPage) + 1 ? 'visible' : 'hidden' }} onClick={() => {window.scrollTo(0, 0); if (page+1 < Math.floor(contract.tokens.length / numPerPage) + 1) setPage(page + 1)}}>Next</div>
				</div>
			}
      <div className="credit"><a href="https://near.org" target="_blank">
        Built on
        <svg width="99" height="26" viewBox="0 0 99 26" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clipPath="url(#clip0)">
<path d="M49.5609 5.41637V20.583C49.5602 20.6402 49.5371 20.6949 49.4965 20.7354C49.456 20.7759 49.4012 20.7989 49.3438 20.7997H47.7633C47.4005 20.8 47.0435 20.7094 46.7249 20.5363C46.4062 20.3632 46.1363 20.113 45.9396 19.8088L38.7664 8.74436L39.0125 14.2708V20.583C39.0117 20.6402 38.9886 20.6949 38.9481 20.7354C38.9075 20.7759 38.8527 20.7989 38.7954 20.7997H36.7054C36.648 20.7989 36.5933 20.7759 36.5527 20.7354C36.5121 20.6949 36.489 20.6402 36.4883 20.583V5.41637C36.489 5.35914 36.5121 5.30447 36.5527 5.26399C36.5933 5.22352 36.648 5.20046 36.7054 5.19971H38.2772C38.6396 5.1999 38.9962 5.29036 39.3146 5.46289C39.6331 5.63542 39.9034 5.88455 40.1009 6.1877L47.2741 17.2348L47.0512 11.7286V5.41637C47.0512 5.35891 47.0741 5.3038 47.1148 5.26317C47.1555 5.22253 47.2107 5.19971 47.2683 5.19971H49.3583C49.4131 5.20403 49.4643 5.22867 49.5018 5.26877C49.5393 5.30887 49.5604 5.36153 49.5609 5.41637V5.41637Z" fill="white"/>
<path d="M70.9208 20.7998H68.7092C68.6746 20.7994 68.6407 20.7909 68.6101 20.7748C68.5795 20.7587 68.5532 20.7356 68.5334 20.7073C68.5136 20.6791 68.5008 20.6465 68.4961 20.6123C68.4915 20.5782 68.495 20.5434 68.5066 20.5109L74.3655 5.40779C74.3906 5.34455 74.4346 5.29061 74.4916 5.25337C74.5487 5.21612 74.6158 5.19741 74.6839 5.19979H77.4542C77.5198 5.20035 77.5838 5.22045 77.638 5.2575C77.6921 5.29455 77.734 5.34688 77.7581 5.40779L83.5997 20.5109C83.6112 20.5434 83.6148 20.5782 83.6101 20.6123C83.6055 20.6465 83.5927 20.6791 83.5729 20.7073C83.5531 20.7356 83.5268 20.7587 83.4962 20.7748C83.4656 20.7909 83.4316 20.7994 83.3971 20.7998H81.1855C81.1412 20.8 81.098 20.7868 81.0613 20.7621C81.0246 20.7374 80.9963 20.7021 80.98 20.6611L76.2587 8.23889C76.2435 8.19706 76.2157 8.16093 76.1792 8.13539C76.1427 8.10985 76.0992 8.09615 76.0546 8.09615C76.01 8.09615 75.9665 8.10985 75.93 8.13539C75.8935 8.16093 75.8657 8.19706 75.8505 8.23889L71.1292 20.6611C71.1127 20.7026 71.0839 20.7381 71.0467 20.7629C71.0095 20.7877 70.9655 20.8005 70.9208 20.7998V20.7998Z" fill="white"/>
<path d="M98.9539 20.4501L94.5597 14.8486C97.0405 14.3806 98.4907 12.7108 98.4907 10.1484C98.4907 7.20459 96.5715 5.19971 93.176 5.19971H87.0478C86.9619 5.19971 86.8794 5.2338 86.8186 5.29447C86.7578 5.35515 86.7236 5.43745 86.7236 5.52326V5.52326C86.7236 5.79641 86.7775 6.06688 86.8823 6.31924C86.987 6.5716 87.1405 6.8009 87.3341 6.99404C87.5276 7.18719 87.7574 7.3404 88.0102 7.44493C88.2631 7.54946 88.5341 7.60326 88.8078 7.60326H92.9213C94.9736 7.60326 95.9578 8.65192 95.9578 10.1657C95.9578 11.6795 94.9968 12.7657 92.9213 12.7657H87.0478C86.9616 12.7665 86.8791 12.8012 86.8184 12.8623C86.7577 12.9235 86.7236 13.0061 86.7236 13.0921V20.6032C86.7236 20.6607 86.7465 20.7158 86.7872 20.7564C86.8279 20.7971 86.8832 20.8199 86.9407 20.8199H89.0307C89.0881 20.8191 89.1429 20.7961 89.1834 20.7556C89.224 20.7151 89.2471 20.6605 89.2478 20.6032V14.9844H91.6592L95.4715 19.9503C95.6757 20.2161 95.9388 20.431 96.2401 20.5784C96.5414 20.7257 96.8728 20.8015 97.2084 20.7997H98.7947C98.8343 20.7975 98.8725 20.7845 98.9052 20.7622C98.9379 20.7399 98.9639 20.709 98.9803 20.673C98.9967 20.637 99.0029 20.5972 98.9983 20.5579C98.9936 20.5186 98.9783 20.4813 98.9539 20.4501Z" fill="white"/>
<path d="M64.3125 5.19971H54.6152C54.5384 5.19971 54.4648 5.23014 54.4105 5.28432C54.3562 5.3385 54.3257 5.41198 54.3257 5.4886C54.3257 6.0502 54.5492 6.58881 54.9472 6.98593C55.3451 7.38305 55.8848 7.60615 56.4475 7.60615H64.3125C64.3411 7.60654 64.3695 7.6012 64.3961 7.59045C64.4226 7.57969 64.4467 7.56375 64.4669 7.54355C64.4871 7.52335 64.5031 7.49931 64.5139 7.47285C64.5247 7.44639 64.53 7.41804 64.5296 7.38948V5.41637C64.5296 5.35891 64.5068 5.3038 64.466 5.26317C64.4253 5.22253 64.3701 5.19971 64.3125 5.19971ZM64.3125 18.3932H57.0757C57.0183 18.3925 56.9635 18.3694 56.923 18.3289C56.8824 18.2885 56.8593 18.2338 56.8586 18.1766V14.265C56.8586 14.2076 56.8814 14.1524 56.9222 14.1118C56.9629 14.0712 57.0181 14.0484 57.0757 14.0484H63.7654C63.823 14.0484 63.8782 14.0255 63.9189 13.9849C63.9597 13.9443 63.9825 13.8892 63.9825 13.8317V11.8441C63.9825 11.7867 63.9597 11.7316 63.9189 11.6909C63.8782 11.6503 63.823 11.6275 63.7654 11.6275H54.6499C54.5636 11.6282 54.4812 11.663 54.4205 11.7241C54.3597 11.7852 54.3257 11.8678 54.3257 11.9539V20.4646C54.3257 20.5504 54.3598 20.6327 54.4206 20.6934C54.4814 20.754 54.5639 20.7881 54.6499 20.7881H64.3125C64.3701 20.7881 64.4253 20.7653 64.466 20.7247C64.5068 20.684 64.5296 20.6289 64.5296 20.5715V18.5983C64.5274 18.5427 64.5034 18.4901 64.4629 18.4517C64.4223 18.4134 64.3684 18.3924 64.3125 18.3932Z" fill="white"/>
<path d="M20.9116 1.32003L15.4637 9.38868C15.3754 9.50514 15.3346 9.65064 15.3494 9.79591C15.3643 9.94118 15.4337 10.0755 15.5437 10.1717C15.6538 10.268 15.7963 10.3191 15.9425 10.3148C16.0888 10.3105 16.228 10.251 16.3321 10.1485L21.6932 5.52624C21.7241 5.49796 21.7626 5.47934 21.804 5.47272C21.8454 5.46609 21.8879 5.47174 21.9261 5.48897C21.9643 5.5062 21.9966 5.53424 22.019 5.56962C22.0414 5.60501 22.0529 5.64617 22.0521 5.68802V20.2162C22.0517 20.2603 22.0378 20.3032 22.0122 20.3392C21.9867 20.3753 21.9507 20.4026 21.9092 20.4177C21.8677 20.4328 21.8225 20.4348 21.7798 20.4236C21.737 20.4124 21.6987 20.3884 21.67 20.3549L5.45947 0.999363C5.20068 0.688628 4.87692 0.438146 4.51088 0.265478C4.14484 0.0928092 3.74539 0.00213458 3.34053 -0.000189913H2.77605C2.0398 -0.000189913 1.3337 0.291695 0.813087 0.811253C0.292476 1.33081 0 2.03548 0 2.77025V23.2293C0 23.9641 0.292476 24.6688 0.813087 25.1883C1.3337 25.7079 2.0398 25.9998 2.77605 25.9998V25.9998C3.25045 25.9997 3.71691 25.8783 4.13093 25.6472C4.54496 25.4161 4.89273 25.0829 5.14105 24.6795L10.5889 16.6109C10.6772 16.4944 10.718 16.3489 10.7032 16.2037C10.6883 16.0584 10.6189 15.9241 10.5089 15.8278C10.3989 15.7316 10.2564 15.6805 10.1101 15.6848C9.96386 15.6891 9.82466 15.7485 9.72053 15.8511L4.35947 20.4733C4.32856 20.5016 4.29001 20.5202 4.24861 20.5268C4.2072 20.5335 4.16475 20.5278 4.12653 20.5106C4.08831 20.4934 4.05599 20.4653 4.0336 20.4299C4.0112 20.3946 3.9997 20.3534 4.00053 20.3115V5.7978C4.00096 5.75369 4.01488 5.71076 4.04041 5.67476C4.06595 5.63876 4.10189 5.61139 4.14343 5.59631C4.18497 5.58124 4.23012 5.57918 4.27287 5.5904C4.31561 5.60163 4.35391 5.62561 4.38263 5.65913L20.5932 25.0146C20.8539 25.3226 21.1789 25.57 21.5454 25.7397C21.9118 25.9093 22.311 25.9971 22.715 25.9969H23.2939C23.6585 25.9969 24.0195 25.9252 24.3563 25.786C24.6931 25.6468 24.9991 25.4427 25.2569 25.1854C25.5147 24.9282 25.7192 24.6228 25.8587 24.2866C25.9982 23.9505 26.07 23.5902 26.07 23.2264V2.77025C26.07 2.40497 25.9976 2.04329 25.857 1.70603C25.7164 1.36877 25.5104 1.06259 25.2508 0.805099C24.9912 0.547612 24.6831 0.343906 24.3443 0.205702C24.0055 0.0674978 23.6426 -0.00247531 23.2766 -0.000189913V-0.000189913C22.8022 -0.000133115 22.3357 0.121247 21.9217 0.352369C21.5077 0.58349 21.1599 0.91664 20.9116 1.32003Z" fill="white"/>
</g>
<defs>
<clipPath id="clip0">
<rect width="99" height="26" fill="white" transform="translate(0 -0.000244141)"/>
</clipPath>
</defs>
</svg>
</a>
      </div>
    </footer>
	</>;
};

export default App;
