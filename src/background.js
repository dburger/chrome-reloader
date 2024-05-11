const domains = new Set([
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
]);

const reload = () => {
    console.log("reloading start...");
    chrome.tabs.query({url: "https://*/*"}, (tabs) => {
        for (const tab of tabs) {
            const host = new URL(tab.url).host;
            if (domains.has(host)) {
                if (tab.active) {
                    console.log("noreload", tab.url, "tab was active");
                } else {
                    chrome.tabs.reload(tab.id, {bypassCache: false}, () => {
                        console.log("reloaded", tab.url);
                    });
                }
            } else {
                console.log("noreload", tab.url, "tab not found");
            }
        }
    });
};

setInterval(reload, 10 * 1000);
