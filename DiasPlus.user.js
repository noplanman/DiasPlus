// ==UserScript==
// @name        DiasPlus
// @namespace   diasplus
// @description Userscript that adds tweaks to diaspora*.
// @include     *
// @version     1.2
// @copyright   2015 Armando Lüscher
// @author      Armando Lüscher
// @oujs:author noplanman
// @grant       GM_addStyle
// @grant       GM_getValue
// @grant       GM_setValue
// @require     https://code.jquery.com/jquery-1.11.3.min.js
// @homepageURL https://github.com/noplanman/DiasPlus
// @supportURL  https://github.com/noplanman/DiasPlus/issues
// ==/UserScript==

var DiasPlus = {};
DiasPlus.secure = true;
DiasPlus.domain = '';

/**
 * Get the pod URL (protocol + domain).
 * @return {string} The pod URL.
 */
DiasPlus.getPodURL = function () {
  return 'http' + (DiasPlus.secure ? 's' : '') + '://' + DiasPlus.domain;
};

/**
 * The MutationObserver to detect page changes.
 */
DiasPlus.Observer = {

  // The mutation observer objects.
  observers : [],

  /**
   * Add an observer to observe for DOM changes.
   *
   * @param {string}   queryToObserve Query string of elements to observe.
   * @param {function} cb             Callback function for the observer.
   */
  add : function(queryToObserve, cb) {

    // Check if we can use the MutationObserver.
    if ('MutationObserver' in window) {
      var toObserve = document.querySelector(queryToObserve);
      if (toObserve) {
        var mo = new MutationObserver(cb);
        DiasPlus.Observer.observers.push(mo);

        // Observe child changes.
        mo.observe(toObserve, {
          childList: true
        });
      }
    }
  }
};

/**
 * Get the pod info from the GM settings.
 */
DiasPlus.loadPodInfo = function () {
  var podURL = GM_getValue('dplus-pod-url', '');
  DiasPlus.setPodInfo(podURL);
};

/**
 * Set the pod info and save it to the DiasPlus object and the GM settings.
 * @param {string} podURL Pod URL to save.
 */
DiasPlus.setPodInfo = function (podURL) {
  DiasPlus.secure = true;
  DiasPlus.domain = '';
  var info = podURL.split('://');
  if (info.length === 2) {
    DiasPlus.secure = (info[0] === 'https');
    DiasPlus.domain = info[1];
  }
  GM_setValue('dplus-pod-url', DiasPlus.getPodURL());
};

/**
 * Add the "Open on my pod" and settings buttons.
 */
DiasPlus.addOOMPButton = function () {
  // Remove the existing button if it already exists.
  $('.dplus-oomp, .dplus-oomp-settings').remove();

  // Add settings button.
  var $settingsButton = $('<i class="dplus-oomp-settings entypo cog" title="D+ Settings"></i>')
  .click(function(event) {
    var p = prompt('Modify your pod URL (eg. https://diasp.eu)', DiasPlus.getPodURL());
    DiasPlus.setPodInfo(p);
    DiasPlus.addOOMPButton();
  })
  .prependTo('header');

  // If we are not logged into this pod, it must be a foreign one.
  if (!('user' in gon) && location.hostname !== DiasPlus.domain ) {
    var $button = $('<a class="dplus-oomp" target="_self">Open on my pod</a>');

    // Is this the first time we're setting the pod URL?
    if ('' === DiasPlus.domain) {
      $button.click(function() {
        var p = prompt('Your pod has not been defined yet!\n\nEnter your pod domain (eg. https://diasp.eu)', DiasPlus.getPodURL());
        DiasPlus.setPodInfo(p);
        DiasPlus.addOOMPButton();
      });
    } else {
      var url = DiasPlus.getPodURL();

      if ('post' in gon) {
        url += '/posts/' + gon.post.guid;
      } else {
        url += location.pathname;
      }

      $button.attr('href', url);
    }

    $button.prependTo('header');
  }
};

/**
 * Load the JS gon object.
 */
DiasPlus.loadJSgon = function () {
  $('script').each(function() {
    if ($(this).text().search('window.gon={}') > -1) {
      eval($(this).text());
      return;
    }
  });
};

/**
 * Add the extra links to the toolbar.
 */
DiasPlus.addExtraToolbarLinks = function () {
  // Add the "Liked" and "Commented" links to the toolbar.
  var $headerNav = $( '.header-nav' ).append(
    '\n<span><a href="/liked">Liked</a></span>' +
    '\n<span><a href="/commented">Commented</a></span>'
  );

  // Hightlight the background of the active nav item's page.
  $headerNav.find( 'span' ).each(function() {
    var navHref = $( 'a', this ).attr( 'href' );
    if ( navHref === location.href.substring( location.href.length - navHref.length ) ) {
      $( this ).addClass( 'dplus-active' );
    }
  });
};

/**
 * Add button that reverses the order of conversation messages.
 */
DiasPlus.addMessageSortingButton = function() {
  if ($('body').hasClass('page-conversations')) {
    var revMessages = function() {
      $('<a title="Reverse message order"><i class="entypo switch"></i></a>')
      .click(function() {
        $('#conversation_show .stream').html($('#conversation_show .stream_element').get().reverse());
      })
      .prependTo('.control-icons');
    };
    revMessages();
    DiasPlus.Observer.add('#conversation_show', revMessages);
  }
};

// Time when the mouse button was pressed, or false if not pressed.
var md = false;

/**
 * Initialise the "long click tags" feature.
 */
DiasPlus.initLongClickTags = function () {
  // MouseDown and MouseUp actions for the post entry field.
  $('#status_message_fake_text')
  .mousedown(function() {
    md = Date.now();
    DiasPlus.makeTag($(this));
  })
  .mouseup(function() {
    md = false;
  });
};

/**
 * Check if the passed character is not a space or new line character.
 * @param  {string}  c The character to check.
 * @return {Boolean}   True if not a space or new line, else False.
 */
DiasPlus.isValidChar = function (c) {
  return ( undefined !== c && ! /\s/.test( c ) );
};

/**
 * Convert the currently selected word of the passed text area a tag.
 * @param  {jQuery} $textArea The text area to be handled.
 */
DiasPlus.makeTag = function ($textArea) {
  try {
    // Mouse has been released early.
    if (!md) {
      return;
    }

    // Mouse button down long enough? Loop with timeouts until yes.
    if (md + 500 > Date.now()) {
      setTimeout(function() { DiasPlus.makeTag($textArea); }, 50);
    } else if ($textArea instanceof jQuery && $textArea.is('textarea')) {
      // Make sure we have been passed a text area.
      var textAreaText = $textArea.val();
      var cPos1 = $textArea[0].selectionStart;
      var cPos2 = $textArea[0].selectionEnd;

      // Only if there is no selection.
      if (cPos1 === cPos2) {

        // Search for the word end backwards.
        while (--cPos1 >= 0 && DiasPlus.isValidChar(textAreaText[cPos1]));
        cPos1++;

        // Let's handle the tag.
        if (DiasPlus.isValidChar(textAreaText[cPos1])) {
          if (textAreaText[ cPos1 ] === '#') {
            // Looks like we're removing the tag.
            if (DiasPlus.isValidChar(textAreaText[cPos1 + 1]) && textAreaText[cPos1 + 1] !== '#') {
              $textArea.val(textAreaText.substring(0, cPos1) + textAreaText.substring(cPos1 + 1));
              // If we're removing the tag from the left, compensate for the # character.
              (textAreaText[cPos2] === '#') || cPos2--;
            }
          } else {
            // Looks like we're adding the tag.
            $textArea.val(textAreaText.substring(0, cPos1) + '#' + textAreaText.substring(cPos1));
            cPos2++;
          }
          // Set new caret positions.
          $textArea[0].selectionStart = $textArea[0].selectionEnd = cPos2;
        }
      }
      md = false;
    }
  } catch (e) {
    DiasPlus.doLog('Error while making tag.', 'e', false, e);
    md = false;
  }
};

/**
 * Make a log entry.
 * @param {string}  logMessage Message to write to the log console.
 * @param {string}  level      Level to log ([l]og,[i]nfo,[w]arning,[e]rror).
 * @param {boolean} alsoAlert  Also echo the message in an alert box.
 * @param {object}  exception  If an exception is passed too, add that info.
 */
DiasPlus.doLog = function (logMessage, level, alsoAlert, e) {
  // Default to "log" if nothing is provided.
  level = level || 'l';

  // Add exception details if available.
  if (e instanceof Error) {
    logMessage += ' (' + e.name + ': ' + e.message + ')';
  }

  switch (level) {
    case 'l' : console.log(  logMessage); break;
    case 'i' : console.info( logMessage); break;
    case 'w' : console.warn( logMessage); break;
    case 'e' : console.error(logMessage); break;
  }
  if (alsoAlert) {
    alert(logMessage);
  }
};

/**
 * Start the party.
 */
DiasPlus.init = function () {
  // Make sure we're on a diaspora* pod.
  if ($('meta[name="description"]').attr('content') !== 'diaspora*') {
    return;
  }

  // Add the global CSS rules.
  GM_addStyle(
    '.header-nav .dplus-active { background-color: rgba(255,255,255,.1); }' +
    '.dplus-oomp { background: #00de00 !important; padding: 3px 9px; margin-left: 10px; border: 1px solid #006f00; border-radius: 5px; color: #006f00; float: left; cursor: pointer; }' +
    '.dplus-oomp-settings { float: left; color: #006f00; font-size: 20px; margin: 4px; cursor: pointer; }' +
    '.page-conversations .control-icons a { cursor: pointer; display: inline-block !important; }'
  );

  // Load the pod infos from the GM settings.
  DiasPlus.loadPodInfo();

  // Load the gon JS variable.
  DiasPlus.loadJSgon();

  // Load all the features.
  DiasPlus.initLongClickTags();
  DiasPlus.addExtraToolbarLinks();
  DiasPlus.addOOMPButton();
  DiasPlus.addMessageSortingButton();
};

// source: https://muffinresearch.co.uk/does-settimeout-solve-the-domcontentloaded-problem/
if (/(?!.*?compatible|.*?webkit)^mozilla|opera/i.test(navigator.userAgent)) { // Feeling dirty yet?
  document.addEventListener('DOMContentLoaded', DiasPlus.init, false);
} else {
  window.setTimeout(DiasPlus.init, 0);
}
