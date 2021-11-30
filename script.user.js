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

// get video id from url (example - https://www.youtube.com/watch?v=158plNHX4vw, where 158plNHX4vw is the id)
const videoId = () => (new URLSearchParams(window.location.search)).get('v');

// get like & dislike button holder
const getButtons = () => document.getElementById("menu-container")?.querySelector("#top-level-buttons-computed");

// send request to backend and retrieve dislike count 
// @returns number
function getDislikes() {
    return new Promise(resolve => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `https://antidislikeapi.herokuapp.com/dislikes?id=${videoId()}`, true);
        xhr.onload = () => resolve(JSON.parse(xhr.responseText));
        xhr.onerror = err => console.error(err);
        xhr.send();
    });
}

// check if video has loaded
const videoLoaded = () => document.querySelector(`ytd-watch-flexy[video-id='${videoId()}']`) !== null

// format dislike counts appropriately
function format(input) {
    if (input.length < 4) return input;
    else if (input.length >= 4 && input.length < 7)
        return (parseInt(input) / Math.pow(10, 3)).toFixed(1).toString() + 'K';
    else if (input.length >= 7 && input.length < 10)
        return (parseInt(input) / Math.pow(10, 6)).toFixed(1).toString() + 'M';
    else 
        return (parseInt(input) / Math.pow(10, 9)).toFixed(1).toString() + 'B';
}

// util function to delay loops (performance reasons)
function wait(ms) {
    return new Promise(res => setTimeout(res, ms));
}

async function init() {
    // check if location is a video or not
    if (window.location.href.indexOf("watch?") >= 0) {
        console.log('Location is video');
        let hasLoaded = false;
        const res = await getDislikes();
        console.log(res);
        const dislikes = res.items[0].statistics.dislikeCount;
        while (!hasLoaded) {
            // loop till buttons and video has loaded
            if (getButtons().children[1] && videoLoaded()) {
                hasLoaded = true;
                console.log('loaded dislikes');
                const buttons = getButtons();
                // children[1] = dislikes, [0] = likes
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
