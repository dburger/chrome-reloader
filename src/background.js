importScripts("./common.js");

// Map of domains to timeout ID for the reload timeout.
const sites = new Map();

/**
 * Returns the milliseconds value for the given seconds.
 *
 * @param seconds {number} - Seconds to convert to milliseconds.
 * @returns {number} - The number of milliseconds.
 */
const seconds2Millis = (seconds) => {
    return seconds * 1000;
};

/**
 * Reloads tabs from the given domain, if any, and sets the next
 * reload timeout for that domain.
 *
 * @param domain {string} - The domain to reload tabs for.
 */
const reload = (domain) => {
    console.log("looking for", domain);
    let found = false;
    chrome.tabs.query({url: "https://*/*"}, (tabs) => {
        for (const tab of tabs) {
            const host = new URL(tab.url).host;
            if (host === domain) {
                found = true;
                if (tab.active) {
                    console.log(domain, "not reloaded, tab active", tab.url);
                } else {
                    chrome.tabs.reload(tab.id, {bypassCache: false}, () => {
                        console.log(domain, "reloaded", tab.url);
                    });
                }
            }
        }
        if (!found) {
            console.log(domain, "not found");
        }
    });
    sites.set(domain, setTimeout(reload, seconds2Millis(300), domain));
};

/**
 * Syncs the sites map with sites from the current settings.
 */
const syncSites = () => {
    console.log("syncing sites");

    getSettings(settings => {
        const domains = new Set(settings.domains);

        // Add sites not present.
        for (const domain of domains) {
            if (!sites.has(domain)) {
                const timeoutId = setTimeout(reload, seconds2Millis(300), domain);
                sites.set(domain, timeoutId);
                console.log("reload timeout added for", domain);
            }
        }

        // Remove sites no longer in the settings.
        for (const [domain, timeoutId] of sites) {
            if (!domains.has(domain)) {
                clearTimeout(timeoutId);
                sites.delete(domain);
                console.log("reload timeout removed for", domain);
            }
        }
    });
};

setInterval(syncSites, seconds2Millis(10));
