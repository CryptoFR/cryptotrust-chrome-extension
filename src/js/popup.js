"use strict";

const apiUrl = "https://cryptotrust.trilogik.net";

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

        const request = new XMLHttpRequest();
        request.open("GET", apiUrl + "/status/" + hostname, true);
        request.onload = () => {
            if (request.status=== 200) {
                const response = JSON.parse(request.responseText);
                if (response.status === "scam") {
                    document.getElementById("is-scam").checked = true;
                } else if (response.status === "suspicious") {
                    document.getElementById("is-suspicious").checked = true;
                }
            }
        };
        request.send();
    });

    localizePopup();

    document.getElementById("report-form").onsubmit = (e) => {
        const data = new FormData(document.forms[0]);
        const request = new XMLHttpRequest();
        request.open("POST", apiUrl + "/report");
        request.send(data);
        e.preventDefault();
        request.onload = () => {
            window.close();
        };
        return false;
    };

};
