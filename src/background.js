importScripts("./common.js");

const SYNC_INTERVAL = 10;

// Map of domains to SiteStatus.
const sites = new Map();

class SiteStatus {
    constructor(interval, wobble, timeoutId) {
        this.interval = interval;
        this.wobble = wobble;
        this.timeoutId = timeoutId;
    }
}

/**
 * Schedules a reload for the given domain at the given interval.
 *
 * @param domain {string} - The domain to reload.
 * @param interval {number} - Interval for the reload, in seconds.
 * @param wobble {number} - Wobble for the reload, in seconds.
 */
const scheduleReload = (domain, interval, wobble) => {
    console.log("scheduling reload for", domain, "with interval", interval, "and wobble", wobble);
    const timeout = interval - randomInt(wobble);
    console.log("scheduling", domain, timeout);
    const timeoutId = setTimeout(reload, seconds2Millis(timeout), domain, interval, wobble);
    sites.set(domain, new SiteStatus(interval, wobble, timeoutId));
};

/**
 * Reloads tabs from the given domain and schedules the next reload.
 *
 * @param domain {string} - The domain to reload tabs for.
 * @param interval {number} - Interval for the reload, in seconds.
 * @param wobble {number} - Wobble for the reload, in seconds.
 */
const reload = (domain, interval, wobble) => {
    console.log(domain, ":", "reload initiated");
    let found = false;
    chrome.tabs.query({url: "https://*/*"}, (tabs) => {
        for (const tab of tabs) {
            const host = new URL(tab.url).host;
            if (host === domain) {
                found = true;
                if (tab.active) {
                    console.log(domain, ":", "not reloaded, tab active", tab.url);
                } else {
                    chrome.tabs.reload(tab.id, {bypassCache: false}, () => {
                        console.log(domain, ":", "reloaded", tab.url);
                    });
                    // Presumably, if there are more than one tabs for a domain open, we
                    // only need to reload one of them to prevent a login timeout.
                    break;
                }
            }
        }
        if (!found) {
            console.log(domain, ":", "not found");
        }
    });
    scheduleReload(domain, interval, wobble);
};

/**
 * Syncs the sites map with sites from the current settings.
 */
const syncSites = () => {
    console.log("syncing sites");

    getSettings(settings => {
        console.log("keeping", Object.keys(settings.sites).length, "sites");
        // Add new or adjust existing timeouts.
        for (const [domain, siteSettings] of Object.entries(settings.sites)) {
            if (sites.has(domain)) {
                // check if interval or wobble has changed.
                const siteStatus = sites.get(domain);
                if (siteStatus.interval !== siteSettings.interval || siteStatus.wobble !== siteSettings.wobble) {
                    siteStatus.interval = siteSettings.interval;
                    siteStatus.wobble = siteSettings.wobble;
                    console.log(domain, ":", "interval and/or wobble change");
                }
            } else {
                // add the site
                scheduleReload(domain, siteSettings.interval, siteSettings.wobble);
                console.log(domain, ":", "reload timeout added");
            }
        }

        // Remove sites no longer in the settings.
        for (const [domain, siteStatus] of sites) {
            if (!settings.sites[domain]) {
                clearTimeout(siteStatus.timeoutId);
                sites.delete(domain);
                console.log(domain, ":", "reload timeout cleared");
            }
        }
    });
    setTimeout(syncSites, seconds2Millis(SYNC_INTERVAL));
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === OPEN_OPTIONS_PAGE) {
        chrome.runtime.openOptionsPage();
    }
    sendResponse({result: "OK"});
});

syncSites();
