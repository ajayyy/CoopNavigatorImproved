import * as Utils from "./utils";

chrome.runtime.onMessage.addListener(function(request: Utils.ChromeMessage, sender, sendResponse: CallableFunction) {
    switch(request.message) {
        case "startScrape":
            // Start scraping for the details of every job.
            let rows: NodeListOf<HTMLTableRowElement> = getJobList();
            
            for (const row of rows) {
                console.log(row.querySelector("td[headers~='CoopJobNumber'] > a").getAttribute("href"));
            }
            
            break;
    }
});


// Depending on the URL, do different things
if (window.location.hash.startsWith("#jobNumber=")) {
    goToJobNumber();
}

/**
 * Goes to a specified job number from window.location.hash
 */
async function goToJobNumber() {
    // Search for a jobNumber and load it
    let jobNumber: string = window.location.hash.replace("#jobNumber=", "");
    let jobNumberInput: HTMLTextAreaElement =  
        <HTMLTextAreaElement> document.getElementById("ctl00_mainContainer_uxTabs_ctl03_uxSearchCoopJobNumber");
    let searchButton: HTMLButtonElement = <HTMLButtonElement> document.getElementById("ctl00_mainContainer_uxTabs_ctl03_uxBasicSearch");

    jobNumberInput.value = jobNumber;
    searchButton.click();

    let loadingStatus: HTMLDivElement = <HTMLDivElement> document.getElementById("ctl00_mainContainer_UpdateProgress1_uxUpdateProgress");

    // Wait for the loading status to appear if required
    if (loadingStatus.style.display = "none") {
        await Utils.wait(() => loadingStatus.style.display == "block");
    }

    // Wait for the loading status to disappear
    await Utils.wait(() => loadingStatus.style.display == "none");

    let jobLink: HTMLLinkElement = getJobLink(getJobList()[0]);
    jobLink.click();
}

/**
 * Gets the link element of this job row
 * 
 * @param row The row of this job
 */
function getJobLink(row: HTMLTableRowElement): HTMLLinkElement {
    return row.querySelector("td[headers~='CoopJobNumber'] > a");
}

/**
 * Gets the job list from the DOM
 */
function getJobList(): NodeListOf<HTMLTableRowElement> {
    return document.querySelectorAll("#ctl00_mainContainer_uxTabs_ctl05 > div > div > table.GridView > tbody > :not(.GridHeaderStyle)");
}