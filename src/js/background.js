"use strict";

class Background {

    constructor() {
        this.tabIcons = {};
        this.activeTab = false;

        this.listenToMessages();

        // Reinit authorized domains
        chrome.storage.local.set({"authorized": []});
        chrome.storage.local.set({"reports": []});
        chrome.storage.local.set({"checked": []});
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
            if (request.type === "icon-change") {
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

}

const Bk = new Background();
