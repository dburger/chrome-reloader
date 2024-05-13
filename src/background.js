importScripts("./common.js");

const reload = () => {
    console.log("reloading start...");
    getSettings(settings => {
        const domains = new Set(settings.domains);
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
                    console.log("noreload", tab.url, "no host match");
                }
            }
        });
    });
};

setInterval(reload, 300 * 1000);
