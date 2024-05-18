const DEFAULT_SITES = [
    ["play.ballybet.com", 300],
    ["sports.az.betmgm.com", 300],
    ["az.betrivers.com", 300],
    ["www.betus.com.pa", 300],
    ["az.betway.com", 300],
    ["www.bovada.lv", 300],
    ["sportsbook.caesars.com", 300],
    ["www.playdesertdiamond.com", 300],
    ["sportsbook.draftkings.com", 300],
    ["espnbet.com", 300],
    ["sportsbook.fanduel.com", 300],
    ["app.hardrock.bet", 300],
    ["az.superbook.com", 300],
];

/**
 * Returns the site settings literal object for the given domain. This is
 * used for storage.
 *
 * @param {string} domain - The domain to make site settings for.
 * @param {number} interval - The number of seconds between reloads.
 * @returns {{domain:string, interval:string}} - The site settings literal object.
 */
const makeSiteSetting = (domain, interval) => ({
    domain: domain,
    interval: interval,
});

const makeSiteSettings = (sites) => {
    const result = {};
    for (const site of sites) {
        const domain = site[0];
        const interval = site[1];
        result[domain] = makeSiteSetting(domain, interval);
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
