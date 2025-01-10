// etherscanAgent.js

const ETHERSCAN_API_KEY = 'YOUR_ETHERSCAN_API_KEY'; // Replace with your actual API key

async function getTokenInfo(tokenAddress) {
    const url = `https://api.etherscan.io/api?module=token&action=tokeninfo&contractaddress=${tokenAddress}&apikey=${ETHERSCAN_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Failed to fetch token info from Etherscan');
    }
    return await response.json();
}

async function getTokenHolders(tokenAddress) {
    const url = `https://api.etherscan.io/api?module=token&action=tokenholderlist&contractaddress=${tokenAddress}&apikey=${ETHERSCAN_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Failed to fetch token holders from Etherscan');
    }
    return await response.json();
}

export async function analyzeWithEtherscanAgent(tokenAddress) {
    try {
        const [tokenInfo, tokenHolders] = await Promise.all([
            getTokenInfo(tokenAddress),
            getTokenHolders(tokenAddress)
        ]);

        if (tokenInfo.status !== '1' || tokenHolders.status !== '1') {
            throw new Error('Etherscan API returned an error');
        }

        const info = tokenInfo.result[0];
        const holders = tokenHolders.result.length;

        return `Etherscan analysis for ${tokenAddress}:
            
Token Name: ${info.tokenName}
Symbol: ${info.symbol}
Total Supply: ${info.totalSupply}
Decimals: ${info.divisor}
Holders: ${holders}
Contract Verified: ${info.isVerified === '1' ? 'Yes' : 'No'}`;

    } catch (error) {
        console.error('Etherscan analysis error:', error);
        throw new Error('Failed to analyze with Etherscan Agent');
    }
}