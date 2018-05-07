"use strict";

class Background {

    constructor() {
        this.urls = [
            "https://raw.githubusercontent.com/CryptoFR/crypto-scams-fr/master/websites.txt"
        ],
        this.ttl = 86400;
        this.debugging = true;
        this.tabIcons = {};
        this.activeTab = false;
        this.verifyFreshness();
        this.listenToMessages();
        // Reinit authorized domains
        chrome.storage.local.set({"authorized": []});
    }

    /**
     * Verify Storage and freshness
     */
    verifyFreshness() {
        chrome.storage.local.get(["lastDownload"], (result) => {
            this.debug("Timestamp " + result.lastDownload);
            if(typeof result.lastDownload === "undefined"
                || result.lastDownload + this.ttl < Number.parseInt(Date.now()/1000, 0)) {
                this.getDistantDatabases();
            }
        });
    }

    changeIcon(icon) {
        chrome.browserAction.setIcon({
            path : {
                "16": `img/icons/16w/${icon}.png`,
                "32": `img/icons/32w/${icon}.png`,
                "48": `img/icons/48w/${icon}.png`,
                "64": `img/icons/64w/${icon}.png`,
                "128": `img/icons/128w/${icon}.png`
            }
        });
    }

    listenToMessages() {
        chrome.runtime.onMessage.addListener((request) => {
            if (request.type == "icon-change") {
                const icon = request.icon;
                this.changeIcon(icon);
                this.tabIcons[this.activeTab] = icon;
            }
        });
        chrome.tabs.onActivated.addListener((activeInfo) => {
            this.activeTab = activeInfo.tabId;
            if (typeof this.tabIcons[this.activeTab] !== "undefined") {
                this.changeIcon(this.tabIcons[this.activeTab]);
            } else {
                this.changeIcon("default");
            }
        });
    }


    setIconIdle() {

    }
    setIconReady() {

    }

    getDistantDatabases() {
      // FIXME : ugly pooling -> api ?
      const xmlhttp = new XMLHttpRequest();

      xmlhttp.onreadystatechange = () => {
          if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
              chrome.storage.local.set({"lastDownload": this.timestamp()});
              chrome.storage.local.set({"scamSites": xmlhttp.responseText});
              // Re-test current page after download
              // Display icon end
          }
      };

      xmlhttp.open("GET", this.urls[0], true);
      xmlhttp.send();
    }

    timestamp() {
        return Number.parseInt(Date.now()/1000, 0);
    }

    debug(message) {
        if(this.debugging === true) {
            console.log(message);
        }
    }
}

const Bk = new Background();