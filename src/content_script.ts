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

    await waitForLoadingIndicator();

    let jobLink: HTMLLinkElement = getJobLink(getJobList()[0]);
    jobLink.click();

    await waitForLoadingIndicator();

    // Find and move the description
    //TODO: Support French
    let descriptionContainer = (): HTMLDivElement => <HTMLDivElement> document.querySelector("[for='ctl00_mainContainer_uxTabs_ctl12_uxInfoDescriptionEn']").parentElement;

    // Wait for it to load
    await Utils.wait(() => descriptionContainer() !== null);
    descriptionContainer().classList.add("hidden");

    // Hide French description
    let frenchDescriptionContainer: HTMLDivElement = <HTMLDivElement> document.querySelector("[for='ctl00_mainContainer_uxTabs_ctl12_uxInfoDescriptionFr']").parentElement;
    frenchDescriptionContainer.classList.add("hidden");

    // Clone the description to a different location
    let newDescription: HTMLDivElement = <HTMLDivElement> descriptionContainer().cloneNode(true);
    newDescription.classList.add("moved-description");
    newDescription.classList.remove("hidden");

    let jobNumberElement: HTMLDivElement = <HTMLDivElement> document.getElementById("ctl00_mainContainer_uxTabs_ctl12_uxInfoCoopJobGroup");
    jobNumberElement.parentElement.insertBefore(newDescription, jobNumberElement);

    // Hide "English Description" label
    let descriptionLabel = newDescription.querySelector("[for='ctl00_mainContainer_uxTabs_ctl12_uxInfoDescriptionEn']");
    descriptionLabel.classList.add("hidden");

    // Hide tabs, banner, sidebar and job title
    document.getElementById("ctl00_mainContainer_uxTabs_TabControl").classList.add("hidden");
    document.getElementById("menuDiv").parentElement.classList.add("hidden");
    document.getElementById("contextDiv").classList.add("hidden");
    document.getElementById("ctl00_mainContainer_uxPageTitle").parentElement.classList.add("hidden");

    // Change left margin on main div
    let mainDiv: HTMLDivElement = <HTMLDivElement> document.getElementById("mainDiv");
    mainDiv.style.marginLeft = "0";
}

async function waitForLoadingIndicator() {
    let loadingStatus: HTMLDivElement = <HTMLDivElement> document.getElementById("ctl00_mainContainer_UpdateProgress1_uxUpdateProgress");

    // Wait for the loading status to appear if required
    if (loadingStatus.style.display = "none") {
        await Utils.wait(() => loadingStatus.style.display == "block");
    }

    // Wait for the loading status to disappear
    await Utils.wait(() => loadingStatus.style.display == "none");
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