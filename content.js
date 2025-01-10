chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "extractTokenAddress") {
      // This is a very basic example. You'll need to implement more robust logic
      // to extract token addresses based on the websites your users typically visit
      const addressRegex = /0x[a-fA-F0-9]{40}/;
      const match = document.body.innerText.match(addressRegex);
      sendResponse({ tokenAddress: match ? match[0] : null });
    }
  });