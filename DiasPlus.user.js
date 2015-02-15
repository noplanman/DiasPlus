// ==UserScript==
// @name        DiasPlus
// @namespace   diasplus
// @description Userscript that adds tweaks to Diaspora*.
// @include     https://*diasp.eu*
// @version     1.0
// @copyright   2015 Armando Lüscher
// @author      Armando Lüscher
// @oujs:author noplanman
// @grant       none
// @homepageURL https://github.com/noplanman/DiasPlus
// @supportURL  https://github.com/noplanman/DiasPlus/issues
// ==/UserScript==

/**
 * Be sure to update '@include' on line 5 above to match your Diaspora* pod!
 * Simply replace 'diasp.eu' with your pod domain :-)
 */

// If jQuery is available, run everything as soon as the DOM is set up.
if ( 'jQuery' in window ) jQuery( document ).ready(function( $ ) {

  // Add CSS styles.
  addCSS();

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

  /**
   * Add the required CSS rules.
   */
  function addCSS() {
    // Add the styles to the head.
    $( '<style>' ).html(
      '.header-nav .dplus-active { background-color: rgba(255,255,255,.1); }'
    ).appendTo( 'head' );
  }

  /**
   * Make a log entry.
   * @param {string}  logMessage Message to write to the log console.
   * @param {string}  level      Level to log ([l]og,[i]nfo,[w]arning,[e]rror).
   * @param {boolean} alsoAlert  Also echo the message in an alert box.
   * @param {object}  exception  If an exception is passed too, add that info.
   */
  function doLog( logMessage, level, alsoAlert, e ) {
    // Default to "log" if nothing is provided.
    level = level || 'l';

    // Add exception details if available.
    if ( e instanceof Error ) {
      logMessage += ' (' + e.name + ': ' + e.message + ')';
    }

    switch( level ) {
      case 'l' : console.log(   logMessage ); break;
      case 'i' : console.info(  logMessage ); break;
      case 'w' : console.warn(  logMessage ); break;
      case 'e' : console.error( logMessage ); break;
    }
    if ( alsoAlert ) {
      alert( logMessage );
    }
  }
});