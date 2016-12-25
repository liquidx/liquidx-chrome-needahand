(function() {
  if (typeof(window.need_a_hand_initialized) != 'undefined') {
      console.log('Need a hand alreay initialized.');   
    return;
  }

  window.need_a_hand_initialized = false;
  window.need_a_hand_enabled = false;
  window.need_a_hand_leftie = false;

  window.need_a_hand_init = function() {
    // Prevent double initialization.
    if (window.need_a_hand_initialized) {
      return;
    }

    window.need_a_hand_initialized = true;

    // Add the hand.
    var container = $('<div id="need-a-hand-container"></div>');
    var hand_image_url = null;
    var hand_metrics = {};
    var hand_image_size = {width: 1000, height: 1600};
    if (window.need_a_hand_leftie) {
      hand_image_url = chrome.extension.getURL('lefthand.png');
      hand_metrics = { 'left': 0.770, 'top': 0.02 };
    } else {
      hand_image_url = chrome.extension.getURL('righthand.png');
      hand_metrics = { 'left': 0.185, 'top': 0.02 };
    }
    container.css({
      'position': 'fixed',
      'width': '100%',
      'height': '100%',
      'top': 0,
      'left': 0,
      'display': 'none',
      'pointer-events': 'none',
      'z-index': 10000000,
    });

    var hand_image = $('<img id="need-a-hand-image" src="' + hand_image_url + '" />');
    hand_image.css({
      'position': 'absolute',
      'left': 0,
      'top': 0,
      'width': '9in',
      'height': '14.4in',      
    });
    container.append(hand_image);
    container.click(function(e) {
      // Ignore all click events.
      return false;
    });
    $('body').append(container);

    // Hook up the movement handler.
    var movement_handler = function(e, move_or_down_or_up) {
      if (window.need_a_hand_enabled) {
        var window_x = e.originalEvent.clientX;
        var window_y = e.originalEvent.clientY;
        
        var hand = $('#need-a-hand-image');
        var hand_width = hand.width();
        var hand_height = hand.height();
        var hand_x = (window_x - hand_metrics.left * hand_width);
        var hand_y = (window_y - hand_metrics.top * hand_height);
        var scale = 1;
        if (move_or_down_or_up == 'down') {
          scale = 0.98;
        }
        $('#need-a-hand-container').css({'display': 'block'});
        $('#need-a-hand-image').css({
          '-webkit-transform': 'scale(' + scale + ', ' + scale + ') ' +
                               'translate(' + (hand_x / scale) + 'px, ' + (hand_y / scale) + 'px)',
        });
      } else {
        $('#need-a-hand-container').css({'display': 'none'});
      }
    };

    $(window).mousemove(function(e) {
      movement_handler(e, 'move');
    });

    $(window).mousedown(function(e) {
      movement_handler(e, 'down');
    });

    $(window).mouseup(function(e) {
      movement_handler(e, 'up');
    });

    $(window).mouseleave(function(e) {
      $('#need-a-hand-container').css({'visibility': 'hidden'});
    });

    $(window).mouseenter(function(e) {
      $('#need-a-hand-container').css({'visibility': 'visible'});      
    });

  };

  chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {
      if (typeof(request.need_a_hand) == 'undefined') {
        return;
      }
      if (request.need_a_hand) {
        window.need_a_hand_init();
        window.need_a_hand_enabled = true;         
      } else {
        window.need_a_hand_enabled = false;
        $('#need-a-hand-container').css({'display': 'none'});
      }
    });
})();

