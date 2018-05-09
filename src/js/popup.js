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

        chrome.storage.local.get(["reports"], (results) => {
            let reportedDomains = results.reports;
            if (reportedDomains.indexOf(hostname) > -1) {
                document.body.className = "reported";
            } else {
                const request = new XMLHttpRequest();
                request.open("GET", apiUrl + "/status/" + hostname, true);
                request.onload = () => {
                    if (request.status === 200) {
                        const response = JSON.parse(request.responseText);
                        if (response.status === "scam") {
                            document.getElementById("is-scam").checked = true;
                        } else if (response.status === "suspicious") {
                            document.getElementById("is-suspicious").checked = true;
                        }
                    }
                };
                request.send();
            }
        });

    });

    localizePopup();

    document.getElementById("report-form").onsubmit = function (e) {
        e.preventDefault();
        chrome.storage.local.get(["reports"], (results) => {
            let reportedDomains = results.reports;
            if(reportedDomains.indexOf(this.domain.value) < 0) {
                reportedDomains.push(this.domain.value);
                chrome.storage.local.set({ "reports" : reportedDomains });
                const request = new XMLHttpRequest();
                request.open("POST", apiUrl + "/report", true);
                request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                request.send(`type=${encodeURIComponent(this.type.value)}&domain=${encodeURIComponent(this.domain.value)}&comment=${encodeURIComponent(this.comment.value)}`);

                request.onload = () => {
                    window.close();
                };
            }
        });
        return false;
    };

};
