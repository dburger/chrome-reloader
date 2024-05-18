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
 * @returns {HTMLTableRowElement} - The created tr element.
 */
const createSitesRow = (domain, interval) => {
    const tr = document.createElement("tr");
    tr.appendChild(createDeleteRowTd());
    tr.appendChild(createInputTd(domain));
    tr.appendChild(createInputTd(interval));
    return tr;
};

/**
 * Adds a sites row.
 *
 * @param domain {string} - The domain to show in the row.
 * @param sitesBody {HTMLElement} - The sites tbody to add the row to.
 *     TODO(dburger): is this a more specific type?
 */
const addSitesRow = (domain, interval, sitesBody) => {
    sitesBody.appendChild(createSitesRow(domain, interval));
};

const loadSites = (sites) => {
    const sitesBody = getSitesBody();
    removeChildren(sitesBody);

    for (const [domain, siteSettings] of Object.entries(sites)) {
        addSitesRow(domain, siteSettings.interval, sitesBody);
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
    const addSiteButton = document.getElementById("addSite");

    const sitesBody = getSitesBody();

    saveButton.addEventListener("click", (evt) => {
        const sites = [];
        for (let i = 0; i < sitesBody.childNodes.length; i++) {
            const row = sitesBody.childNodes[i];
            const domain = row.childNodes[1].childNodes[0].value;
            const interval = row.childNodes[2].childNodes[0].value;
            sites.push([domain, interval]);
        }

        setSettings(sites, () => {
            if (chrome.runtime.lastError) {
                window.alert(chrome.runtime.lastError.message);
            }
        });
    });

    reloadButton.addEventListener("click", (evt) => {
        getSettings(loadSettings);
    });

    addSiteButton.addEventListener("click", (evt) => {
        addSitesRow("", 300, sitesBody);
    });

    sitesBody.addEventListener("click", (evt) => {
        if (isDeleter(evt.target)) {
            sitesBody.removeChild(evt.target.parentElement);
        }
    });
});
