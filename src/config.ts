interface ConfigCallback {
    (changes: chrome.storage.StorageChange): any
}

var configListeners: Array<ConfigCallback> = [];
var localConfig;
var config;

/**
 * A Map cannot be stored in the chrome storage. 
 * This data will be decoded from the array it is stored in
 * 
 * @param {*} data 
 */
function decodeStoredItem(data) {
    if(typeof data !== "string") return data;
    
	try {
        let str = JSON.parse(data);
        
		if(!Array.isArray(str)) return data;
		return new Map(str);
    } catch(e) {

        // If all else fails, return the data
        return data;
    }
}

function configProxy() {
    chrome.storage.onChanged.addListener((changes: chrome.storage.StorageChange, namespace) => {
        for (const key in changes) {
            localConfig[key] = decodeStoredItem(changes[key].newValue);
        }

        for (const callback of configListeners) {
            callback(changes);
        }
    });
	
    let handler: ProxyHandler<any> = {
        set: function(obj, prop, value) {
            localConfig[prop] = value;

            chrome.storage.sync.set({
                [prop]: value
            });

            return true;
        },
        
        get: function(obj, prop) {
			return obj[prop] || localConfig[prop];
        }
		
    };

    return new Proxy<any>({handler}, handler);
}

function fetchConfig() { 
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(null, function(items) {
            localConfig = items;  // Data is ready
            resolve();
        });
    });
}

async function setupConfig() {
    await fetchConfig();
    addDefaults();
    
	config = configProxy();
}

const defaults = {
    "extensionEnabled": true,
    "installed": false
}

// Reset config
function resetConfig(): void {
	config = defaults;
};

// Add defaults
function addDefaults(): void {
    for (const key in defaults) {
        if(!localConfig.hasOwnProperty(key)) {
			localConfig[key] = defaults[key];
		}
    }
};

// Sync config
setupConfig();

export {
    resetConfig,
    config,
    configListeners
};