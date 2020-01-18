import * as Utils from "./utils";
import * as Config from "./config";

window.addEventListener('DOMContentLoaded', init);

async function init(): Promise<void> {
    Utils.localizeHtmlPage();

    await Utils.wait(() => Config.config !== undefined, 1000, 10);

    // See if the buttons should be swapped
    let disableExtensionButton = <HTMLDivElement> document.getElementById("disableExtension");
    let enableExtensionButton = <HTMLDivElement> document.getElementById("enableExtension");
    if (!Config.config.extensionEnabled) {
        swapExtensionStatus(false);
    }

    // Add listener to extension button
    disableExtensionButton.addEventListener("click", () => swapExtensionStatus());
    enableExtensionButton.addEventListener("click", () => swapExtensionStatus());
}

/**
 * Swaps if the extension is enable or not
 */
function swapExtensionStatus(changeConfig: boolean = true): void {
    if (changeConfig) Config.config.extensionEnabled = !Config.config.extensionEnabled;

    let disableExtensionButton = <HTMLDivElement> document.getElementById("disableExtension");
    let enableExtensionButton = <HTMLDivElement> document.getElementById("enableExtension");

    if (Config.config.extensionEnabled) {
        enableExtensionButton.classList.add("hidden");
        disableExtensionButton.classList.remove("hidden");
    } else {
        disableExtensionButton.classList.add("hidden");
        enableExtensionButton.classList.remove("hidden");
    }
}