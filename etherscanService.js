import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { logger } from './logger.js';

dotenv.config();

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const ETHERSCAN_API_URL = 'https://api.etherscan.io/api';

// Simple rate limiter
const MIN_REQUEST_INTERVAL = 200; // milliseconds
let lastRequestTime = 0;

async function makeEtherscanRequest(endpoint, params) {
    // Implement rate limiting
    const now = Date.now();
    const timeToWait = Math.max(0, MIN_REQUEST_INTERVAL - (now - lastRequestTime));
    if (timeToWait > 0) {
        await new Promise(resolve => setTimeout(resolve, timeToWait));
    }
    lastRequestTime = Date.now();

    const url = new URL(ETHERSCAN_API_URL);
    url.search = new URLSearchParams({
        ...params,
        apikey: ETHERSCAN_API_KEY
    }).toString();

    logger.info(`Making Etherscan API request: ${url.toString().replace(ETHERSCAN_API_KEY, 'API_KEY')}`);

    const response = await fetch(url);
    
    if (!response.ok) {
        logger.error(`HTTP error from Etherscan API: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status !== '1') {
        logger.error(`Etherscan API error: ${JSON.stringify(data)}`);
        throw new Error(`Etherscan API error: ${data.message || data.result}`);
    }
    
    logger.info(`Successful Etherscan API response for ${params.action}`);
    return data.result;
}

export async function getTokenInfo(tokenAddress) {
    try {
        // First, try to get the token name and symbol from the contract ABI
        const abiResponse = await fetch(`${ETHERSCAN_API_URL}?module=contract&action=getabi&address=${tokenAddress}&apikey=${ETHERSCAN_API_KEY}`);
        const abiData = await abiResponse.json();
        
        if (abiData.status === '1') {
            const abi = JSON.parse(abiData.result);
            const nameFunction = abi.find(item => item.name === 'name' && item.type === 'function');
            const symbolFunction = abi.find(item => item.name === 'symbol' && item.type === 'function');
            
            if (nameFunction && symbolFunction) {
                // If we found name and symbol functions, we can assume it's an ERC-20 token
                return {
                    tokenName: 'ERC-20 Token',
                    symbol: 'Token',
                    contractAddress: tokenAddress
                };
            }
        }
        
        // If we couldn't get the info from the ABI, return a generic response
        return {
            tokenName: 'Unknown Token',
            symbol: 'UNK',
            contractAddress: tokenAddress
        };
    } catch (error) {
        logger.error(`Error fetching token info for address ${tokenAddress}:`, error);
        throw error;
    }
}

export async function getTokenHolders(tokenAddress) {
    // Since we can't access the token holder list without a Pro API, 
    // we'll return a message indicating this limitation
    return {
        message: "Token holder information requires Etherscan API Pro subscription",
        contractAddress: tokenAddress
    };
}

export async function getLatestTransactions(tokenAddress, limit = 10) {
    try {
        return await makeEtherscanRequest('', {
            module: 'account',
            action: 'tokentx',
            contractaddress: tokenAddress,
            sort: 'desc',
            limit: limit
        });
    } catch (error) {
        logger.error(`Error fetching latest transactions for address ${tokenAddress}:`, error);
        throw error;
    }
}

export async function getContractSource(tokenAddress) {
    try {
        const data = await makeEtherscanRequest('', {
            module: 'contract',
            action: 'getsourcecode',
            address: tokenAddress
        });

        if (data && data.length > 0 && data[0].SourceCode) {
            return data[0].SourceCode;
        } else {
            logger.warn(`No source code found for address ${tokenAddress}`);
            return null;
        }
    } catch (error) {
        logger.error(`Error fetching contract source for address ${tokenAddress}:`, error);
        throw error;
    }
}