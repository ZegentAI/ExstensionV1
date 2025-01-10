document.addEventListener('DOMContentLoaded', function() {
    const tokenAddressInput = document.getElementById('tokenAddress');
    const analyzeButton = document.getElementById('analyzeButton');
    const fetchEtherscanDataButton = document.getElementById('fetchEtherscanData');
    const scrapeTwitterButton = document.getElementById('scrapeTwitterButton');
    const statusDiv = document.getElementById('status');
    const resultDiv = document.getElementById('result');
    const agentTabs = document.querySelectorAll('.agent-tab');
    const agentContents = document.querySelectorAll('.agent-content');
    const analyzeContractButton = document.getElementById('analyzeContractButton');

    // Agent tab switching
    agentTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            agentTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const agent = tab.dataset.agent;
            agentContents.forEach(content => {
                content.classList.add('hidden');
                if (content.id === `${agent}Agent`) {
                    content.classList.remove('hidden');
                }
            });
        });
    });

    analyzeButton.addEventListener('click', function() {
        const tokenAddress = tokenAddressInput.value.trim();
        if (!tokenAddress) {
            updateStatus('Please enter a token address');
            return;
        }
        updateStatus('Analyzing with Trader Agent...');
        analyzeToken(tokenAddress);
    });

    fetchEtherscanDataButton.addEventListener('click', function() {
        const tokenAddress = tokenAddressInput.value.trim();
        if (!tokenAddress) {
            updateStatus('Please enter a token address');
            return;
        }
        updateStatus('Fetching data from Etherscan... (This feature is not yet fully implemented)');
        fetchEtherscanData(tokenAddress);
    });

    scrapeTwitterButton.addEventListener('click', function() {
        console.log('Scrape Twitter button clicked');
        const tokenAddress = tokenAddressInput.value.trim();
        if (!tokenAddress) {
            updateStatus('Please enter a token address');
            return;
        }
        updateStatus('Sit back Degen and Watch me working...');
        scrapeTwitter(tokenAddress);
    });

    analyzeContractButton.addEventListener('click', function() {
        const tokenAddress = tokenAddressInput.value.trim();
        if (!tokenAddress) {
            updateStatus('Please enter a token address');
            return;
        }
        updateStatus('Sit back Broski and Watch me work... Analyzing contract...');
        analyzeContract(tokenAddress);
    });

    async function handleResponseError(response) {
        const text = await response.text();
        let message;
        try {
            const json = JSON.parse(text);
            message = json.message || json.error || text;
        } catch (e) {
            message = text;
        }
        throw new Error(message);
    }

    async function analyzeToken(tokenAddress) {
        try {
            updateStatus('Capturing screenshot...');
            chrome.tabs.captureVisibleTab(null, {format: 'png'}, async function(screenshotUrl) {
                if (chrome.runtime.lastError) {
                    updateStatus('Error capturing screenshot: ' + chrome.runtime.lastError.message);
                    return;
                }
                
                updateStatus('Screenshot captured. Sit Back Degen and Watch me work... Sending to server...');
                const screenshotData = screenshotUrl.split(',')[1];
                
                try {
                    const response = await fetch('http://localhost:3000/analyze', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            tokenAddress: tokenAddress,
                            screenshotData: screenshotData
                        })
                    });

                    if (!response.ok) {
                        await handleResponseError(response);
                    }

                    const data = await response.json();
                    updateStatus('Analysis complete!');
                    displayResult(data);
                } catch (error) {
                    console.error('Error during analysis:', error);
                    handleError(error.message);
                }
            });
        } catch (error) {
            console.error('Error during analysis:', error);
            handleError(error.message);
        }
    }

    async function fetchEtherscanData(tokenAddress) {
        try {
            const response = await fetch(`http://localhost:3000/etherscan/${tokenAddress}`);
            if (!response.ok) {
                await handleResponseError(response);
            }
            const data = await response.json();
            updateStatus('Etherscan data fetched successfully!');
            displayEtherscanResult(data);
        } catch (error) {
            console.error('Error fetching Etherscan data:', error);
            handleError(error.message);
        }
    }

    async function scrapeTwitter(tokenAddress) {
        try {
            console.log('Starting Twitter scrape for:', tokenAddress);
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            console.log('Current tab:', tab.url);

            if (!tab.url.includes('twitter.com') && !tab.url.includes('x.com')) {
                throw new Error('Please navigate to Twitter/X.com before scraping');
            }

            // Inject the content script
            const injectionResult = await chrome.runtime.sendMessage({ action: "injectContentScript" });
            if (!injectionResult.success) {
                throw new Error(`Failed to inject content script: ${injectionResult.error}`);
            }

            console.log('Content script injected, sending scrape message');
            const response = await new Promise((resolve) => {
                chrome.tabs.sendMessage(tab.id, { action: 'scrapeTweets' }, resolve);
            });

            if (chrome.runtime.lastError) {
                throw new Error(chrome.runtime.lastError.message);
            }

            if (!response || !response.tweets) {
                throw new Error('No response from content script or no tweets found');
            }

            updateStatus('Twitter data scraped successfully! Sending to server for analysis...');
            
            // Send scraped tweets to your server for Claude API analysis
            const analysisResponse = await fetch('http://localhost:3000/twitter/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tokenAddress: tokenAddress,
                    tweets: response.tweets
                })
            });

            if (!analysisResponse.ok) {
                await handleResponseError(analysisResponse);
            }

            const analysisResult = await analysisResponse.json();
            updateStatus('Twitter analysis complete!');
            displayTwitterResult(analysisResult, tokenAddress);
        } catch (error) {
            console.error('Error scraping or analyzing Twitter data:', error);
            handleError(error.message);
        }
    }

    async function analyzeContract(tokenAddress) {
        try {
            const response = await fetch(`http://localhost:3000/etherscan/contract/${tokenAddress}`);
            if (!response.ok) {
                await handleResponseError(response);
            }
            const data = await response.json();
            updateStatus('Contract analysis complete!');
            displayContractAnalysisResult(data);
        } catch (error) {
            console.error('Error during contract analysis:', error);
            handleError(error.message);
        }
    }

    function handleError(errorMessage) {
        console.log('Handling error:', errorMessage); // Add this line for debugging
        if (errorMessage.includes("Degen You've reached the daily limit")) {
            updateStatus(errorMessage);
        } else {
            updateStatus('An error occurred: ' + errorMessage);
        }
    }

    function updateStatus(message) {
        console.log('Updating status:', message); // Add this line for debugging
        if (message.includes("Degen You've reached the daily limit")) {
            statusDiv.style.color = '#FCD34D'; // Yellow color for warning
            statusDiv.style.fontWeight = 'bold';
        } else {
            statusDiv.style.color = ''; // Reset to default
            statusDiv.style.fontWeight = '';
        }

        statusDiv.textContent = message;
    }

    function displayResult(data) {
        if (data.content && Array.isArray(data.content) && data.content.length > 0) {
            const analysisText = data.content[0].text;
            resultDiv.innerHTML = `
                <h3 class="text-lg font-bold mb-2">Analysis Result</h3>
                <div class="bg-gray-800 p-4 rounded-lg">
                    <pre class="whitespace-pre-wrap">${analysisText}</pre>
                </div>
            `;
            resultDiv.classList.remove('hidden');
        } else {
            updateStatus('Unexpected response format from server');
            console.error('Unexpected response format:', data);
        }
    }

    function displayEtherscanResult(data) {
        let resultHTML = `<h3 class="text-lg font-bold mb-2">Etherscan Data</h3>`;
        
        // Display the placeholder message
        resultHTML += `<div class="bg-gray-700 p-2 rounded-md">`;
        resultHTML += `<p>${data.message}</p>`;
        resultHTML += `<p>Token Address: ${data.tokenAddress}</p>`;
        resultHTML += `</div>`;

        resultDiv.innerHTML = resultHTML;
        resultDiv.classList.remove('hidden');
    }

    function displayTwitterResult(data, tokenAddress) {
        console.log('Displaying Twitter result:', data);
        let resultHTML = `
            <h3>Twitter Analysis for ${tokenAddress}</h3>
            <p>Tweet Count: ${data.tweetCount}</p>
            <p>Overall Sentiment: ${data.sentiment}</p>
            <p>Popularity: ${data.popularity}/10</p>
            <p>Price Impact: ${data.priceImpact}</p>
            <h4>Key Observations:</h4>
            <ul>
        `;
        data.keyObservations.forEach(observation => {
            resultHTML += `<li>${observation}</li>`;
        });
        resultHTML += '</ul><h4>Risks and Opportunities:</h4><ul>';
        data.risksAndOpportunities.forEach(item => {
            resultHTML += `<li>${item}</li>`;
        });
        resultHTML += `</ul><h4>Overall Analysis:</h4><p>${data.overallAnalysis}</p>`;
        resultDiv.innerHTML = resultHTML;
        resultDiv.classList.remove('hidden');
    }

    function displayContractAnalysisResult(data) {
        if (data.content && Array.isArray(data.content) && data.content.length > 0) {
            const analysisText = data.content[0].text;
            
            // Split the analysis into sections
            const sections = analysisText.split('\n\n');
            
            let resultHTML = `<h3 class="text-lg font-bold mb-2">Contract Analysis</h3>`;
            
            sections.forEach((section, index) => {
                const [title, ...content] = section.split('\n');
                resultHTML += `
                    <div class="mb-3">
                        <h4 class="text-md font-semibold text-green-400">${title}</h4>
                        <div class="bg-gray-800 p-2 rounded-md text-sm">
                            ${content.join('<br>')}
                        </div>
                    </div>
                `;
            });

            resultDiv.innerHTML = resultHTML;
            resultDiv.classList.remove('hidden');
        } else {
            updateStatus('Unexpected response format from server');
            console.error('Unexpected response format:', data);
        }
    }

    // Add this to your existing styles or in a <style> tag in popup.html
    const style = document.createElement('style');
    style.textContent = `
        .agent-tab {
            background-color: transparent;
            color: #9CA3AF;
        }
        .agent-tab.active {
            background-color: #374151;
            color: #10B981;
        }
    `;
    document.head.appendChild(style);
});