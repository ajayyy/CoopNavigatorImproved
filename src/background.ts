import * as Utils from "./utils";
import * as Config from "./config";

//add help page on install
chrome.runtime.onInstalled.addListener(function (installedDetails) {
    // This let's the config sync to run fully before checking.
    // This is required on Firefox
    setTimeout(async function() {
        if (Config.config === undefined) await Utils.wait(() => Config.config === undefined, 1000, 10);

        if (!Config.config.installed){
            //open up the install page
            chrome.tabs.create({url: "https://github.com/ajayyy/CoopNavigatorImproved#coop-navigator-improved-uottawa"});

            Config.config.installed = true;
        }
    }, 1500);
});