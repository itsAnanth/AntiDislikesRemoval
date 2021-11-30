// ==UserScript==
// @name         YoutubeDislikes
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       AnanthDev
// @match      *://*.youtube.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant GM.xmlHttpRequest
// ==/UserScript==


const videoId = () => (new URLSearchParams(window.location.search)).get('v');


const getButtons = () => document.getElementById("menu-container")?.querySelector("#top-level-buttons-computed");

function getDislikes() {
    return new Promise(resolve => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `https://antidislikeapi.herokuapp.com/dislikes?id=${videoId()}`, true);
        xhr.onload = () => resolve(JSON.parse(xhr.responseText));
        xhr.onerror = err => console.error(err);
        xhr.send();
    });
}

const videoLoaded = () => document.querySelector(`ytd-watch-flexy[video-id='${videoId()}']`) !== null


function format(input) {
    if (input.length < 4) return input;
    else if (input.length >= 4 && input.length < 7)
        return (parseInt(input) / Math.pow(10, 3)).toFixed(1).toString() + 'K';
    else if (input.length >= 7 && input.length < 10)
        return (parseInt(input) / Math.pow(10, 6)).toFixed(1).toString() + 'M';
    else 
        return (parseInt(input) / Math.pow(10, 9)).toFixed(1).toString() + 'B';
}

function wait(ms) {
    return new Promise(res => setTimeout(res, ms));
}

async function init() {
    if (window.location.href.indexOf("watch?") >= 0) {
        console.log('Location is video');
        let hasLoaded = false;
        const res = await getDislikes();
        console.log(res);
        const dislikes = res.items[0].statistics.dislikeCount;
        while (!hasLoaded) {
            if (getButtons()?.offsetParent && videoLoaded()) {
                hasLoaded = true;
                console.log('loaded dislikes');
                const buttons = getButtons();
                buttons.children[1].querySelector("#text").innerText = format(String(dislikes));
            } else await wait(200);
        }
    } else console.log('Location not video');
}
(async function () {
    'use strict';
    // to add dislikes when user naviagtes to another video
    window.addEventListener("yt-navigate-finish", init, true);
    // initial state
    init();
})();
