// Some global variables to keep state.
var need_a_hand_enabled = false;
var tab_has_hand = {};
console.log('Hands On')

// Inject necessary JS to initialize the hand.
// 
// tab: chrome.Tab
// finished: function(Tab) { }
var inject_hand = function(tab, finished) {
  if (tab_has_hand[tab.id]) {
    finished(tab);
    return;
  }

  if (tab.url.search(/^http/) != -1) {
    chrome.tabs.executeScript(tab.id, {file: 'jquery-1.7.1.min.js'}, function() {
      chrome.tabs.executeScript(tab.id, {file: 'needahand.js'}, function() {
        tab_has_hand[tab.id] = true;            
        finished(tab);
      });
    });          
  }
};

// Sets the status of the hand in the tab.
//
// tab: chrome.Tab
// enabled: boolean.
var set_hand_on_tab = function(tab, enabled) {
  if (enabled) {
    inject_hand(tab, function(tab) {
      chrome.tabs.sendRequest(tab.id, {need_a_hand: enabled});          
    });
  } else {
    chrome.tabs.sendRequest(tab.id, {need_a_hand: enabled});
  }
};

chrome.browserAction.onClicked.addListener(function(ignored_tab) {
  chrome.windows.getAll({'populate': true}, function(windows) {
    need_a_hand_enabled = !need_a_hand_enabled;    
    if (need_a_hand_enabled) {
      chrome.browserAction.setIcon({path: 'icon32-on.png'});
    } else {
      chrome.browserAction.setIcon({path: 'icon32.png'});
    }

    for (var w = 0; w < windows.length; w++) {
      var win = windows[w];
      for (var t = 0; t < win.tabs.length; t++) {
        var tab = win.tabs[t];
        set_hand_on_tab(tab, need_a_hand_enabled);
      }
    }
  });
});

chrome.tabs.onUpdated.addListener(function(tab_id, change_info, tab) {
  // If this page is loading, we need to reload the javascript again.
  if (change_info.status == 'loading') {
    tab_has_hand[tab_id] = false;
    return;
  }

  // If this is page completed loading, update the hand status.
  if (change_info.status == 'complete') {
    if (tab.url && tab.url.search(/^http/) != -1) {
      set_hand_on_tab(tab, need_a_hand_enabled);    
    }
  }
});
