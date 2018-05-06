
var Mallory = {
    instance:null,
    url: "https://raw.githubusercontent.com/CryptoFR/crypto-scams-fr/master/websites.txt",
    ttl: 86400,
    debugging : true,

    init : function(){

      Mallory.debug("Scanning scammy sites.");
      Mallory.verifyFreshness();
      Mallory.isMallory();
    },
    verifyFreshness : function(){
      // Verify Storage and freshness
      chrome.storage.local.get(['lastDownload'], function(result) {
        Mallory.debug("Timestamp " + result.lastDownload);
        if(result.lastDownload === undefined || result.lastDownload + Mallory.ttl < Number.parseInt(Date.now()/1000, 0)) {
          Mallory.getDistantDatabase();
        }
      });

    },
    getDistantDatabase: function(){
      // FIXME : ugly pooling
      var xmlhttp;
      xmlhttp = new XMLHttpRequest();
      xmlhttp.onreadystatechange = function(){
          if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
              chrome.storage.local.set({"lastDownload":  Mallory.timestamp()});
              chrome.storage.local.set({"scamSites": xmlhttp.responseText});
          }
      }
      xmlhttp.open("GET", Mallory.url, true);
      xmlhttp.send();
    },
    isMallory: function(){
      return chrome.storage.local.get(['scamSites'], function(result){
        if(result.scamSites.indexOf(document.domain) != -1) {
          console.log('🚀');
          console.log('🤔 Scammy site.');
          Mallory.showPopup();
        }
      });

    },
    showPopup: function(){
      window.onload=function(){
        var expage = document.location.href;
        document.location.href = chrome.extension.getURL('scam.html')
      };
    },
    timestamp: function(){
      return Number.parseInt(Date.now()/1000, 0);
    },
    debug: function(message) {
      if(Mallory.debugging === true) {
        console.log(message);
      }
    }
};
Mallory.init();
