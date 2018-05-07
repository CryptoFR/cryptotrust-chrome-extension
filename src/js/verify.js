"use strict";

class Verify {

    constructor() {
        this.debugging = true;
        this.debug("🚀 Scanning scammy sites.");
        this.isScammy();
    }

    setIcon(icon) {
        chrome.runtime.sendMessage({type: "icon-change", icon: icon});
    }

    isScammy() {
        chrome.storage.local.get(["scamSites"], (result) => {
            if(result.scamSites.indexOf(document.domain) !== -1) {
                this.debug("🤔 Scammy site.");
                this.setIcon("scam");
                chrome.storage.local.get(["authorized"], (results) => {
                    let authorizedDomains = results.authorized;
                    if(authorizedDomains.indexOf(document.domain) < 0) {
                       this.showPopup();
                    } else {
                        this.debug("Domain " + document.domain + " authorized for this session.");
                    }
                });
            } else {
                this.setIcon("unknown");
            }
        });
    }

    /**
     * Inject the pop-in in current page
     */
    showPopup() {
        window.onload = () => {
            const   suspiciousDomain    = document.domain,
                    SkinCSS             = document.createElement("link");

            SkinCSS.setAttribute("rel", "stylesheet");
            SkinCSS.setAttribute("type", "text/css");
            SkinCSS.setAttribute("href", chrome.extension.getURL("css/injected.css"));
            SkinCSS.onload = () => {
                document.body.innerHTML = document.body.innerHTML + `
                    <div id="overlaycryptofr">
                      <section id="popinwarning">
                        <header><h1><strong>Attention</strong>, site potentiellement malveillant !</h1> <a class="cryptofr" href="https://cryptofr.com/" target="_blank">CryptoFR</a></header>
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
                        <a href="#" id="why-btn" target="_blank">En savoir plus</a>
                        <a href="#" id="i-understand-and-want-to-go-anyway"><span class="not-hover">Je comprends le risque et souhaite accéder malgré tout à la page demandée</span><span class="hover">...on vous aura prévenus ! ¯\\_(ツ)_/¯</span></a>
                      </section>
                    </div>
                    `;
                document.getElementById("suscpicious-domain").innerHTML = suspiciousDomain;
                document.getElementById("i-understand-and-want-to-go-anyway").onclick = () => {
                    chrome.storage.local.get(["authorized"], (results) => {
                        if (typeof results !== "array") { results = []; }
                        results.push(suspiciousDomain);
                        chrome.storage.local.set({ "authorized" : results });
                    });
                    document.getElementById("overlaycryptofr").remove();
                    return false;
                };
                document.getElementById("why-btn").href = `https://cryptofr.com/search?term=${encodeURIComponent(suspiciousDomain)}&in=titles&categories[]=67`;
                setTimeout(() => {
                    document.getElementById("overlaycryptofr").className = "show";
                }, 333);
            };
            document.body.appendChild(SkinCSS);
        };
    }

    debug(message) {
        if(this.debugging === true) {
            console.log(message);
        }
    }
}

const VF = new Verify();
