"use strict";

window.onload = () => {

    chrome.tabs.getSelected(null, (tab) => {
        const   tURL        = new URL(tab.url),
                hostname    = tURL.hostname;

        document.getElementById("suspicious-domain").innerText = hostname;
        document.forms[0].domain.value = hostname;
        chrome.storage.local.get(["scamSites"], (result) => {
            document.getElementById((result.scamSites.indexOf(hostname) != -1) ? "is-scam" : "is-not-scam").checked = true;
        });
    });

    document.forms[0].onsubmit = () => {
        const data = new FormData(document.forms[0]);
        for (let pair of data.entries()) {
            console.log(pair);
        }
        return false;
    }

};