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

DiasPlus.addOpenPodButton = function () {
  // If we are not logged into this pod, it must be a foreign one.
  if (!('user' in gon) && location.hostname !== DiasPlus.domain ) {
    var $button = $('<a class="dplus-open-on-my-pod" target="_self">Open on my pod</a>');

    if ('' === DiasPlus.domain) {
      $button.click(function() {
        alert('Your pod has not been defined yet!\n\nBe sure to configure it in the user script settings.\n\nMore info at: https://j.mp/DiasPlus');
      });
    } else {
      var url = 'http' + (DiasPlus.secure ? 's' : '') + '://' + DiasPlus.domain;

      if ('post' in gon) {
        url += '/posts/' + gon.post.guid;
      } else {
        url += location.pathname;
      }

      $button.attr('href', url);
    }

    $button.prependTo($('header'));
  }
};

DiasPlus.loadJSgon = function () {
  $('script').each(function() {
    if ($(this).text().search('window.gon={}') > -1) {
      eval($(this).text());
      return;
    }
  });
};

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
    '.dplus-open-on-my-pod { background: #00de00 !important; padding: 3px 9px; margin-left: 10px; border: 1px solid #006f00; border-radius: 5px; color: #006f00; float: left; cursor: pointer; }'
  );

  // Load the gon JS variable.
  DiasPlus.loadJSgon();

  DiasPlus.secure = true;
  DiasPlus.domain = GM_getValue('dplus-domain', null);
  if (null === DiasPlus.domain) {
    DiasPlus.domain = prompt('Diaspora* pod domain');
    GM_setValue('dplus-domain', DiasPlus.domain);
  }
  DiasPlus.initLongClickTags();
  DiasPlus.addExtraToolbarLinks();
  DiasPlus.addOpenPodButton();
};

// source: https://muffinresearch.co.uk/does-settimeout-solve-the-domcontentloaded-problem/
if (/(?!.*?compatible|.*?webkit)^mozilla|opera/i.test(navigator.userAgent)) { // Feeling dirty yet?
  document.addEventListener('DOMContentLoaded', DiasPlus.init, false);
} else {
  window.setTimeout(DiasPlus.init, 0);
}
