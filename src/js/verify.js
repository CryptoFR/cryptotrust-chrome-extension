"use strict";

class Verify {

    constructor() {

        this.debugging = true;

        this.suspiciousDomain = document.domain;
        this.isScammy();
    }


    isScammy() {
        this.debug("🚀 Scanning scammy sites.");
        chrome.storage.local.get(["scamSites"], (result) => {
            if(result.scamSites.indexOf(document.domain) !== -1) {
                this.debug("🤔 Scammy site.");
                this.setIcon("scam");
                this.checkIfAuthorized();

            } else {
                this.setIcon("unknown");
            }
        });
    }

    /**
    * Inject the pop-in in current page
    */
    async showMessage() {

        await this.pageLoaded();
        await this.injectCSS("css/injected.css");
        await this.injectHTML("html/injected.html");
        this.translate();
        this.updatePlaceholders();
        this.addListeners();
        this.addTimeOut();

    }
    async pageLoaded() {
        return new Promise((resolve) => {
            window.onload = () => {
                console.log("page Loaded");
                resolve(true);
            }
        });
    }
    async injectHTML(htmlpage) {
        return new Promise((resolve, reject) => {

            fetch(chrome.extension.getURL(htmlpage))
            .then(response => response.text())
            .then(data => {
                document.body.innerHTML = document.body.innerHTML + data;
                console.log("html Loaded");
                resolve(true);
            })
            .catch((err) => {
                reject("Fetch HTML " + err);
            });

        });
    }

    async injectCSS(filename) {
        return new Promise((resolve, reject) => {
            let cssFile = document.createElement("link")
            cssFile.setAttribute("rel", "stylesheet");
            cssFile.setAttribute("type", "text/css");
            cssFile.setAttribute("href", chrome.extension.getURL(filename));
            if( !document.body.appendChild(cssFile)){
                throw new Error('appendChild CSS not possible now');
            } else {
                cssFile.onload = () => {
                    console.log("CSS injected");
                    resolve(true);
                }
            }
        });
    }
    addTimeOut() {
        setTimeout(() => {
            document.getElementById("overlaycryptofr").className = "show";
        }, 333);
    }
    updatePlaceholders() {
        document.getElementById("suscpicious-domain").innerHTML = this.suspiciousDomain;
        document.getElementById("why-btn").href = `https://cryptofr.com/search?term=${encodeURIComponent(this.suspiciousDomain)}&in=titles&categories[]=67`;
    }

    addListeners() {
        this.acceptRisks();
    }

    acceptRisks() {
        document.getElementById("i-understand-and-want-to-go-anyway").onclick = () => {
            this.addToWhiteList();
            document.getElementById("overlaycryptofr").remove();
            return false;
        };
    }
    translate(){

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

    checkIfAuthorized() {
         chrome.storage.local.get(["authorized"], (results) => {
            let authorizedDomains = results.authorized;
            if(authorizedDomains.indexOf(document.domain) < 0) {
                this.showMessage();
            } else {
                this.debug("Domain " + document.domain + " authorized for this session.");
                return true;
            }
        });
    }


    addToWhiteList() {
        console.log("addtowhitelist")
        chrome.storage.local.get(["authorized"], (results) => {

            let authorizedDomains = results.authorized;
            if(authorizedDomains.indexOf(document.domain) < 0) {
                console.log("inscription")

                if (typeof results !== "array") { results = []; }
                results.push(document.domain);
                chrome.storage.local.set({ "authorized" : results });
                return true;

            } else {
                return false;
            }
        });
    }

    setIcon(icon) {
        chrome.runtime.sendMessage({type: "icon-change", icon: icon});
    }

    debug(message) {
        if(this.debugging === true) {
            console.log(message);
        }
    }
}

const VF = new Verify();
