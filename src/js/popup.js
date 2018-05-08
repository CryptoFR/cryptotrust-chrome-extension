"use strict";

function localizePopup()
{
    // Localize by replacing __MSG_***__ meta tags
    const objects = document.getElementsByTagName('html');
    for (let j = 0; j < objects.length; j++)
    {
        let obj = objects[j],
            valStrH = obj.innerHTML.toString(),
            valNewH = valStrH.replace(/__MSG_(\w+)__/g, (match, v1) => {
            return v1 ? chrome.i18n.getMessage(v1) : "";
        });

        if(valNewH != valStrH) { obj.innerHTML = valNewH; }
    }
}

window.onload = () => {

    chrome.tabs.getSelected(null, (tab) => {
        const   tURL        = new URL(tab.url),
                hostname    = tURL.hostname;

        document.getElementById("suspicious-domain").innerText = hostname;
        document.forms[0].domain.value = hostname;
        chrome.storage.local.get(["scamSites"], (result) => {
            if ((result.scamSites.indexOf(hostname) != -1)) {
                document.getElementById("is-scam").checked = true;
            }
        });
    });

    document.forms[0].onsubmit = () => {
        const data = new FormData(document.forms[0]);
        for (let pair of data.entries()) {
            console.log(pair);
        }
        return false;
    };

    localizePopup();

};
