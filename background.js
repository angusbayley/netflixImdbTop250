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
  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');
  var tab = chrome.tabs.query({active: true}, function(tabs) {
    var positions = [];
    var resolution = 25;
    var radius = 6;
    var thickness = 2;
    for (var i=0; i<resolution; i++) {
      var x = canvas.width/2 + radius*Math.sin(2*Math.PI*i/resolution);
      var y = canvas.height/2 + radius*Math.cos(2*Math.PI*i/resolution);
      positions[i] = [x,y];
    }
    console.log(positions);

    window.setInterval(function() {
      console.log("setting icon");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for(var i=0; i<resolution/1.5; i++) {
        ctx.arc(positions[i][0], positions[i][1], thickness, 0, 2*Math.PI, false)
        ctx.fillStyle = "rgba(0,200,0,255)";
        ctx.fill();
      }
      chrome.pageAction.setIcon({imageData: ctx.getImageData(0, 0, 19, 19), tabId: tabs[0].id});
    }, 500);
    console.log("icon set");
  });
}

