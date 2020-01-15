
chrome.runtime.onMessage.addListener(function(request: ChromeMessage, sender, sendResponse: CallableFunction) {
    switch(request.message) {
        case "startScrape":
            // Start scraping for the details of every job.
            let rows: NodeListOf<HTMLTableRowElement> = 
                document.querySelectorAll("#ctl00_mainContainer_uxTabs_ctl05 > div > div > table.GridView > tbody > :not(.GridHeaderStyle)");
            
            for (const row of rows) {
                console.log(row.querySelector("td[headers~='CoopJobNumber'] > a").getAttribute("href"));
            }
    }
});