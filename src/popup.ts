import * as Utils from "./utils";

window.addEventListener('DOMContentLoaded', init);

function init(): void {
    document.getElementById("startScrape").addEventListener("click", (): void => {
        chrome.tabs.query({
            active: true, 
            currentWindow: true
        }, function(tabs): void {
            chrome.tabs.sendMessage(tabs[0].id, {
                message: "startScrape"
            });
        });
    });
}