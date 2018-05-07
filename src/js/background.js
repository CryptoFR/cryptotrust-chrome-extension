"use strict";

class Background {

    init() {
      console.log("prout")
        this.urls = [
            "https://raw.githubusercontent.com/CryptoFR/crypto-scams-fr/master/websites.txt"
        ],
        this.ttl = 86400;
        this.debugging = true;
        this.verifyFreshness();
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


    setIconIdle() {
    }
    setIconReady() {
    }

    getDistantDatabases() {

    //icon  chrome.browserAction.setIcon({'16': 'img/pngredx48.png'}, {});


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

Bk.init();
