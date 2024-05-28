const title = document.getElementById("title");
const intervalText = document.getElementById("interval");
const wobbleText = document.getElementById("wobble");

chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
    const url = new URL(tabs[0].url);
    title.innerText = url.host;
    getSettings(settings => {
        const siteSettings = settings.sites[url.host];
        if (siteSettings) {
            intervalText.value = siteSettings.interval;
            wobbleText.value = siteSettings.wobble;
        }
    });
});
