//////////////////////////////////////////////////////////
//BACK END
//////////////////////////////////////////////////////////

//Connect to Google Firebase
var config = {
  apiKey: "AIzaSyC-0gBpvyFuIYL8gPMjvYx4WsczuEPzhwA",
  authDomain: "turtle-hero.firebaseapp.com",
  databaseURL: "https://turtle-hero.firebaseio.com",
  projectId: "turtle-hero",
  storageBucket: "",
  messagingSenderId: "519761034904"
};

//Initialize the default Firebase app
firebase.initializeApp(config);

// Initialize the Firebase database
var database = firebase.database();

//Initialize Firebase authentication
firebase.auth().signInAnonymously().catch(function(error) {
  //Handle errors
  var errorCode = error.code;
  var errorMessage = error.message;
  if (errorCode === 'auth/operation-not-allowed') {
    alert('You must enable anonymous authentication in the Firebase Console.');
  } else {
    console.error(error);
  }
});

//Create anonymous user account
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    var isAnonymous = user.isAnonymous;
    var uid = user.id;
  }
});

//Start app
function startUp() {
  if (window.mapsLoaded = false) {
    detectBrowser();
  }
};

function notInitMap() {
  if (window.mapsLoaded = true) {
    detectBrowser();
  }
};

//Geolocation (Google Maps API key: AIzaSyA4PbxtjFAOdO90WsLjM_SXs_sfUEb7OM0)
var map, infoWindow;
var marker;

// Geolocation errors
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
    'Error: We can\'t get your location.  Please refresh and accept.' :
    'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
}

// Detect user browser
function detectBrowser() {
  var useragent = navigator.userAgent;
  var mapdiv = document.getElementById('map');

  if (useragent.indexOf('iPhone') != -1 || useragent.indexOf('Android') != -1) {
    mapdiv.style.width = '100%';
    mapdiv.style.height = '200px';
  } else {
    mapdiv.style.width = '100%';
    mapdiv.style.height = '100%';
  }
};

//Create turtle object
var turtles = {};

firebase.database().ref().on("child_added", function(snapshot) {
  var turtleLoc = createTurtleMap();

  function createTurtleMap(obj) {
    var turtleLat = snapshot.val().Lat;
    var turtleLng = snapshot.val().Long;
    var searchTerm = turtleLat + ", " + turtleLng;
    searchTerm = encodeURIComponent(searchTerm);
    var iframe = document.createElement("iframe");
    iframe.classList.add("map");
    iframe.src = "https://www.google.com/maps/embed/v1/search?q=" + searchTerm + "&key=AIzaSyChwGcg2hUOX9Uh_qNr8KHMJcenJf0svv8&zoom=18";
    return iframe;
  }
  var block = '<div id="fullCard" class="col s12 m6"><div id="turtle" class="card hoverable show"><div class="card-image"><div id="map" class="col s12 center-align">' + $(turtleLoc).prop('outerHTML') + '</div></div><div class="card-content"><span id="number" class="card-title activator green-text"><i class="material-icons right">more_vert</i></span><h5 id="reported" class="green-text">Reported ' + snapshot.val().time + '</h5></div><div class="card sticky-action"><div class="card-action right-align"><button id="next-stage-btn" class="card-button green btn-flat yellow-text waves-effect waves-light" type="button" name="button">Done</button></div></div><div class="card-reveal"><span class="card-title green-text">Comment<i class="material-icons right">close</i></span><p id="comment">' + snapshot.val().comment + '</p></div></div></div>';
  $("#tab1-heading").attr('class', 'no-card hide');
  $("#tab1").prepend(block);
});

//Set turtle value to database
firebase.database().ref().on("value", function(snapshot) {
  turtles = snapshot.val();
});

//Validate form
function validate() {
  if ($("#name-input").val() == "") {
    Materialize.toast("Please provide your name.", 2000);
    $.thisBreaksTheForm.database;
    return false;
  }

  if ($("#phoneNumber-input").val() == "") {
    Materialize.toast("Please provide a valid phone number.", 2000);
    $.thisBreaksTheForm.database;
    return false;
  }

  return (true);
};

//Reset form
function resetForm() {
  $("#comment-input").val("");
  $("#name-input").val("");
  $("#phoneNumber-input").val("");
}

//Send locatoin
$("#send").on("click", function(event) {
  event.preventDefault();
  validate();
  $('#modal').modal('close');
  saveLocation();
  Materialize.toast("Your report has been sent.", 2000);
});

function saveLocation(id) {
  
  map = new google.maps.Map(document.getElementById('map'), {
    disableDefaultUI: true,
    zoomControl: false,
    streetViewControl: false,
    scaleControl: false

  });

  //Use HTML5 geolocation
  if (navigator && navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      var turtleStatus = "reported";
      marker = new google.maps.Marker({
        postion: pos,
        map: map,
        disableDefaultUI: true,
        animation: google.maps.Animation.DROP
      });
      marker.setPosition(pos);
      map.setCenter(pos);
      map.setZoom(18);
      map.setOptions({
        draggable: false
      });

      // Save location to Firebase
      var database = firebase.database();

      var comment = $("#comment-input").val(),
        name = $("#name-input").val(),
        phone = $("#phoneNumber-input").val(),
        turtleCard = database.ref('turtleCard'),
        time = moment().format('MMMM Do YYYY, h:mm a'),
        locationLat = position.coords.latitude,
        locationLong = position.coords.longitude,
        data = {
          Lat: locationLat,
          Long: locationLong,
          name: name,
          phone: phone,
          comment: comment,
          time: time,
          status: "reported"
        };

        database.ref().push(data);
        resetForm();
      },
      function() {
        handleLocationError(true, infoWindow, map.getCenter());
      })
  } else {
    //If browser doesn't suppport geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
}

//Create turtle card in document
function turtleDiv() {
  var comment = $("#comment-input").val();
  $("#fullCard").clone().prependTo("#tab1");
  $("#tab1-heading").attr('class', 'no-card hide');
  $("#turtle").attr('class', 'card hoverable show');
  $("#number").empty();
  $("#reported").empty();
  $("#reported").append("<p>" + "Reported " + moment().format('MMMM Do YYYY, h:mm a') + "</p>");
  $("#comment").empty();
  $("#comment").append(comment);
  $("#turtle").append("<div id='turtle' class='card hoverable hide");
  $("#number").append("Turtle " + 1 + "<i class='material-icons right'>more_vert</i>");
}

//Move turtle card from Reports to Rescuing
$("#tab1").on("click", "#next-stage-btn", function() {
  $("#tab2-heading").attr('class', 'no-card hide');
  $("#fullCard").prependTo("#tab2");
  Materialize.toast("This turtle is now being rescued.", 2000);
});

//Move turtle card from In Progress to Saved
var count = 0;
$("#tab2").on("click", "#next-stage-btn", function() {
  count++;
  $("#counter").text(count);
  $("#tab3-heading").attr('class', 'no-card hide');
  $(this).parents("#fullCard").prependTo("#tab3");
  $("#tab3").find(".sticky-action").html("");
  Materialize.toast("This turtle has been rescued.", 2000);
});

//Formspree ajax
$("#send").on("click", function(e) {
  e.preventDefault();
  var name = $("#name-input");
  var phone = $("#phoneNumber-input");
  var landmarks = $("#comment-input");
  $.ajax({
    method: "POST",
    url: "//formspree.io/umassturtlepower@gmail.com",
    data: $("#reportNewTurtle-form").serialize(),
    datatype: "json"
  });
});

//////////////////////////////////////////////////////////
//UPON LOADING WEBSITE
//////////////////////////////////////////////////////////

$(document).ready(function() {

  //FRONT END

  //Parallax page
  $('.parallax').parallax();

  //Mobile sidebar menu
  $(".button-collapse").sideNav({
    menuWidth: 250,
    closeOnClick: true,
  });

  //Floating action button
  $("#report-button").on("mouseover", function() {
    $("#report-button").children("a").removeClass("pulse");
    $("#report-button").children("a").children("i").text("place");
  });
  $("#report-button").on("mouseout", function() {
    $("#report-button").children("a").children("i").text("add");
  });

  //Trigger modal
  $(".modal").modal();

  //BACK END

  //Formspree ajax
  $('#reportNewTurtle-form').submit(function(e) {
    var name = $('#name-input');
    var phone = $('#phoneNumber-input');
    var landmarks = $('#comment-input');
    $.ajax({
      method: 'POST',
      url: '//formspree.io/umassturtlepower@gmail.com',
      data: $('#report-form').serialize(),
      datatype: 'json'
    });
    e.preventDefault();
    $(this).get(0).reset();
  });

});
