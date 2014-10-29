// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// When the extension is installed or upgraded ...
chrome.runtime.onInstalled.addListener(function() {
  // Replace all rules ...
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    // With a new rule ...
    chrome.declarativeContent.onPageChanged.addRules([
      {
        // That fires when a page's URL contains a 'g' ...
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { urlContains: 'netflix.com' },
          })
        ],
        // And shows the extension's page action.
        actions: [ new chrome.declarativeContent.ShowPageAction() ]
      }
    ]);
  });
});

//console.log("backgound.js checking in");

chrome.pageAction.onClicked.addListener(function() {
  console.log("clicked!");
  chrome.tabs.executeScript({file: "contentScript.js"});
  startLoad();
});

function startLoad() {
  // var canvas = document.getElementById('canvas');
  // var ctx = canvas.getContext('2d');
  console.log("startLoad working");
  var cl = new CanvasLoader('canvas');
  cl.setDiameter(30); // default is 40
  cl.setDensity(42); // default is 40
  cl.setRange(0.5); // default is 1.3
  cl.show(); // Hidden by default
  ctx = document.getElementById('canvas').getContext('2d');
  var tab = chrome.tabs.query({active: true}, function(tabs) {
    window.setInterval(function() {
      console.log("setting icon");  
      chrome.pageAction.setIcon({imageData: ctx.getImageData(0, 0, 19, 19), tabId: tabs[0].id});
    }, 50);
    console.log("icon set");
  });
}

