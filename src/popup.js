const title = document.getElementById("title");
const intervalText = document.getElementById("interval");
const wobbleText = document.getElementById("wobble");
const saveButton = document.getElementById("save");
const deleteButton = document.getElementById("delete");
const defaultsButton = document.getElementById("defaults");
const cancelButton = document.getElementById("cancel");
const optionsPageLink = document.getElementById("optionsPage");

defaultsButton.addEventListener("click", (evt) => {
    intervalText.value = DEFAULT_INTERVAL;
    wobbleText.value = DEFAULT_WOBBLE;
});

cancelButton.addEventListener("click", (evt) => {
    window.close();
});

optionsPageLink.addEventListener("click", (evt) => {
    const message = {action: OPEN_OPTIONS_PAGE};
    chrome.runtime.sendMessage(message, (resp) => {
        console.log(`${message.action} result ${resp.result}`);
    });
});

chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
    const domain = new URL(tabs[0].url).host;
    title.innerText = domain;

    saveButton.addEventListener("click", (evt) => {
        const interval = parseInt(intervalText.value);
        const wobble = parseInt(wobbleText.value);
        try {
            addModifySiteSetting(makeSiteSetting(domain, interval, wobble), () => {
                if (chrome.runtime.lastError) {
                    window.alert(chrome.runtime.lastError.message);
                } else {
                    window.close();
                }
            });
        } catch (exc) {
            alertInvalidSiteSettings("The modification was not applied.", exc);
        }
    });

    deleteButton.addEventListener("click", (evt) => {
        deleteSiteSetting(domain, () => {
            if (chrome.runtime.lastError) {
                window.alert(chrome.runtime.lastError.message);
            } else {
                window.close();
            }
        });
    });

    getSettings(settings => {
        const siteSettings = settings.sites[domain];
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
