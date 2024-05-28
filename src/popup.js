const title = document.getElementById("title");
const intervalCell = document.getElementById("interval");
const wobbleCell = document.getElementById("wobble");

chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
    const url = new URL(tabs[0].url);
    title.innerText = url.host;
    getSettings(settings => {
        const siteSettings = settings.sites[url.host];
        if (siteSettings) {
            intervalCell.innerText = siteSettings.interval;
            wobbleCell.innerText = siteSettings.wobble;
        }
    });
});
