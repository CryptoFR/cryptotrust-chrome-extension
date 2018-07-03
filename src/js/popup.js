"use strict";

const apiUrl = "https://api.cryptotrust.io";

/**
 * Localize by replacing __MSG_***__ meta tags
 */
function localizePopup()
{
    const objects = document.getElementsByTagName('html');
    for (let j = 0; j < objects.length; j++)
    {
        let obj = objects[j],
            valStrH = obj.innerHTML.toString(),
            valNewH = valStrH.replace(/__MSG_(\w+)__/g, (match, v1) => {
            return v1 ? chrome.i18n.getMessage(v1) : "";
        });

        if(valNewH !== valStrH) { obj.innerHTML = valNewH; }
    }
}

window.onload = () => {

    chrome.tabs.getSelected(null, (tab) => {

        const   tURL        = new URL(tab.url),
                hostname    = tURL.hostname;

        document.getElementById("suspicious-domain").innerText = hostname;
        document.forms[0].domain.value = hostname;
        document.forms[0].uri.value = tab.url;

        chrome.storage.local.get(["reports"], (results) => {

            let reportedDomains = results.reports;

            if (reportedDomains.indexOf(hostname) > -1) {

                document.body.className = "reported";

            } else {

                // Get current domain status from the API
                const request = new XMLHttpRequest();
                request.open("GET", apiUrl + "/status/" + hostname, true);
                request.onload = () => {
                    if (request.status === 200) {
                        const response = JSON.parse(request.responseText);
                        const radioBtn = document.getElementById(`is-${response.status}`);

                        if(typeof radioBtn !== "undefined") {
                            radioBtn.checked = true;
                            document.body.className = response.status;
                        }
                    }
                };
                request.send();

            }
        });

    });

    localizePopup();

    /**
     * Handle form submission
     */
    const tForm = document.getElementById("report-form");

    tForm.onsubmit = function (e) {

        e.preventDefault();

        chrome.storage.local.get(["reports"], results => {

            let reportedDomains = results.reports;

            if(reportedDomains.indexOf(this.domain.value) < 0) {

                // Add to local history & update localstorage
                reportedDomains.push(this.domain.value);
                chrome.storage.local.set({ "reports" : reportedDomains });

                // Send request to CryptoTrust API
                const request = new XMLHttpRequest();
                request.open("POST", apiUrl + "/reports", true);
                request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                request.send(`type=${encodeURIComponent(this.type.value)}\
                    &domain=${encodeURIComponent(this.domain.value)}\
                    &comment=${encodeURIComponent(this.comment.value)}\
                    &lang=${encodeURIComponent(this.lang.value)}\
                    &uri=${encodeURIComponent(this.uri.value)}`);
                request.onload = () => window.close();

            }

        });

        return false;
    };

    // Change popup style according to current report type
    let     previousValue = null;
    const   reportingOptionsRadios = document.reportForm.type,
            checkClick = function () {
                const value = this.value;
                if(value !== previousValue) {
                    previousValue = value;
                    document.body.className = value;
                }
            };

    for(let i = 0; i < reportingOptionsRadios.length; i++) {
        reportingOptionsRadios[i].onclick = checkClick;
    }

};
