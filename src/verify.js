"use strict";

class Verify {

    init() {
        this.urls = [
            "https://raw.githubusercontent.com/CryptoFR/crypto-scams-fr/master/websites.txt"
        ],
        this.ttl = 86400;
        this.debugging = true;
        this.debug("🚀 Scanning scammy sites.");
        this.verifyFreshness();
        this.isScammy();
    }

    /**
     * Verify Storage and freshness
     */
    verifyFreshness() {
        chrome.storage.local.get(["lastDownload"], (result) => {
            if(typeof result.lastDownload === "undefined"
                || result.lastDownload + this.ttl < Number.parseInt(Date.now()/1000, 0)) {
                this.getDistantDatabases();
            } else {
              this.debug("Timestamp " + result.lastDownload);
            }
        });
    }

    getDistantDatabases() {
      // FIXME : ugly pooling -> api ?
      const xmlhttp = new XMLHttpRequest();

      xmlhttp.onreadystatechange = () => {
          if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
              chrome.storage.local.set({"lastDownload": this.timestamp()});
              chrome.storage.local.set({"scamSites": xmlhttp.responseText});
              // Re-test current page after download
              this.isScammy();
          }
      };

      xmlhttp.open("GET", this.urls[0], true);
      xmlhttp.send();
    }

    isScammy() {
        chrome.storage.local.get(["scamSites"], (result) => {
            if(result.scamSites.indexOf(document.domain) != -1) {
                this.debug("🤔 This is a scam site.");
                this.showPopup();
            }
        });
    }

    /**
     * Inject the pop-in in current page
     */
    showPopup() {
        window.onload = () => {
            const   exactUrl            = document.location.href,
                    suspiciousDomain    = document.domain,
                    SkinCSS             = document.createElement("link");

            SkinCSS.setAttribute("rel", "stylesheet");
            SkinCSS.setAttribute("type", "text/css");
            SkinCSS.setAttribute("href", chrome.extension.getURL("css/popin.css"));
            SkinCSS.onload = () => {

                document.body.innerHTML = document.body.innerHTML + `
                    <div id="overlaycryptofr">
                      <div id="popinwarning">
                        <h1><strong>Attention</strong>, site potentiellement malveillant !</h1>
                        <div class="topcontent">
                          <div class="warning-sign">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48px" height="48px" viewBox="0 0 48 48" xml:space="preserve">
                              <path style="fill:#ffffff;fill-rule:nonzero;stroke:#ffffff;stroke-width:5.0000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4.0000000;stroke-dasharray:none" d="M 24.000000,9.0000000 L 7.0000000,39.000000 L 41.000000,39.000000 L 24.000000,9.0000000 z " />
                              <path style="fill:#b52020;fill-rule:nonzero;stroke:none;stroke-miterlimit:4.0000000" d="M 24.000000,10.000000 L 8.0000000,38.000000 L 40.000000,38.000000 L 24.000000,10.000000 z " />
                              <path d="M 22.000000,29.000000 L 21.000000,18.000000 L 27.000000,18.000000 L 26.000000,29.000000 L 22.000000,29.000000 z " style="fill:#ffffff;fill-rule:nonzero;stroke:none;stroke-miterlimit:4.0000000" />
                              <path style="fill:#fff;fill-opacity:1.0000000;fill-rule:evenodd;stroke:none;stroke-width:1.0000000px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1.0000000" d="M 26.968750 32.000000 A 2.9687500 3.0156250 0 1 1  21.031250,32.000000 A 2.9687500 3.0156250 0 1 1  26.968750 32.000000 z" transform="translate(-3.125000e-2,1.984375)" />
                            </svg>
                          </div>
                          <p class="intro">Le domaine <span id="suscpicious-domain">example.com</span> a été signalé par la communauté <a class="cryptofr" href="https://cryptofr.com/" target="_blank">CryptoFR</a> comme étant dangereux.</p>
                        </div>
                        <a href="#" id="i-understand-and-want-to-go-anyway"><span class="not-hover">Je comprends le risque et souhaite accéder malgré tout à la page demandée</span><span class="hover">...on vous aura prévenus ! ¯\\_(ツ)_/¯</span></a>
                      </div>
                    </div>
                    `;
                document.getElementById("suscpicious-domain").innerHTML = suspiciousDomain;
                document.getElementById("i-understand-and-want-to-go-anyway").href = exactUrl;
                document.getElementById("overlaycryptofr").className = "show";
            };
            document.body.appendChild(SkinCSS);
        };
    }

    timestamp() {
        return Number.parseInt(Date.now()/1000, 0);
    }

    debug(message) {
        if(this.debugging === true) {
            console.log('Cryptotrust : ' + message);
        }
    }
}

const VF = new Verify();

VF.init();
