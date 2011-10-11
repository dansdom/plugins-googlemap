/* 
	jQuery Googlemap Plugin - v1.0  
	Copyright (c) 2011 Daniel Thomson
	
	Licensed under the MIT license:
	http://www.opensource.org/licenses/mit-license.php
*/
// Googlemap Plugin - v1.0
// this plugin allows a developer to drop in a generic googlemap into any page very easily
// there are a number of default map settings, but they can be overwritten and added to depending on the map requirements
// You can set the center of the map, and a pin on the centre too.
// there are options to have custom pins
// the markers are defined as an array of pins. 
// each pin object has a title, lat, lng, custom pin reference, and an infoWindow HTML string
// implementation is as easy as:
//			$(document).ready(function(){
//				$("#mapPane").MapMe({
//				    options: go here
//				});				
//			});

// TO DO:

// Custom Pin:
// for each custom pin the setting can be turned off by using "false", 
// required: lat and lng

// if markerCluster is set to true, then the markers on the page will be clustered using the marker cluster script.
// this script needs to be included in the HTML
// these clusters can be styled using the markerClusterOptions object.
//	Styles for marker clusters:
//	'gridSize': (number) The grid size of a cluster in pixels.
//  'maxZoom': (number) The maximum zoom level that a marker can be part of a cluster.
//  'zoomOnClick': (boolean) Whether the default behaviour of clicking on a cluster is to zoom into it.
//	'averageCenter': (boolean) Wether the center of each cluster should be the average of all markers in the cluster.
//	'minimumClusterSize': (number) The minimum number of markers to be in a cluster before the markers are hidden and a count is shown.
//	'styles': (object) An object that has style properties:
//			'url': (string) The image url.
//			'height': (number) The image height.
//			'width': (number) The image width.
//			'anchor': (Array) The anchor position of the label text.
//			'textColor': (string) The text color.
//			'textSize': (number) The text size.
//			'backgroundPosition': (string) The position of the backgound x, y.

(function($){

	// I have decided that rather than loading the script dynamically, the user must include it in the head of the document
	// as well as the markerCluster script if they want to use that too
	/*
	loadScript = function(box,opts)
		{
			alert("loading script");
			var googleScript = document.createElement("script");
			googleScript.type = "text/javascript";
			googleScript.src = "http://maps.googleapis.com/maps/api/js?sensor=false";
			document.body.appendChild(googleScript);
		};
	document.onload = loadScript();
	*/
	
	$.fn.MapMe = function(config)
	{
		// config - default settings
		var settings = {
                              mapCanvas : 'mapPane',  // the id of the map canvas
                              mapCenter : [80, 80],  // option - "current" position, or array of [lat/lng] values
                              pinCenter : true, 
                              // same object parameters as the markers list 
                              centerMarker : [], //["center marker", -33.890542, 151.374856, "myCustomPin", "<h1>this is the center pin</h1>"],	
                              // need to include the script if you want to use it                           
                              markerCluster : false,
                              markerClusterOptions : {
                              							styles : [
                              										{height: 53, width: 53, url: "http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclusterer/images/m1.png",textColor : "#000",textSize : 16},
																	{height: 56, width: 56, url: "http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclusterer/images/m2.png",textColor : "#000",textSize : 16},
																	{height: 66, width: 66, url: "http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclusterer/images/m3.png",textColor : "#000",textSize : 16},
																	{height: 78, width: 78, url: "http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclusterer/images/m4.png",textColor : "#000",textSize : 16},
																	{height: 90, width: 90, url: "http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclusterer/images/m5.png",textColor : "#000",textSize : 16}
                              									 ],
                              							gridSize : 60,
                              							minimumClusterSize : 3                              							
                              						 },                                                        
							  // an example of a custom pin
							  customPins :	{
							  					// exmaple of a custom pin
							  					"myCustomPin" : {
							  									pinImg : "img/pin.png",
							  									pinImgSize : [36, 55],
							  									pinOrigin : [0,0],
							  									pinAnchor : [18, 55],
							  									pinShape : 	{coord: [1, 1, 1, 36, 55, 36, 55, 1], type: 'poly'},
							  									pinShadow : "img/pin-shadow.png",
							  									pinShadowSize : [77, 58],
							  									pinShadowOrigin : [0,0],
							  									pinShadowAnchor : [22,55]
							  								 }
							  				},
							  markers : [							  				
							  				//[marker title, latitude, longitude, custom pin name, info window text] - set to false if not needed
							  				// example of some markers
											//['Bondi Beach', -33.890542, 151.274856, false, "<h1>Bondi Info Window Content</h1><p>lorem ipsum</p>"],
											//['Coogee Beach', -33.923036, 151.259052, "myCustomPin", "<h1>Coogee Info Window Content</h1><p>lorem ipsum</p>"],
											//['Cronulla Beach', -34.028249, 151.157507, "myCustomPin", "<h1>Cronulla Info Window Content</h1><p>lorem ipsum</p>"],
											//['Manly Beach', -33.80010128657071, 151.28747820854187, false, false],
											//['Maroubra Beach', -33.950198, 151.259302, "myCustomPin", "<h1>Maroubra Info Window Content</h1><p>lorem ipsum</p>"]																						
										],							  
                              mapOptions : {
                              					// these are the basic styles. 
                              					// this object can be added to with any of the googlemap options when the plugin is called
					    						zoom: 10,
					    						center: '80, 80',
					    						mapTypeId: google.maps.MapTypeId.ROADMAP,
					    						mapTypeControl: true,					    						
					    						panControl: false,
					  							zoomControl: true,					  												  									  							
					  							scaleControl: true,
					  							streetViewControl: true,
					  							overviewMapControl: true
					    					 }
					 };

		// if settings have been defined then overwrite the default ones
        // comments:        true value makes the merge recursive. that is - 'deep' copy
		//				{} creates an empty object so that the second object doesn't overwrite the first object
		//				this emtpy takes object1, extends2 onto object1 and writes both to the empty object
		//				the new empty object is now stored in the var opts.
		var opts = $.extend(true, {}, settings, config);
		
		// iterate over each object that calls the plugin and do stuff
		this.each(function(){														
						
			// set the center of the map
			if (opts.mapCenter == "current")
			{
				// find me the current position of the user
				opts.mapCenter = $.fn.MapMe.getCurrentPosition();				
			}
			opts.mapOptions.center = new google.maps.LatLng(opts.mapCenter[0], opts.mapCenter[1]);	
			// make the map object				
			var mapObject = new google.maps.Map(document.getElementById(opts.mapCanvas), opts.mapOptions);						
								
			// add the markers to the map, return the array of markers
			var mapMarkers = $.fn.MapMe.setMarkers(mapObject, opts);
			
			// marker cluster code. if the setting is true and the object exists then add the marker clusterer			
			if (opts.markerCluster == true && typeof(MarkerClusterer) !== "undefined")
			{
				var clusterOptions = opts.markerClusterOptions;
				var cluster = new MarkerClusterer(mapObject, mapMarkers, clusterOptions);
				//console.log(cluster.getStyles());
			}
						
		});

		// return jQuery object
		return this;
	};

	// plugin functions go here - example of two different ways to call a function, and also two ways of using the namespace
	// note: $.fn.testPlugin.styleBox allows for this function to be extended beyond the scope of the plugin and used elsewhere, 
	// that is why it is a superior namespace. Also: anonymous function calling I think is probably better naming practise too.
	
	// get the users current position
	$.fn.MapMe.getCurrentPosition = function()
	{
		var userPosition = [];
		if (navigator.geolocation)
		{			
			navigator.geolocation.getCurrentPosition(function(position){
				userPosition = [position.coords.latitude, position.coords.longitude];
			});			
		}
		else if (google.gears)
		{
			var geo = google.gears.factory.create('beta.geolocation');
			geo.getCurrentPosition(function(position){
				userPosition = [position.latitude, position.longitude];
			});
		}
		else
		{
			userPosition = [80, 80]; // put them in the north sea !!!
		}
		return userPosition;
	};
	
	// set the markers onto the map
	$.fn.MapMe.setMarkers = function(mapObject, opts, manager)
	{
		var markers = opts.markers;
		var markerArray = [];
		// need to do a test to see if the markers have been declared
		if (markers.length > 0)
		{
			for (var i = 0; i < markers.length; i++)
			{
				var pin = markers[i];
				//console.log(markers[i]["infoWindow"]);
				var infoWindow = markers[i]["infoWindow"];
				var pinEvents = markers[i]["pinEvent"];
				// check to see if a custom pin has been assigned - else drop in a regular pin
				// i need to return the marker so I can attach events to it in a different function
				if (markers[i]["pin"])
				{
					// then go make a custom pin marker
					var currentPin = $.fn.MapMe.customPin(mapObject, opts, pin);
				}
				else
				{
					// make a regular pin marker
					var pinPosition = new google.maps.LatLng(pin["lat"], pin["lng"]),
						currentPin = new google.maps.Marker({
							position: pinPosition,
							map: mapObject,
							title: pin["title"] 
						});
				}
								
				// add info windows here
				if (infoWindow)
				{
					$.fn.MapMe.addInfoWindow(mapObject, opts, currentPin, infoWindow);
				}
				
				// add pin events
				if (pinEvents)
				{
					$.fn.MapMe.addPinEvents(mapObject, opts, pinEvents, currentPin);
				}
				// store all the pins together into an array
				markerArray.push(currentPin);
			}
			
		}
		//console.log(markerArray);
		// else if there is an option to drop a pin on the center of the map, then do that
		if (opts.pinCenter == true)
		{
			var centerMarker = $.fn.MapMe.addCentrePin(mapObject, opts);
			// add the center pin to the array of markers
			// if I want to add the center pin to marker manager I would put an option to test and then run this next line
			// markerArray.push(centerMarker);
		}
		
		return markerArray;
	};
	
	// add center pin to the map
	$.fn.MapMe.addCentrePin = function(mapObject, opts)
	{
		if (opts.centerMarker["pin"])
		{
			var marker = $.fn.MapMe.customPin(mapObject, opts, opts.centerMarker);
		}
		else
		{
			marker = new google.maps.Marker({
				position: opts.mapOptions.center,
				title: opts.centerMarker["title"],
				map: mapObject
			});
			marker.setMap(mapObject);
		}
		
		// set the info window for the center marker
		var infoWindow = opts.centerMarker["infoWindow"];
		if (infoWindow)
		{
			$.fn.MapMe.addInfoWindow(mapObject, opts, marker, infoWindow);
		}
		
		return marker;
	};
	
	// make a custom pin for the marker and then drop it onto the map
	$.fn.MapMe.customPin = function(mapObject, opts, pin)
	{		
		// custom pin object reference
		
		var pinReference = pin["pin"];
		if (!opts.customPins[pinReference])
		{
			alert("custom pin has not been defined properly");
		}	
		// console.log(pinReference);
		// custom pin image parameters			
		var image = new google.maps.MarkerImage(
						opts.customPins[pinReference].pinImg,
						new google.maps.Size(opts.customPins[pinReference].pinImgSize[0], opts.customPins[pinReference].pinImgSize[1]),
						new google.maps.Point(opts.customPins[pinReference].pinOrigin[0], opts.customPins[pinReference].pinOrigin[1]),
						new google.maps.Point(opts.customPins[pinReference].pinAnchor[0], opts.customPins[pinReference].pinAnchor[1]));
		//console.log(image);
		// custom pin shadow parameters
		var shadow = new google.maps.MarkerImage(
						opts.customPins[pinReference].pinShadow,
						new google.maps.Size(opts.customPins[pinReference].pinShadowSize[0], opts.customPins[pinReference].pinShadowSize[1]),
						new google.maps.Point(opts.customPins[pinReference].pinShadowOrigin[0], opts.customPins[pinReference].pinShadowOrigin[1]),
						new google.maps.Point(opts.customPins[pinReference].pinShadowAnchor[0], opts.customPins[pinReference].pinShadowAnchor[1]));
		//console.log(shadow);
		// custom pin shape
		var shape = opts.customPins[pinReference].pinShape;
		// test if shape has been defined, if not then an empty value is needed
		if (!shape)
		{
			shape = "";
		}	
		// set custom pin position	
		var pinPosition = new google.maps.LatLng(pin["lat"], pin["lng"]);
		
		//console.log(pinPosition);
		// make the marker and put it onto the map
		var marker = new google.maps.Marker({
			position: pinPosition,
			map: mapObject,
			shadow: shadow,
			icon: image,
			// need to test for the shape and decide whether to include it or not
			shape: shape,			
			title: pin["title"]
		});	
		return marker;				
	};
	
	$.fn.MapMe.addPinEvents = function(mapObject, opts, pinEvents, currentPin)
	{
		for (var name in pinEvents)
		{			
			var event = pinEvents[name];
			google.maps.event.addListener(currentPin, name, event);
		}
	};
	
	// add an infoWindow to the pin marker
	$.fn.MapMe.addInfoWindow = function(mapObject, opts, pin, infoWindow)
	{
		var infoWindow = new google.maps.InfoWindow({content: infoWindow});
		
		google.maps.event.addListener(pin, "click", function(){
			infoWindow.open(mapObject, pin);
		});
	};
	
	// end of module
})(jQuery);

