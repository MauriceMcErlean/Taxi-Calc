var origins = [];



function addarea() {
        var start = $("#start").val();
        origins.push(start);
        console.log(origins);
        console.log(JSON.stringify(origins));



        var end = $("#destination").val();
        destinations.push(end);
        console.log(destinations);
        console.log(JSON.stringify(destinations));

        $("#map").css({"width":"100%", "height":"300px", "border":"1px solid grey"});
}
    


  var destinations = [
  ];
  var query = {
    origins: origins,
    destinations: destinations,
    travelMode: google.maps.TravelMode.DRIVING,
    unitSystem: google.maps.UnitSystem.IMPERIAL
  };
  var map, dms;
  var dirService, dirRenderer;
  var highlightedCell;
  var routeQuery;
  var bounds;
  var panning = false;
  function initialize() {
    var mapOptions = {
      zoom: 5,
      center: new google.maps.LatLng(54.5973, 5.9301),
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    map = new google.maps.Map(document.getElementById("map"), mapOptions);
    createTable();
    dms = new google.maps.DistanceMatrixService();
    dirService = new google.maps.DirectionsService();
    dirRenderer = new google.maps.DirectionsRenderer({preserveViewport:true});
    dirRenderer.setMap(map);
    google.maps.event.addListener(map, 'idle', function() {
      if (panning) {
        map.fitBounds(bounds);
        panning = false;
      }
    });
    
    updateMatrix();
  }
  function updateMatrix() {
    dms.getDistanceMatrix(query, function(response, status) {
        if (status == "OK") {
          populateTable(response.rows);
        }
      }
    );
  }
  function createTable() {
    var table = document.getElementById('matrix');
    var tr = addRow(table);
    addElement(tr);
    for (var j = 0; j < destinations.length; j++) {
      var td = addElement(tr);
      td.setAttribute("class", "destination");
      td.appendChild(document.createTextNode(destinations[j]));
    }
    for (var i = 0; i < origins.length; i++) {
      var tr = addRow(table);
      var td = addElement(tr);
      td.setAttribute("class", "origin");
      td.appendChild(document.createTextNode(origins[i]));
      for (var j = 0; j < destinations.length; j++) {
        var td = addElement(tr, 'element-' + i + '-' + j);
        td.onmouseover = getRouteFunction(i,j);
        td.onclick = getRouteFunction(i,j);
      }
    }
  }
  function populateTable(rows) {
    for (var i = 0; i < rows.length; i++) {
      for (var j = 0; j < rows[i].elements.length; j++) {
        var distance = rows[i].elements[j].distance.text;
        var duration = rows[i].elements[j].duration.text;
        var td = document.getElementById('element-' + i + '-' + j);
        td.innerHTML = distance + "<br/>" + duration;

        var summary = document.getElementById("summary");
        summary.innerHTML += "The Journey is " + distance + " and will roughly take " + duration; 
        

        //first mile is 3.80, every mile after is 1.80. 


        //first mile will add 3.80 then remove 1 from total to travel
        //remaining miles left * the 1.80

         var fareshow = document.getElementById("fareshow");





        var firstmile = 3.80;
        var standardmile = 1.20;

       
        var faredistance = parseInt(distance);

        var standardmilefare = standardmile * faredistance -1 + firstmile ;






        fareshow.innerHTML += "The fare will cost £<b>" + standardmilefare.toFixed(2) + "</b>"

      

      }
    }
  }
  function getRouteFunction(i, j) {
    return function() {
      routeQuery = {
        origin: origins[i],
        destination: destinations[j],
        travelMode: query.travelMode,
        unitSystem: query.unitSystem,
      };
      
      if (highlightedCell) {
        highlightedCell.style.backgroundColor="#ffffff";
      }
      highlightedCell = document.getElementById('element-' + i + '-' + j);
      highlightedCell.style.backgroundColor="#e0ffff";
      showRoute();
    }
  }
  function showRoute() {
    dirService.route(routeQuery, function(result, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        dirRenderer.setDirections(result);
        bounds = new google.maps.LatLngBounds();
        bounds.extend(result.routes[0].overview_path[0]);
        var k = result.routes[0].overview_path.length;
        bounds.extend(result.routes[0].overview_path[k-1]);
        panning = true;
        map.panTo(bounds.getCenter());        
      }
    });
  }
  function updateMode() {
    switch (document.getElementById("mode").value) {
      case "driving":
        query.travelMode = google.maps.TravelMode.DRIVING;
        break;
      case "walking":
        query.travelMode = google.maps.TravelMode.WALKING;
        break;
    }
    updateMatrix();
    if (routeQuery) {
      routeQuery.travelMode = query.travelMode;
      showRoute();
    }
  }
  function updateUnits() {
    switch (document.getElementById("units").value) {
      case "km":
        query.unitSystem = google.maps.UnitSystem.METRIC;
        break;
      case "mi":
        query.unitSystem = google.maps.UnitSystem.IMPERIAL;
        break;
    }
    updateMatrix();
  }
  function addRow(table) {
    var tr = document.createElement('tr');
    table.appendChild(tr);
    return tr;
  }
  function addElement(tr, id) {
    var td = document.createElement('td');
    if (id) {
      td.setAttribute('id', id);
    }
    tr.appendChild(td);
    return td;
  }




// This example displays an address form, using the autocomplete feature
      // of the Google Places API to help users fill in the information.

      // This example requires the Places library. Include the libraries=places
      // parameter when you first load the API. For example:
      // <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">

      var placeSearch, autocomplete;
      var componentForm = {
        street_number: 'short_name',
        route: 'long_name',
        locality: 'long_name',
        administrative_area_level_1: 'short_name',
        country: 'long_name',
        postal_code: 'short_name'
      };

      function initAutocomplete() {
        // Create the autocomplete object, restricting the search to geographical
        // location types.
        autocomplete = new google.maps.places.Autocomplete(
            /** @type {!HTMLInputElement} */(document.getElementById('autocomplete')),
            {types: ['geocode']});

        // When the user selects an address from the dropdown, populate the address
        // fields in the form.
        autocomplete.addListener('place_changed', fillInAddress);
      }

      function fillInAddress() {
        // Get the place details from the autocomplete object.
        var place = autocomplete.getPlace();

        for (var component in componentForm) {
          document.getElementById(component).value = '';
          document.getElementById(component).disabled = false;
        }

        // Get each component of the address from the place details
        // and fill the corresponding field on the form.
        for (var i = 0; i < place.address_components.length; i++) {
          var addressType = place.address_components[i].types[0];
          if (componentForm[addressType]) {
            var val = place.address_components[i][componentForm[addressType]];
            document.getElementById(addressType).value = val;
          }
        }
      }

      // Bias the autocomplete object to the user's geographical location,
      // as supplied by the browser's 'navigator.geolocation' object.
      function geolocate() {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
            var geolocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            var circle = new google.maps.Circle({
              center: geolocation,
              radius: position.coords.accuracy
            });
            autocomplete.setBounds(circle.getBounds());
          });
        }
      }

