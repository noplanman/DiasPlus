// ==UserScript==
// @name        DiasPlus
// @namespace   diasplus
// @description Userscript that adds tweaks to diaspora*.
// @include     *
// @version     1.2
// @copyright   2015 Armando Lüscher
// @author      Armando Lüscher
// @oujs:author noplanman
// @grant       none
// @homepageURL https://github.com/noplanman/DiasPlus
// @supportURL  https://github.com/noplanman/DiasPlus/issues
// ==/UserScript==

// If we're on a diaspora* pod and jQuery is available, run everything as soon as the DOM is set up.
if ( ( 'Diaspora' in window ) && ( 'jQuery' in window ) ) jQuery( document ).ready(function( $ ) {

  /**
   * BE SURE TO ENTER YOUR CUSTOM POD DOMAIN HERE!!!
   *
   * secure: True => https, False => http
   * domain: Enter just your pod domain. (e.g. joindiaspora.com, diasp.eu)
   */
  var MyDiasPlus = {
    secure: true,
    domain: ''
  };

  // If we are not logged into this pod, it must be a foreign one.
  if ( ! ( 'user' in gon ) && location.hostname !== MyDiasPlus.domain ) {
    var $button = $('<a target="_self">Open on my pod</a>')
    .css({
      backgroundColor: 'rgb(0,222,0)',
      padding: '3px 9px',
      marginLeft: '10px',
      border: '1px solid rgb(0,111,0)',
      borderRadius: '5px',
      color: 'rgb(0,111,0)',
      float: 'left',
      cursor: 'pointer'
    });

    var addButton = true;
    if ( '' === MyDiasPlus.domain ) {
      $button.click(function(){
        alert('Your pod has not been defined yet!\n\nBe sure to configure it in the user script directly.\n\nMore info at: https://j.mp/DiasPlus');
      });
    } else {
      var url = 'http' + ( MyDiasPlus.secure ? 's' : '' ) + '://' + MyDiasPlus.domain;
      switch ( Diaspora.Page ) {
        case 'PostsShow' :
          url += '/posts/' + gon.post.guid;
          break;
        case 'PeopleShow' :
          var url2 = $('.profile_photo a').attr('href');
          // Remove '/photos' from the end of the URL.
          url += url2.substring(0,url2.length-7);
          break;
        case 'TagsShow' :
          url += '/' + Backbone.history.fragment;
          break;
        default :
          addButton = false;
      }

      $button.attr( 'href', url )
    }

    if ( addButton ) {
      $button.prependTo( $('header') );
    }

    return;
  }

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



  // Time when the mouse button was pressed, or false if not pressed.
  var md = false;

  /**
   * Check if the passed character is not a space or new line character.
   * @param  {string}  c The character to check.
   * @return {Boolean}   True if not a space or new line, else False.
   */
  var isValidChar = function( c ) {
    return ( undefined !== c && ! /\s/.test( c ) );
  };

  /**
   * Convert the currently selected word of the passed text area a tag.
   * @param  {jQuery} $textArea The text area to be handled.
   */
  var makeTag = function( $textArea ) {
    try {
      // Mouse has been released early.
      if ( ! md ) return;

      // Mouse button down long enough? Loop with timeouts until yes.
      if ( md + 500 > Date.now() ) {
        setTimeout( function() { makeTag( $textArea ); }, 50 );
      } else if ( $textArea instanceof jQuery && $textArea.is( 'textarea' ) ) {
        // Make sure we have been passed a text area.
        var textAreaText = $textArea.val();
        var cPos1 = $textArea[0].selectionStart;
        var cPos2 = $textArea[0].selectionEnd;

        // Only if there is no selection.
        if ( cPos1 === cPos2 ) {

          // Search for the word end backwards.
          while ( --cPos1 >= 0 && isValidChar( textAreaText[ cPos1 ] ) );
          cPos1++;

          // Let's handle the tag.
          if ( isValidChar( textAreaText[ cPos1 ] ) ) {
            if ( textAreaText[ cPos1 ] === '#' ) {
              // Looks like we're removing the tag.
              if ( isValidChar( textAreaText[ cPos1 + 1 ] ) && textAreaText[ cPos1 + 1 ] !== '#' ) {
                $textArea.val( textAreaText.substring( 0, cPos1 ) + textAreaText.substring( cPos1 + 1 ) );
                // If we're removing the tag from the left, compensate for the # character.
                ( textAreaText[ cPos2 ] === '#' ) || cPos2--;
              }
            } else {
              // Looks like we're adding the tag.
              $textArea.val( textAreaText.substring( 0, cPos1 ) + '#' + textAreaText.substring( cPos1 ) );
              cPos2++;
            }
            // Set new caret positions.
            $textArea[0].selectionStart = $textArea[0].selectionEnd = cPos2;
          }
        }
        md = false;
      }
    } catch ( e ) {
      doLog( 'Error while making tag.', 'e', false, e );
      md = false;
    }
  };

  // MouseDown and MouseUp actions for the post entry field.
  $( '#status_message_fake_text' )
  .mousedown(function() {
    md = Date.now();
    makeTag( $( this ) );
  })
  .mouseup(function() {
    md = false;
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
