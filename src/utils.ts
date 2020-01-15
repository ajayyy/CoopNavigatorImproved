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

export {
    ChromeMessage, 
    ChromeMessageCallback, 
    wait
};