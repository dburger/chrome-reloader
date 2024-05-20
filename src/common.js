const DEFAULT_SITES = [
    ["play.ballybet.com", 300, 20],
    ["sports.az.betmgm.com", 300, 20],
    ["az.betrivers.com", 300, 20],
    ["www.betus.com.pa", 300, 20],
    ["az.betway.com", 300, 20],
    ["www.bovada.lv", 300, 20],
    ["sportsbook.caesars.com", 300, 20],
    ["www.playdesertdiamond.com", 300, 20],
    ["sportsbook.draftkings.com", 300, 20],
    ["espnbet.com", 300, 20],
    ["sportsbook.fanduel.com", 300, 20],
    ["app.hardrock.bet", 300, 20],
    ["az.superbook.com", 300, 20],
];

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
