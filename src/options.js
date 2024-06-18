/**
 * Removes all the children of an element.
 *
 * @param elem {HTMLElement} - The element to remove the children of.
 */
const removeChildren = (elem) => {
    while (elem.lastChild) {
        elem.removeChild(elem.lastChild);
    }
}

/**
 * Creates and returns a td element with text "X" to be used to
 * delete the row.
 *
 * @returns {HTMLTableCellElement} - The created td element.
 */
const createDeleteRowTd = () => {
    const td = createTextTd("X");
    td.className = "deleter";
    return td;
};

/**
 * Creates and returns an input of type text with the given value.
 *
 * @param value {string} - The value to give the text input.
 * @returns {HTMLInputElement} - The created text input.
 */
const createInputText = (value) => {
    const input = document.createElement("input");
    input.setAttribute("type", "text");
    input.value = value;
    return input;
};

/**
 * Creates and returns a table cell td element with the given text.
 *
 * @param text {string} - The text to give the element.
 * @returns {HTMLTableCellElement} - The created td element.
 */
const createTextTd = (text) => {
    const td = document.createElement("td");
    td.innerText = text;
    return td;
}

/**
 * Creates and returns a td element containing a text input element with
 * the given value.
 *
 * @param value {string} - The value to give the text input element.
 * @param className {string} - The class name to give the td, if any.
 * @returns {HTMLTableCellElement} - The created td element.
 */
const createInputTd = (value, className) => {
    const td = document.createElement("td");
    td.appendChild(createInputText(value));
    if (className) {
        td.className = className;
    }
    return td;
}

/**
 * Creates and returns a new sites row.
 *
 * @param domain {string} - The domain to show in the row.
 * @param interval {number} - Interval for the reload, in seconds.
 * @param wobble {number} - Wobble for the reload, in seconds.
 * @returns {HTMLTableRowElement} - The created tr element.
 */
const createSitesRow = (domain, interval, wobble) => {
    const tr = document.createElement("tr");
    tr.appendChild(createDeleteRowTd());
    tr.appendChild(createInputTd(domain));
    tr.appendChild(createInputTd(interval));
    tr.appendChild(createInputTd(wobble));
    return tr;
};

/**
 * Adds a sites row.
 *
 * @param domain {string} - The domain to show in the row.
 * @param interval {number} - Interval for the reload, in seconds.
 * @param wobble {number} - Wobble for the reload, in seconds.
 * @param sitesBody {HTMLElement} - The sites tbody to add the row to.
 *     TODO(dburger): is this a more specific type?
 */
const addSitesRow = (domain, interval, wobble, sitesBody) => {
    sitesBody.appendChild(createSitesRow(domain, interval, wobble));
};

const loadSites = (sites) => {
    const sitesBody = getSitesBody();
    removeChildren(sitesBody);

    for (const [domain, siteSettings] of Object.entries(sites)) {
        addSitesRow(domain, siteSettings.interval, siteSettings.wobble, sitesBody);
    }
}

/**
 * Determines if the given element is a deleter element.
 *
 * @param target {HTMLElement} - The element to check.
 * @returns {boolean} - Whether this element is a deleter.
 */
const isDeleter = (target) => {
    return target.tagName === "TD" && target.classList.contains("deleter");
};

/**
 * Loads the given settings into the page.
 *
 * @param settings {@see makeVersionedSettings}
 */
const loadSettings = (settings) => {
    loadSites(settings.sites);
};

/**
 * Returns a reference to the sites body element.
 *
 * @returns {HTMLElement} - The sites body element.
 */
const getSitesBody = () => {
    return document.getElementById("sitesBody");
};

/** Initial page configuration, loads settings into the page. */
document.addEventListener("DOMContentLoaded", (evt) => {
    getSettings(loadSettings);

    const saveButton = document.getElementById("save");
    const reloadButton = document.getElementById("reload");
    const defaultsButton = document.getElementById("defaults");
    const addSiteButton = document.getElementById("addSite");

    const sitesBody = getSitesBody();

    const batchText = document.getElementById("batchText");
    const batchAddButton = document.getElementById("batchAdd");

    saveButton.addEventListener("click", (evt) => {
        const excs = [];
        const siteSettings = [];
        for (let i = 0; i < sitesBody.childNodes.length; i++) {
            const row = sitesBody.childNodes[i];
            const domain = row.childNodes[1].childNodes[0].value;
            const interval = parseInt(row.childNodes[2].childNodes[0].value);
            const wobble = parseInt(row.childNodes[3].childNodes[0].value);
            try {
                siteSettings.push(makeSiteSetting(domain, interval, wobble));
            } catch (exc) {
                excs.push(exc);
            }
        }

        if (excs.length > 0) {
            alertInvalidSiteSettings("No changes were applied.", ...excs);
        } else {
            setSettings(siteSettings, () => {
                if (chrome.runtime.lastError) {
                    window.alert(chrome.runtime.lastError.message);
                }
            });
        }
    });

    reloadButton.addEventListener("click", (evt) => {
        getSettings(loadSettings);
    });

    defaultsButton.addEventListener("click", (evt) => {
        chrome.storage.sync.clear();
        getSettings(loadSettings);
    });

    addSiteButton.addEventListener("click", (evt) => {
        addSitesRow("", DEFAULT_INTERVAL, DEFAULT_WOBBLE, sitesBody);
    });

    sitesBody.addEventListener("click", (evt) => {
        if (isDeleter(evt.target)) {
            sitesBody.removeChild(evt.target.parentElement);
        }
    });

    batchAddButton.addEventListener("click", (evt) => {
        const excs = [];
        const siteSettings = [];
        for (const line of batchText.value.split("\n")) {
            const parts = line.split(" ");
            if (parts.length !== 3) {
                continue;
            }
            const domain = parts[0];
            const interval = parseInt(parts[1]);
            const wobble = parseInt(parts[2]);
            try {
                siteSettings.push(makeSiteSetting(domain, interval, wobble));
            } catch (exc) {
                excs.push(exc);
            }
        }

        if (excs.length > 0) {
            alertInvalidSiteSettings("No batch updates were applied.", ...excs);
        } else {
            addModifySiteSettings(siteSettings, () => {
                if (chrome.runtime.lastError) {
                    window.alert(chrome.runtime.lastError.message);
                }
            });
        }
    });
});
