
var cryptotrust = {

    url: "https://raw.githubusercontent.com/CryptoFR/crypto-scams-fr/master/websites.txt",

    ttl: 86400,

    debugging : true,

    init : function(){

      cryptotrust.debug("🚀 Scanning scammy sites.");
      cryptotrust.verifyFreshness();
      cryptotrust.iscryptotrust();

    },
    verifyFreshness : function(){

      // Verify Storage and freshness
      chrome.storage.local.get(['lastDownload'], function(result) {
        cryptotrust.debug("Timestamp " + result.lastDownload);
        if(result.lastDownload === undefined || result.lastDownload + cryptotrust.ttl < Number.parseInt(Date.now()/1000, 0)) {
          cryptotrust.getDistantDatabase();
        }
      });

    },
    getDistantDatabase: function(){

      // FIXME : ugly pooling -> api ?
      var xmlhttp;
      xmlhttp = new XMLHttpRequest();

      xmlhttp.onreadystatechange = function(){
          if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
              chrome.storage.local.set({"lastDownload":  cryptotrust.timestamp()});
              chrome.storage.local.set({"scamSites": xmlhttp.responseText});
          }
      }

      xmlhttp.open("GET", cryptotrust.url, true);
      xmlhttp.send();

    },
    iscryptotrust: function(){

      chrome.storage.local.get(['scamSites'], function(result){
        if(result.scamSites.indexOf(document.domain) != -1) {
          console.log('🤔 Scammy site.');
          cryptotrust.showPopup();
        }
      });

    },
    showPopup: function(){

      window.onload=function(){
        var expage = document.location.href;
        document.location.href = chrome.extension.getURL('scam.html');
      };

    },
    timestamp: function(){

      return Number.parseInt(Date.now()/1000, 0);

    },
    debug: function(message) {

      if(cryptotrust.debugging === true) {
        console.log(message);
      }

    }
};
cryptotrust.init();
