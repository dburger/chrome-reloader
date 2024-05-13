const DEFAULT_DOMAINS = [
    "play.ballybet.com",
    "sports.az.betmgm.com",
    "az.betrivers.com",
    "www.betus.com.pa",
    "az.betway.com",
    "www.bovada.lv",
    "sportsbook.caesars.com",
    "www.playdesertdiamond.com",
    "sportsbook.draftkings.com",
    "espnbet.com",
    "sportsbook.fanduel.com",
    "app.hardrock.bet",
    "az.superbook.com",
    "az.unibet.com",
];

const makeVersionedSettings = (domains) => {
    return {
        v1: {
            domains: domains,
        }
    };
};

const getSettings = (callback) => {
    chrome.storage.sync.get({v1: {}}, (s) => {
        if (Object.keys(s.v1).length > 0) {
            // s.v1 is already what we want.
        } else {
            s = makeVersionedSettings(DEFAULT_DOMAINS);
        }
        callback(s.v1);
    });
}
