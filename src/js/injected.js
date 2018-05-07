// Define suspicious domain in the popup
console.log('ok');

localizeHTML();
suspiciousDomain    = document.domain;
document.getElementById("suscpicious-domain").innerHTML = suspiciousDomain;

// Add Listeners
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
