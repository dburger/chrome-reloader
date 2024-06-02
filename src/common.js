// Default sites? There are no default sites.
const DEFAULT_SITES = [];

const DEFAULT_INTERVAL = 300;
const DEFAULT_WOBBLE = 60;

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
 * Returns a random int from [0, max].
 *
 * @param max {number} - The max value for the random int.
 * @returns {number} - A random int from [0, max].
 */
const randomInt = (max) => {
    return Math.floor(Math.random() * (max + 1));
};

/**
 * Returns the site settings literal object for the given domain. This is
 * used for storage.
 *
 * @param {string} domain - The domain to make site settings for.
 * @param {number} interval - The number of seconds between reloads.
 * @param {number} wobble - The max number of seconds for a randomly chosen premature reload.
 * @returns {{domain:string, interval:number, wobble:number}} - The site settings literal object.
 */
const makeSiteSetting = (domain, interval, wobble) => ({
    domain: domain,
    interval: interval,
    wobble: wobble,
});

const makeSiteSettings = (sites) => {
    const result = {};
    for (const site of sites) {
        const domain = site[0];
        const interval = site[1];
        const wobble = site[2];
        result[domain] = makeSiteSetting(domain, interval, wobble);
    }
    return result;
};

const makeVersionedSettings = (sites) => {
    return {
        v1: {
            sites: sites,
        }
    };
};

const getSettings = (callback) => {
    chrome.storage.sync.get({v1: {}}, (s) => {
        if (Object.keys(s.v1).length > 0) {
            // s.v1 is already what we want.
        } else {
            s = makeVersionedSettings(makeSiteSettings(DEFAULT_SITES));
        }
        callback(s.v1);
    });
}

const setVersionedSettings = (sites, callback) => {
    // Prior version cleanup, when needed, is done here.
    const settings = makeVersionedSettings(sites);
    chrome.storage.sync.set(settings, callback);
}

const setSettings = (sites, callback) => {
    setVersionedSettings(makeSiteSettings(sites), callback);
}

/**
 * Adds a new, or modifies an existing, site setting.
 *
 * @param {string} domain - The domain of the site.
 * @param {number} interval - The interval for reloads.
 * @param {number} wobble - The wobble for the interval.
 * @param {function} callback - Callback upon completion of the storage
 *     of the site setting.
 */
const addModifySiteSetting = (domain, interval, wobble, callback) => {
    getSettings(settings => {
        settings.sites[domain] = makeSiteSetting(domain, interval, wobble);
        setVersionedSettings(settings.sites, callback);
    });
};

const addModifySiteSettings = (sites, callback) => {
    getSettings(settings => {
        for (const site of sites) {
            const domain = site[0];
            const interval = site[1];
            const wobble = site[2];
            settings.sites[domain] = makeSiteSetting(domain, interval, wobble);
        }
        setVersionedSettings(settings.sites, callback);
    });
}

/**
 * Deletes the site settings for the given domain.
 *
 * @param {string} domain - The domain of the site to remove from site settings.
 * @param {function} callback - Callback upon completion of the removal
 *     of the site setting.
 */
const deleteSiteSetting = (domain, callback) => {
    getSettings(settings => {
        delete settings.sites[domain];
        setVersionedSettings(settings.sites, callback);
    });
};
