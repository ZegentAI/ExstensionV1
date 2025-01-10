import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from './logger.js';
import { tradingAnalystPrompt, twitterAnalystPrompt, contractAnalystPrompt } from './prompts.js';
import { getContractSource } from './etherscanService.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));

const API_KEY = process.env.CLAUDE_API_KEY;
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');

// Ensure screenshot directory exists
fs.mkdir(SCREENSHOT_DIR, { recursive: true }).catch(console.error);

// Simple in-memory store for IP tracking
const ipStore = new Map();

// Middleware for rate limiting
function rateLimiter(req, res, next) {
    const ip = req.ip;
    const now = Date.now();
    const dayStart = new Date(now).setHours(0, 0, 0, 0);

    if (!ipStore.has(ip)) {
        ipStore.set(ip, { count: 1, lastReset: dayStart });
    } else {
        const data = ipStore.get(ip);
        if (data.lastReset < dayStart) {
            data.count = 1;
            data.lastReset = dayStart;
        } else if (data.count >= 3) {
            const nextResetTime = new Date(dayStart + 24 * 60 * 60 * 1000);
            const minutesUntilReset = Math.ceil((nextResetTime - now) / (60 * 1000));
            
            let timeMessage;
            if (minutesUntilReset < 60) {
                timeMessage = `${minutesUntilReset} minute${minutesUntilReset !== 1 ? 's' : ''}`;
            } else {
                const hoursUntilReset = Math.ceil(minutesUntilReset / 60);
                timeMessage = `${hoursUntilReset} hour${hoursUntilReset !== 1 ? 's' : ''}`;
            }

            return res.status(429).json({
                error: 'Daily limit reached',
                message: `Degen You've reached the daily limit of 3 requests. Your limit will reset in approximately ${timeMessage}.`,
                requestsRemaining: 0,
                resetTime: nextResetTime.toISOString()
            });
        } else {
            data.count++;
        }
        ipStore.set(ip, data);
    }

    res.setHeader('X-RateLimit-Limit', '3');
    res.setHeader('X-RateLimit-Remaining', (3 - (ipStore.get(ip)?.count || 0)).toString());

    next();
}

app.use(rateLimiter);

async function saveScreenshot(tokenAddress, screenshotData) {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const filename = `${tokenAddress}_${timestamp}.png`;
    const filepath = path.join(SCREENSHOT_DIR, filename);

    try {
        await fs.writeFile(filepath, Buffer.from(screenshotData, 'base64'));
        logger.info(`Screenshot saved: ${filename}`);
        return filename;
    } catch (error) {
        logger.error('Error saving screenshot:', error);
        throw error;
    }
}

async function callClaudeAPI(systemPrompt, userContent) {
    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: "claude-3-sonnet-20240229",
                max_tokens: 1000,
                system: systemPrompt,
                messages: [
                    {
                        role: "user",
                        content: userContent
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Claude API error: ${response.status} - ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        logger.error('Error calling Claude API:', error);
        throw error;
    }
}

app.post('/analyze', async (req, res) => {
    logger.info('Received analyze request');
    const { tokenAddress, screenshotData } = req.body;

    if (!tokenAddress) {
        logger.error('No token address provided');
        return res.status(400).json({ error: 'No token address provided' });
    }

    let screenshotFilename;
    if (screenshotData) {
        try {
            screenshotFilename = await saveScreenshot(tokenAddress, screenshotData);
        } catch (error) {
            logger.warn('Failed to save screenshot, continuing with analysis');
        }
    }

    const userContent = [
        {
            type: "text",
            text: `Analyze the provided screenshot data for the token with address ${tokenAddress}. Calculate the final rating and provide your analysis in the exact format specified in the system prompt.`
        }
    ];

    if (screenshotData) {
        userContent.unshift({
            type: "image",
            source: {
                type: "base64",
                media_type: "image/png",
                data: screenshotData
            }
        });
    }

    try {
        logger.info('Calling Claude API for trading analysis...');
        const data = await callClaudeAPI(tradingAnalystPrompt, userContent);
        logger.info('Claude API response received for trading analysis');

        const responseWithScreenshot = {
            ...data,
            screenshotFilename: screenshotFilename || null
        };

        res.json(responseWithScreenshot);
    } catch (error) {
        logger.error('Server Error:', error);
        res.status(500).json({ 
            error: 'An error occurred while processing the trading analysis request', 
            details: error.message
        });
    }
});

app.post('/twitter/analyze', async (req, res) => {
    const { tokenAddress, tweets } = req.body;

    if (!tokenAddress || !tweets || !Array.isArray(tweets)) {
        return res.status(400).json({ error: 'Invalid request body' });
    }

    try {
        const twitterData = {
            tokenAddress,
            tweetCount: tweets.length,
            tweets: tweets.map(tweet => ({
                text: tweet.text,
                likes: tweet.likes,
                retweets: tweet.retweets
            }))
        };

        const userContent = `
Token Address: ${tokenAddress}
Number of Tweets: ${twitterData.tweetCount}

Tweets:
${twitterData.tweets.map((tweet, index) => `
${index + 1}. Text: ${tweet.text}
   Likes: ${tweet.likes}
   Retweets: ${tweet.retweets}
`).join('\n')}

Please analyze this Twitter data for the given token.
`;

        logger.info('Calling Claude API for Twitter analysis...');
        const analysisData = await callClaudeAPI(twitterAnalystPrompt, userContent);
        logger.info('Claude API response received for Twitter analysis');

        res.json(analysisData);
    } catch (error) {
        logger.error('Twitter Analysis Error:', error);
        res.status(500).json({ error: 'Failed to analyze Twitter data' });
    }
});

app.get('/etherscan/contract/:tokenAddress', async (req, res) => {
    const { tokenAddress } = req.params;
    
    try {
        const contractSource = await getContractSource(tokenAddress);
        
        if (!contractSource) {
            return res.status(404).json({ error: 'Contract source not found' });
        }

        logger.info('Calling Claude API for contract analysis...');
        const analysisData = await callClaudeAPI(contractAnalystPrompt, contractSource);
        logger.info('Claude API response received for contract analysis');

        res.json(analysisData);
    } catch (error) {
        logger.error('Etherscan Contract Analysis Error:', error);
        res.status(500).json({ error: 'Failed to analyze contract', details: error.message });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});

app.listen(port, () => {
    logger.info(`Zegent server running at http://localhost:${port}`);
});