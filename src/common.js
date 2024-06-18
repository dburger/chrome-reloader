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

class InvalidSiteSettingError extends Error {
    constructor(domain, interval, wobble, problems) {
        super(`${domain}, interval ${interval}, wobble ${wobble} is invalid`);
        this.problems = problems;
    }
}

const validateSiteSetting = (domain, interval, wobble) => {
    const errors = [];
    if (typeof domain !== "string") {
        errors.push("domain must be a string");
    }
    if (!Number.isInteger(interval) || interval < 60) {
        errors.push("interval must be an integer >= 60");
    }
    if (!Number.isInteger(wobble) || wobble < 0 || wobble > interval) {
        errors.push("wobble must be an integer (0, interval]");
    }
    return errors;
};

const makeInvalidSiteSettingsMessage = (exc) => {
    const result = [];
    result.push(`${exc.message}:`);
    for (const p of exc.problems) {
        result.push(`     ${p}`);
    }
    return result.join("\n");
}

const alertInvalidSiteSettings = (message, ...excs) => {
    const messages = [];
    for (const exc of excs) {
        messages.push(makeInvalidSiteSettingsMessage(exc));
    }
    messages.push("\n");
    messages.push(message);
    window.alert(messages.join("\n"));
}

/**
 * Returns the site settings literal object for the given domain. This is
 * used for storage.
 *
 * @param {string} domain - The domain to make site settings for.
 * @param {number} interval - The number of seconds between reloads.
 * @param {number} wobble - The max number of seconds for a randomly chosen premature reload.
 * @returns {{domain:string, interval:number, wobble:number}} - The site settings literal object.
 */
const makeSiteSetting = (domain, interval, wobble) => {
    const problems = validateSiteSetting(domain, interval, wobble);
    if (problems.length > 0) {
        throw new InvalidSiteSettingError(domain, interval, wobble, problems);
    }

    return {
        domain: domain,
        interval: interval,
        wobble: wobble,
    };
};

const sitesFromSiteSettings = (siteSettings) => {
    const result = {};
    for (const siteSetting of siteSettings) {
        result[siteSetting.domain] = siteSetting;
    }
    return result;
}

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
            s = makeVersionedSettings({});
        }
        callback(s.v1);
    });
}

const setVersionedSettings = (sites, callback) => {
    // Prior version cleanup, when needed, is done here.
    const settings = makeVersionedSettings(sites);
    chrome.storage.sync.set(settings, callback);
}

/**
 * Adds a new, or modifies an existing, site setting.
 *
 * @param TODO(dburger): siteSetting
 * @param {function} callback - Callback upon completion of the storage
 *     of the site setting.
 */
const addModifySiteSetting = (siteSetting, callback) => {
    getSettings(settings => {
        settings.sites[siteSetting.domain] = siteSetting;
        setVersionedSettings(settings.sites, callback);
    });
};

const addModifySiteSettings = (siteSettings, callback) => {
    getSettings(settings => {
        for (const siteSetting of siteSettings) {
            settings.sites[siteSetting.domain] = siteSetting;
        }
        setVersionedSettings(settings.sites, callback);
    });
}

const setSettings = (siteSettings, callback) => {
    setVersionedSettings(sitesFromSiteSettings(siteSettings), callback);
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
