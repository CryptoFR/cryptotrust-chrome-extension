"use strict";

function localizePopup()
{
    //Localize by replacing __MSG_***__ meta tags
    var objects = document.getElementsByTagName('html');
    for (var j = 0; j < objects.length; j++)
    {
        var obj = objects[j];

        var valStrH = obj.innerHTML.toString();
        var valNewH = valStrH.replace(/__MSG_(\w+)__/g, function(match, v1)
        {
            return v1 ? chrome.i18n.getMessage(v1) : "";
        });

        if(valNewH != valStrH)
        {
            obj.innerHTML = valNewH;
        }
    }
}

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
    localizePopup();

};
