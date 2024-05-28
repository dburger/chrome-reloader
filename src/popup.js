const title = document.getElementById("title");
const intervalText = document.getElementById("interval");
const wobbleText = document.getElementById("wobble");
const saveButton = document.getElementById("save");
const deleteButton = document.getElementById("delete");
const defaultsButton = document.getElementById("defaults");

defaultsButton.addEventListener("click", (evt) => {
    intervalText.value = DEFAULT_INTERVAL;
    wobbleText.value = DEFAULT_WOBBLE;
});

chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
    const url = new URL(tabs[0].url);
    title.innerText = url.host;
    getSettings(settings => {
        const siteSettings = settings.sites[url.host];
        if (siteSettings) {
            intervalText.value = siteSettings.interval;
            wobbleText.value = siteSettings.wobble;
        } else {
            deleteButton.disabled = true;
            intervalText.value = DEFAULT_INTERVAL;
            wobbleText.value = DEFAULT_WOBBLE;
        }
    });
});
