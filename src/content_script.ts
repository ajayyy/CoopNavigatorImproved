import * as Utils from "./utils";

chrome.runtime.onMessage.addListener(function(request: Utils.ChromeMessage, sender, sendResponse: CallableFunction) {
    switch(request.message) {
        case "startScrape":
            preloadJobs();
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
    let descriptionContainerFunction = (): HTMLDivElement => <HTMLDivElement> document.querySelector("[for='ctl00_mainContainer_uxTabs_ctl12_uxInfoDescriptionEn']").parentElement;
    // Wait for it to load
    await Utils.wait(() => descriptionContainerFunction() !== null);

    let descriptionContainer: HTMLDivElement = descriptionContainerFunction();

    // Wait for the description iframe to reload
    let descriptionIframeFunction = (): HTMLIFrameElement => <HTMLIFrameElement> descriptionContainer.querySelector("#ctl00_mainContainer_uxTabs_ctl12_uxInfoDescriptionEn_ifr");
    // Wait for it to load
    await Utils.wait(() => descriptionIframeFunction() !== null && descriptionIframeFunction().contentWindow.document.body.children.length > 0);
    let descriptionIframe: HTMLIFrameElement = descriptionIframeFunction();

    descriptionContainer.classList.add("hidden");

    // Hide French description
    let frenchDescriptionContainer: HTMLDivElement = <HTMLDivElement> document.querySelector("[for='ctl00_mainContainer_uxTabs_ctl12_uxInfoDescriptionFr']").parentElement;
    frenchDescriptionContainer.classList.add("hidden");

    // Clone the description to a different location
    let newDescription: HTMLDivElement = <HTMLDivElement> descriptionContainer.cloneNode(true);
    newDescription.classList.add("moved-description");
    newDescription.classList.remove("hidden");

    let jobNumberElement: HTMLDivElement = <HTMLDivElement> document.getElementById("ctl00_mainContainer_uxTabs_ctl12_uxInfoCoopJobGroup");
    jobNumberElement.parentElement.insertBefore(newDescription, jobNumberElement);

    // Copy over Iframe info
    let newDescriptionIframe = (): HTMLIFrameElement => <HTMLIFrameElement> newDescription.querySelector("#ctl00_mainContainer_uxTabs_ctl12_uxInfoDescriptionEn_ifr");
    await Utils.wait(() => newDescriptionIframe().contentWindow !== null && newDescriptionIframe().contentWindow.document.body !== undefined);
    newDescriptionIframe().contentWindow.document.body.innerHTML = descriptionIframe.contentWindow.document.body.innerHTML;

    // Remove Iframe border
    newDescriptionIframe().setAttribute("frameBorder", "0");
    (<HTMLDivElement> newDescription.querySelector("#mce_5")).style.removeProperty("border-width");

    // Make sure it does not get reset
    Utils.wait(() => newDescriptionIframe().contentWindow.document.body.children.length == 0).then((): void => {
        // Put the info back
        newDescriptionIframe().contentWindow.document.body.innerHTML = descriptionIframe.contentWindow.document.body.innerHTML;
    });

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

    // Create new Apply Button
    let newApplyButtonContainer: HTMLDivElement = document.createElement("div");
    newApplyButtonContainer.id = "new-apply-button";
    newApplyButtonContainer.classList.add("InputGroup");
    let newApplyButton: HTMLLabelElement = document.createElement("label");
    newApplyButton.setAttribute("for", "newApplyButton");
    newApplyButton.classList.add("InputLabel", "new-apply-button");
    newApplyButtonContainer.appendChild(newApplyButton);

    let oldApplyButton: HTMLLinkElement = <HTMLLinkElement> document.getElementById("ctl00_contextContainer_uxApplyJob");
    newApplyButton.addEventListener("click", oldApplyButton.click);
    newApplyButton.innerText = oldApplyButton.innerText;

    // Add apply button to page
    let jobQualificationsTitle: HTMLDivElement = <HTMLDivElement> document.getElementById("ctl00_mainContainer_uxTabs_ctl12_uxInfoQualification");
    jobQualificationsTitle.parentElement.insertBefore(newApplyButtonContainer, jobQualificationsTitle);

    // Remove two spaces before the apply button
    newApplyButtonContainer.previousElementSibling.classList.add("hidden");
    newApplyButtonContainer.previousElementSibling.previousElementSibling.classList.add("hidden");
}

/**
 * Will preload all of the jobs on the current page in hidden Iframes.
 */
async function preloadJobs() {
    // Start scraping for the details of every job.
    let rows: NodeListOf<HTMLTableRowElement> = getJobList();
            
    for (const row of rows) {
        let jobNumberElement: HTMLTableDataCellElement = <HTMLTableDataCellElement> row.querySelector("td[headers~='CoopJobNumber'] > a");
        console.log(row.querySelector("td[headers~='CoopJobNumber'] > a").getAttribute("href"));

        // Replace this link with a link to open a hidden Iframe
        let iframe: HTMLIFrameElement = document.createElement("iframe");
        iframe.id = "coop-navigator-improved-job-" + jobNumberElement.innerText;
        iframe.setAttribute("src", document.URL + "#jobNumber=" + jobNumberElement.innerText);
        iframe.classList.add("hidden", "coop-navigator-improved-job-view");

        // Add the iframe to the document
        row.parentElement.insertBefore(iframe, jobNumberElement.parentElement.parentElement.nextElementSibling);

        // Add open listener
        jobNumberElement.removeAttribute("href");
        jobNumberElement.addEventListener("click", () => {
            if (iframe.classList.contains("hidden")) {
                iframe.classList.remove("hidden");
            } else {
                iframe.classList.add("hidden");
            }
        });

        // To give it time to load, add a little delay
        await new Promise((resolve, reject) => {
            setTimeout(resolve, 2500);
        });
    }
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