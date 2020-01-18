interface ChromeMessage {
    message: string;
}

interface ChromeMessageCallback {
    response: JSON;
}

interface WaitCondition { 
    (): boolean
}

// Function that can be used to wait for a condition before returning
async function wait(condition: WaitCondition, timeout = 120000, check = 100): Promise<boolean | Error> { 
    return await new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error("TIMEOUT")), timeout);

        let intervalCheck = () => {
            let result = condition();
            if (result !== false) {
                resolve(result);
                clearInterval(interval);
            };
        };

        let interval = setInterval(intervalCheck, check);
        
        //run the check once first, this speeds it up a lot
        intervalCheck();
    });
}

function localizeHtmlPage(): void {
    //Localize by replacing __MSG_***__ meta tags
    var objects = document.getElementsByClassName("coopNavigatorImprovedPageBody")[0].children;
    for (var j = 0; j < objects.length; j++) {
        var obj = objects[j];
        
        let localizedMessage = getLocalizedMessage(obj.innerHTML.toString());
        if (localizedMessage) obj.innerHTML = <string> localizedMessage;
    }
}

function getLocalizedMessage(text: string): string | boolean {
    var valNewH: string = text.replace(/__MSG_(\w+)__/g, function(match, v1) {
        return v1 ? chrome.i18n.getMessage(v1) : "";
    });

    if(valNewH != text) {
        return valNewH;
    } else {
        return false;
    }
}

export {
    ChromeMessage, 
    ChromeMessageCallback, 
    wait,
    localizeHtmlPage
};