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
 * Returns the milliseconds value for the given seconds.
 *
 * @param seconds {number} - Seconds to convert to milliseconds.
 * @returns {number} - The number of milliseconds.
 */
const seconds2Millis = (seconds) => {
    return seconds * 1000;
};

const randomInt = (max) => {
    return Math.floor(Math.random() * (max + 1));
};

/**
 * Sets a reload for the given domain at the given interval.
 *
 * @param domain {string} - The domain to reload.
 * @param interval {number} - Interval for the reload, in seconds.
 * @param wobble {number} - Wobble for the reload, in seconds.
 */
const scheduleReload = (domain, interval, wobble) => {
    const timeout = interval - randomInt(wobble);
    console.log("scheduling", domain, timeout);
    const timeoutId = setTimeout(reload, seconds2Millis(timeout), domain, interval, wobble);
    sites.set(domain, new SiteStatus(interval, wobble, timeoutId));
};

/**
 * Reloads tabs from the given domain, if any, and sets the next
 * reload timeout for that domain.
 *
 * @param domain {string} - The domain to reload tabs for.
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
        // Add new or adjust existing timeouts.
        for (const [domain, siteSettings] of Object.entries(settings.sites)) {
            if (sites.has(domain)) {
                // check if interval has changed.
                const siteStatus = sites.get(domain);
                if (siteStatus.interval !== siteSettings.interval) {
                    // TODO(dburger): change interval
                    console.log("change interval", siteStatus.interval, siteSettings.interval);
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

syncSites();
