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
//						 options: go here
//				});				
//			});
//
// v 1.0	- basic functionality, custom pins, custom events, markerclusterer plugin, map options and info windows
// v 1.1	- fixed bug with geolocation
//			- added option to 'track' the user on the map. this will add a center pin, on a given time period it will update the maps center position
//			- fixed issues with the definition of the center pin. now you can define your own center pin
//			- renaming a few variables so that they make a little more sense
//			- combined mapCenter and trackLOcation variables :)
//
//	IMPORTANT!!! - I'm still trying to make this work on the happy hour app

// Custom Pin:
// for each custom pin the setting can be turned off by using "false", 
// required: lat and lng
// need to write in a track location option/function. "trackLocation:true"

// if markerCluster is set to true, then the markers on the page will be clustered using the marker cluster script.
// this script needs to be included in the HTML
// these clusters can be styled using the markerClusterOptions object.
//	Styles for marker clusters:
//	'gridSize': (number) The grid size of a cluster in pixels.
//	'maxZoom': (number) The maximum zoom level that a marker can be part of a cluster.
//	'zoomOnClick': (boolean) Whether the default behaviour of clicking on a cluster is to zoom into it.
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

(function ($) {
	'use strict';
	$.fn.MapMe = function (config) {
		// config - default settings
		var settings = {
			mapCanvas : "mapPane",  // the id of the map canvas
			pinCenter : true,
			trackLocation : true,
			trackingPeriod : false,	// if set to false then it won't 'track' the user, only center the map initially on user location
			trackingCircle : true,
			centerMarker : {}, // e.g. of a center pin definition - {title:"center marker", pin: "myCustomPin", infoWindow: "<h1>this is the center pin</h1>"},
			// need to include the script if you want to use it							
			markerCluster : false,
			markerClusterOptions : {
				styles : [
					{height : 53, width : 53, url : "http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclusterer/images/m1.png", textColor : "#000", textSize : 16},
					{height : 56, width : 56, url : "http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclusterer/images/m2.png", textColor : "#000", textSize : 16},
					{height : 66, width : 66, url : "http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclusterer/images/m3.png", textColor : "#000", textSize : 16},
					{height : 78, width : 78, url : "http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclusterer/images/m4.png", textColor : "#000", textSize : 16},
					{height : 90, width : 90, url : "http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclusterer/images/m5.png", textColor : "#000", textSize : 16}
				],
				minimumClusterSize : 3
			},
			// an example of a custom pin
			customPins : {
				// exmaple of a custom pin
				"myCustomPin" : {
					pinImg : "img/pin.png",
					pinImgSize : [36, 55],
					pinOrigin : [0, 0],
					pinAnchor : [18, 55],
					pinShape : {coord: [1, 1, 1, 36, 55, 36, 55, 1], type: 'poly'},
					pinShadow : "img/pin-shadow.png",
					pinShadowSize : [77, 58],
					pinShadowOrigin : [0, 0],
					pinShadowAnchor : [22, 55]
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
				zoom: 12,
				center: [80, 80],
				mapTypeId: google.maps.MapTypeId.ROADMAP,
				mapTypeControl: true,
				panControl: false,
				zoomControl: true,
				scaleControl: true,
				streetViewControl: true,
				overviewMapControl: true
			}
		},
			// if settings have been defined then overwrite the default ones
			// comments:		true value makes the merge recursive. that is - 'deep' copy
			//				{} creates an empty object so that the second object doesn't overwrite the first object
			//				this emtpy takes object1, extends2 onto object1 and writes both to the empty object
			//				the new empty object is now stored in the var opts.
			opts = $.extend(true, {}, settings, config);

		// iterate over each object that calls the plugin and do stuff
		this.each(function () {

			opts.mapOptions.center = new google.maps.LatLng(opts.mapOptions.center[0], opts.mapOptions.center[1]);
			// make the map object	
			//console.log(opts.mapOptions);
			var mapObject = new google.maps.Map(document.getElementById(opts.mapCanvas), opts.mapOptions),
				centerPosition,
				mapMarkers,
				clusterOptions,
				cluster,
				trackingTimer;
			
			// set the center of the map
			if (opts.trackLocation === true)
			{
				// find me the current position of the user
				$.fn.MapMe.getUserPosition(mapObject, opts);
				// current position takes a while, so I will have to set map center when current position is calculated				
			}
			// if not current but pinCenter is true, then add a pin in the center
			else if (opts.pinCenter === true)
			{				
				centerPosition = [opts.mapOptions.center.Oa, opts.mapOptions.center.Pa];
				mapObject.centerMarker = $.fn.MapMe.addCentrePin(mapObject, opts, centerPosition);
			}
								
			// add the markers to the map, return the array of markers
			mapMarkers = $.fn.MapMe.setMarkers(mapObject, opts);
			
			// marker cluster code. if the setting is true and the object exists then add the marker clusterer			
			if (typeof(MarkerClusterer) !== "undefined" && opts.markerCluster === true)
			{
				clusterOptions = opts.markerClusterOptions;
				cluster = new MarkerClusterer(mapObject, mapMarkers, clusterOptions);
				//console.log(cluster.getStyles());
			}
			
			// add function that updates the current location of the user
			if (opts.trackLocation && opts.trackingPeriod)
			{				
				trackingTimer = setTimeout(function(){$.fn.MapMe.updateLocation(mapObject, opts);}, opts.trackingPeriod);
			}
						
		});

		// return jQuery object
		return this;
	};

	// plugin functions go here - example of two different ways to call a function, and also two ways of using the namespace
	// note: $.fn.testPlugin.styleBox allows for this function to be extended beyond the scope of the plugin and used elsewhere, 
	// that is why it is a superior namespace. Also: anonymous function calling I think is probably better naming practise too.
	
	// get the users current position
	$.fn.MapMe.getUserPosition = function(mapObject, opts)
	{
		
		//console.log("getting my position");		
		if (navigator.geolocation)
		{	
			navigator.geolocation.getCurrentPosition(
				// success function
				function(position)
				{					
					//console.log("this is navigator.geolocation:");
					//console.log(position.coords);
					var userPos = [position.coords.latitude, position.coords.longitude];
					$.fn.MapMe.geoSuccess(mapObject, opts, userPos);
				},
				// error function
				function()
				{
					$.fn.MapMe.geoFailure();
				},
				// tracking period for calling error
				{timeout:opts.trackingPeriod});
		}
		else if (google.gears)
		{
			var geo = google.gears.factory.create('beta.geolocation');			
			geo.getCurrentPosition(
				// success function
				function(position)
				{	
					//console.log("this is google gears");				
					var userPos = [position.latitude, position.longitude];
					$.fn.MapMe.geoSuccess(mapObject, opts, userPos);
				},
				// error function
				function()
				{
					$.fn.MapMe.geoFailure();
				},
				// tracking period for calling error
				{timeout:opts.trackingPeriod});
		}
		else
		{			
			$.fn.MapMe.geoFailure();
		}	
						
	};
	
	// when the browser successfully finds the users cuurent position
	$.fn.MapMe.geoSuccess = function(mapObject, opts, position)
	{			
		// need to make this conditional and if setting center then do it
		// also I will need to only set this the first time as I got this function going through a loop
		// console.log(position);
		// console.log(position);
		var userPosition = new google.maps.LatLng(position[0], position[1]);
		// console.log(position);
		if (!mapObject.centerSet)
		{
			mapObject.setCenter(userPosition);
		}
		mapObject.centerSet = true;
		
		// if putting a pin in the center of the map then do so
		if (opts.pinCenter === true) 
		{
			// if the map already has a center pin then remove it
			if (mapObject.centerMarker)
			{
				mapObject.centerMarker.setMap(null);
				mapObject.centerOverlay.setMap(null);
			}
			// need to fill out the center marker here:
			// I'll need to contruct the center pin object from the map location
			// set the lat/lng of the center marker
			// I'M NOT SURE I NEED THIS SWITCH HERE - GOT TO COME BACK TO IT !!!!!!!!!!!!!!!!!!!!!!!
			if (opts.trackLocation === true) 
			{
				//then set the lat/lng of pin
				opts.centerMarker.lat = position[1];
				opts.centerMarker.lng = position[0];
			} 
			// then call the addCenterPin function
			
			mapObject.centerMarker = $.fn.MapMe.addCentrePin(mapObject, opts, position);
			// going to test creating a circle around the center pin - this is only for beer app for now, but will put it into the plugin later.			
		}
	};
	
	// when the browser doesn't find the users current position
	$.fn.MapMe.geoFailure = function()
	{
		//alert("I couldn't find your current position");
	};
	
	// this function checks the users positions every 10sec and centers the map on the user position and resets the venter pin as well
	$.fn.MapMe.updateLocation = function(mapObject, opts)
	{
		// get the users current position
		$.fn.MapMe.getUserPosition(mapObject, opts);
		// set the timer up again
		//console.log("updating location");
		setTimeout(function(){$.fn.MapMe.updateLocation(mapObject, opts);}, opts.trackingPeriod);
	};
	
	// set the markers onto the map
	$.fn.MapMe.setMarkers = function(mapObject, opts)
	{
		var markers = opts.markers,
			markerArray = [],
			// need to do a test to see if the markers have been declared
			markerLength = markers.length,
			i,
			pin,
			infoWindow,
			pinEvents,
			currentPin,
			pinPosition;
			
		if (markerLength > 0)
		{
			for (i = 0; i < markerLength; i += 1)
			{
				pin = markers[i];				
				infoWindow = markers[i].infoWindow;
				pinEvents = markers[i].pinEvent;
				// check to see if a custom pin has been assigned - else drop in a regular pin
				// i need to return the marker so I can attach events to it in a different function
				if (markers[i].pin)
				{
					// then go make a custom pin marker
					currentPin = $.fn.MapMe.customPin(mapObject, opts, pin);
				}
				else
				{
					// make a regular pin marker
					pinPosition = new google.maps.LatLng(pin.lat, pin.lng);
					currentPin = new google.maps.Marker({
						position: pinPosition,
						map: mapObject,
						title: pin.title 
					});					
				}
								
				// add info windows here
				if (infoWindow)
				{
					$.fn.MapMe.addInfoWindow(mapObject, currentPin, infoWindow);
				}
				
				// add pin events
				if (pinEvents)
				{
					$.fn.MapMe.addPinEvents(pinEvents, currentPin);
				}
				// store all the pins together into an array
				markerArray.push(currentPin);
			}
			
		}
		
		return markerArray;
	};
	
	// add center pin to the map
	$.fn.MapMe.addCentrePin = function(mapObject, opts, centerPosition)
	{
		var marker,
			centerPin = {},
			infoWindow,
			circle;
			
		if (opts.centerMarker.pin)
		{	
			centerPin.lat = centerPosition[0];
			centerPin.lng = centerPosition[1];
			centerPin.title = opts.centerMarker.title;
			centerPin.pin = opts.centerMarker.pin;
			marker = $.fn.MapMe.customPin(mapObject, opts, centerPin);
		}
		else
		{			
			marker = new google.maps.Marker({
				position: new google.maps.LatLng(centerPosition[0], centerPosition[1]),
				title: opts.centerMarker.title,
				map: mapObject
			});
			marker.setMap(mapObject);			
		}
		
		// set the info window for the center marker
		infoWindow = opts.centerMarker.infoWindow;
		if (infoWindow)
		{
			$.fn.MapMe.addInfoWindow(mapObject, opts, marker, infoWindow);
		}
		
		circle = {
			strokeColor: "#4d9cff",
			strokeOpacity: 0.4,
			strokeWeight: 2,
			fillColor: "#4d9cff",
			fillOpacity: 0.15,
			map: mapObject,
			center: new google.maps.LatLng(centerPosition[0], centerPosition[1]),
			radius : 200
		};
		if (opts.trackingCircle === true)
		{
			mapObject.centerOverlay = new google.maps.Circle(circle);
		}
		
		return marker;
	};

	// make a custom pin for the marker and then drop it onto the map
	$.fn.MapMe.customPin = function(mapObject, opts, pin)
	{		
		// custom pin object reference
		
		var pinReference = pin.pin,
			image,
			shadow,
			shape,
			pinPosition,
			marker;
			
		if (!opts.customPins[pinReference])
		{
			alert("custom pin has not been defined properly");
		}	
		//console.log(pinReference);
		// custom pin image parameters			
		image = new google.maps.MarkerImage(
			opts.customPins[pinReference].pinImg,
			new google.maps.Size(opts.customPins[pinReference].pinImgSize[0], opts.customPins[pinReference].pinImgSize[1]),
			new google.maps.Point(opts.customPins[pinReference].pinOrigin[0], opts.customPins[pinReference].pinOrigin[1]),
			new google.maps.Point(opts.customPins[pinReference].pinAnchor[0], opts.customPins[pinReference].pinAnchor[1]));
		//console.log(image);
		// custom pin shadow parameters
		shadow = new google.maps.MarkerImage(
			opts.customPins[pinReference].pinShadow,
			new google.maps.Size(opts.customPins[pinReference].pinShadowSize[0], opts.customPins[pinReference].pinShadowSize[1]),
			new google.maps.Point(opts.customPins[pinReference].pinShadowOrigin[0], opts.customPins[pinReference].pinShadowOrigin[1]),
			new google.maps.Point(opts.customPins[pinReference].pinShadowAnchor[0], opts.customPins[pinReference].pinShadowAnchor[1]));
		//console.log(shadow);
		// custom pin shape
		shape = opts.customPins[pinReference].pinShape;
		// test if shape has been defined, if not then an empty value is needed
		if (!shape)
		{
			shape = "";
		}	
		// set custom pin position	
		pinPosition = new google.maps.LatLng(pin.lat, pin.lng);		
		// make the marker and put it onto the map
		marker = new google.maps.Marker({
			position: pinPosition,
			map: mapObject,
			shadow: shadow,
			icon: image,
			// need to test for the shape and decide whether to include it or not
			shape: shape,			
			title: pin.title
		});	
		return marker;				
	};
	
	$.fn.MapMe.addPinEvents = function(pinEvents, currentPin)
	{
		var event,
			name;
		for (name in pinEvents)
		{			
			event = pinEvents[name];
			google.maps.event.addListener(currentPin, name, event);
		}
	};
	
	// add an infoWindow to the pin marker
	$.fn.MapMe.addInfoWindow = function(mapObject, pin, infoWindow)
	{
		infoWindow = new google.maps.InfoWindow({content: infoWindow});
		
		google.maps.event.addListener(pin, "click", function(){
			infoWindow.open(mapObject, pin);
		});
	};
	
	// end of module
}(jQuery));

