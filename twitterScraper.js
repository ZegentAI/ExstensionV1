// twitterScraper.js

console.log('Twitter scraper content script loaded');

function extractTweetInfo(tweet) {
    const text = tweet.querySelector('div[data-testid="tweetText"]')?.innerText || '';
    const likes = tweet.querySelector('div[data-testid="like"]')?.getAttribute('aria-label')?.match(/\d+/)?.[0] || '0';
    const retweets = tweet.querySelector('div[data-testid="retweet"]')?.getAttribute('aria-label')?.match(/\d+/)?.[0] || '0';
    return { text, likes: parseInt(likes), retweets: parseInt(retweets) };
}

function scrapeTweets(count = 66) {
    console.log(`Scraping ${count} tweets`);
    const tweets = [];
    let lastTweetCount = 0;

    return new Promise((resolve) => {
        function scrollAndCollect() {
            const tweetElements = document.querySelectorAll('article[data-testid="tweet"]');
            tweetElements.forEach((tweetElement) => {
                if (!tweets.some(t => t.text === tweetElement.innerText)) {
                    tweets.push(extractTweetInfo(tweetElement));
                }
            });

            if (tweets.length >= count || tweets.length === lastTweetCount) {
                console.log(`Scraped ${tweets.length} tweets`);
                resolve(tweets.slice(0, count));
            } else {
                lastTweetCount = tweets.length;
                window.scrollTo(0, document.body.scrollHeight);
                setTimeout(scrollAndCollect, 1000);
            }
        }

        scrollAndCollect();
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Received message:', request);
    if (request.action === 'scrapeTweets') {
        scrapeTweets().then(tweets => {
            sendResponse({ tweets });
        });
        return true; // Indicates that the response will be sent asynchronously
    }
});