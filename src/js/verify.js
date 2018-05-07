"use strict";

class Verify {

    constructor() {
        this.debugging = true;
        this.isScammy();
    }

    isScammy() {
      this.debug("🚀 Scanning scammy sites.");
        chrome.storage.local.get(["scamSites"], (result) => {
            if(result.scamSites.indexOf(document.domain) !== -1) {
                this.debug("🤔 Scammy site.");
                this.setIcon("scam");

                chrome.storage.local.get(["authorized"], (results) => {
                    let authorizedDomains = results.authorized;
                    if(authorizedDomains.indexOf(document.domain) < 0) {
                       this.showMessage();
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
    async showMessage() {
      await this.pageLoaded();
      await this.injectCSS("css/injected.css");
      await this.injectHTML("html/injected.html");
      await this.injectJS("js/injected.js");
      this.translate();
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
            resolve(true);
        })
        .catch((err) => {
          reject("Fetch HTML " + err);
        });

      });
    }
    async injectJS(filename) {
      return new Promise((resolve, reject) => {
        var jsFile = document.createElement("script")
        jsFile.src = chrome.extension.getURL(filename);
        if( !document.body.appendChild(jsFile)){
          throw new Error('appendChild JS not possible now');
        } else {
         jsFile.onload = () => {
           console.log("JS injected");
           resolve(true);
         }
       }
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
