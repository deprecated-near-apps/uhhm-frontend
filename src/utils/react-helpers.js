import React from 'react';
import { howLongAgo } from './date';

const GATEWAY_BASE = 'https://cloudflare-ipfs.com/ipfs/';
const DWEB_BASE = 'http://dweb.link/ipfs/';
const LOW_RES_GIF = '/low-res.gif';
const VIDEO = '/1.m4v';

const resolveImageError = (el, src) => {
	console.warn(`IMAGE ERROR: ${src} was unable to display properly in an img tag`);
	el.classList.add('removed');
};

export const tagToFrag = (tag, src, ...args) => {
	switch (tag) {
		case 'img': return <img
			src={GATEWAY_BASE + src + LOW_RES_GIF}
			onError={(e) => resolveImageError(e.target, src, ...args)}
		/>;
		case 'video': return <video
			src={DWEB_BASE + src + VIDEO}
			autoPlay={true} loop={true} preload="auto"
		/>;
	}
};

// this mut the token object, adding a React Fragment to it
export const addFrag = (token, media, tag) => {
	token.displayTitle = token.token_type;
	token.displayHowLongAgo = howLongAgo(token.metadata.issued_at, 'hour');
	token.displayTag = tag;
	token.displayFrag = tagToFrag(tag, media);
};