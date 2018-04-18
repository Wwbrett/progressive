/** Sets up variables for use */
var $ = jQuery = require('jquery');
require('./bootstrap_custom.js');
var Handlebars = require('handlebars');

// Function to run when the page is ready
$(function() {
  var topOffset = 50;  // offset to take into account the navigation bar being stickied to the top of the page

  /** if the browser can handle them then register a new service worker */
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('./service-worker.js')
      .then(function() {
        console.log("Service worker active");
      })
  }

  /** Asks user for permission to send them notifications, will only be done if they have not already given permission */
  if (Notification.permission !== 'granted') {
    Notification.requestPermission(function(status) {
      console.log('Notification permission status: ', status);
    });
  }

  /** Parse JSON data from location and use the Mustache templating system to dynamically load into sections of index.html */
  $.getJSON('/data/pets.json', function(data) {
    /** gets the location of slideshow template in html file and compiles template using provided JSON */
    var slideshowTemplate = $('#slideshow-template').html();
    var slideshowScript = Handlebars.compile(slideshowTemplate);

    /** gets the location of adoption template in html file and compiles template using provided JSON */
    var adoptionTemplate = $('#adoption-template').html();
    var adoptionScript = Handlebars.compile(adoptionTemplate);

    /** gets the location of appointments template in html file and compiles template using provided JSON */
    var appointmentsTemplate = $('#appointments-template').html();
    var appointmentsScript = Handlebars.compile(appointmentsTemplate);

    /** Fades out the loader once everything is done */
    $('.loader').fadeOut(1000);

    /** Append the compiled JSON data to html file in the specified locations */
    $('#slideshow-content').append(slideshowScript(data));
    $('#adoption-content').append(adoptionScript(data));
    $('#appointments-content').append(appointmentsScript(data));

    /** Replace carousel image with background image */
    $('#slideshow .item img').each(function() {
      var imgSrc = $(this).attr('src');
      $(this).parent().css({
        'background-image': 'url(' + imgSrc + ')'
      });
      $(this).remove();
    });

    /** Remove pausing when mouse is hovering the carousel */
    $('.carousel').carousel({
      pause: false
    });
  });

  /** When reload button is clicked then reload the page, this is used to refresh the service worker and remove cached resources */
  $('.reload').click(function() {
    window.location.reload();
  });

  /** Scrollspy for full size navbar */
  $('.navbar-fixed-top').on('activate.bs.scrollspy', function() {
    var hash = $(this).find('li.active a').attr('href');
    if (hash !== '#slideshow') {
      $('header nav').addClass('inbody');
    } else {
      $('header nav').removeClass('inbody');
    }
  });

  /**
  Generates modals when an image is clicked, this is to reduce load times
    petname: The name of the tour step
    petbreed: The location of the tour step
    petowner: Category that the tour step falls under
    petinfo: a short description of tour step
    petimage: A .jpg image of the location/ a slide to help with what to do
   */
  $(document).on('click', '.openpetmodal', function() {
    $('.modal-petname').html($(this).data('petname'));
    $('.modal-petbreed').html($(this).data('petbreed'));
    $('.modal-petowner').html($(this).data('petowner'));
    $('.modal-petinfo').html($(this).data('petinfo'));
    $('.modal-petimage').attr('src', '/images/pets/' + $(this).data('petimage') + '.jpg');
    $('.modal-petimage').attr('alt', $(this).data('petname') + ' Photo');
  });

  /** When a task is compete and the complete button is clicked send a push notification letting the user know that they should continue. If they have not allowed notifications then it will not send. There is no way around this */
  $('.btnCustom').click(function() {
    console.log("Task Completed");
    if (Notification.permission === 'granted') {
      console.log("Showing notification...");
      const title = "Task Complete";
      const options = {
        body: "You have completed one of the tasks you were assigned\nOpen the site to view your next task",
        icon: "images/icons/icon-256x256.png",
        badge: "images/icons/icon-128x128.png",
        vibrate: [500,110,500,110,450,110,200,110,170,40,450,110,200,110,170,40,500]  //Star Wars vibration pattern
      }
      navigator.serviceWorker.getRegistration()
        .then(function(reg) {
          reg.showNotification(title, options);
          console.log("...done");
        });
    }
  });

  /** Runs scrollspy in the body of the page and changes  .navbar accordingly */
  $('body').scrollspy({
    target: 'header .navbar',
    offset: topOffset
  });
}); //Page Ready
