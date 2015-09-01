 
      var map, dialog;

      require([
        "esri/map", "esri/layers/FeatureLayer", "esri/dijit/Search",
        "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", 
        "esri/renderers/SimpleRenderer", "esri/graphic", "esri/lang",
        "esri/Color", "dojo/number", "dojo/dom-style", 
        "dijit/TooltipDialog", "dijit/popup", "esri/dijit/LocateButton", 
        "dojo/parser","dijit/layout/BorderContainer", "dijit/layout/ContentPane", "dojo/domReady!"
      ], function(
        Map, FeatureLayer, Search,
        SimpleFillSymbol, SimpleLineSymbol,
        SimpleRenderer, Graphic, esriLang,
        Color, number, domStyle, 
        TooltipDialog, dijitPopup, LocateButton, parser
      ) {

      parser.parse();

        map = new Map("mapDiv", {
          basemap: "gray",
          center: [-75.6919, 45.300],
          zoom: 11,
		  //slider: false,
        });
        
		var NeighbourhoodsLayer = new FeatureLayer("http://services1.arcgis.com/1EiQC2OVJfJVgJes/arcgis/rest/services/NBwithPC/FeatureServer/0", {
            outFields: ["*"]
         });
         
		var s = new Search({
            enableLabel: false,
            enableInfoWindow: false,
            showInfoWindowOnSelect: false,
            map: map
         }, "search");

    //begin search experiment

    s.on("select-result", showLocation)

    function showLocation(evt) {
      map.graphics.clear;
      var locationPoint = evt.result.feature.geometry
      var locationSymbol = new SimpleMarketSymbol().setStyle(
        SimpleMarkerSymbold.STYLE_SQUARE).setColor(
        new Color([255, 0, 0, 0.5])
        );

      var searchResult = new Graphic(locationPoint, locationSymbol);
      map.graphics.add(searchResult);
    }

    //end experiment

    var geoLocate = new LocateButton({
        map: map
      }, "LocateButton");
      
		//var sources = s.get("sources"); 
        var symbol = new SimpleFillSymbol(
          SimpleFillSymbol.STYLE_SOLID, 
          new SimpleLineSymbol(
            SimpleLineSymbol.STYLE_SOLID, 
            new Color([255,255,255,0.35]), 1
          ),
          new Color([102,204,255,0.35])
        );
        NeighbourhoodsLayer.setRenderer(new SimpleRenderer(symbol));
        map.addLayer(NeighbourhoodsLayer);
        map.infoWindow.resize(245,125);
        
        dialog = new TooltipDialog({
          id: "tooltipDialog",
          style: "position: absolute; width: 250px; font: normal normal normal 10pt Helvetica;z-index:100"
        });
        dialog.startup();
        
        var highlightSymbol = new SimpleFillSymbol(
          SimpleFillSymbol.STYLE_SOLID, 
          new SimpleLineSymbol(
            SimpleLineSymbol.STYLE_SOLID, 
            new Color([255,255,255,1]), 3
          ), 
          new Color([283,49,35,1])
        );
        //close the dialog when the mouse leaves the highlight graphic
        map.on("load", function(){
          map.graphics.enableMouseEvents();
          map.graphics.on("mouse-out", closeDialog);
          
        });
                
        //listen for when the onMouseOver event fires on the countiesGraphicsLayer
        //when fired, create a new graphic with the geometry from the event.graphic and add it to the maps graphics layer
        NeighbourhoodsLayer.on("mouse-over", function(evt){
          var t = "<b>${Name}</b><hr><b>Population: </b>${Population}<br>"
            + "<b>Seniors: </b>${F__Seniors:NumberFormat}<br>"
            + "<b>Donors: </b>${Sum_No__of:NumberFormat}<br>"
            + "<b>Median Income: </b>${Median_res:NumberFormat}<br>"
			+ "<b> There are ${Sum_No__of} donors in your neighbourhood, which is ${Sum_No__of:compareCityAverage} % compared to the city average.</b>";
  
		//Comparison function to populate tooltip
		compareCityAverage = function(value) {
			var cityAverage = 200 //dummy value to be updated
			var comparison = (value.hasOwnProperty("attributes")) ? value.attributes.Sum_No__of : value;
			return number.format((comparison - cityAverage)/cityAverage*100, { places: 2});
		};
  
  
          var content = esriLang.substitute(evt.graphic.attributes,t);
          var highlightGraphic = new Graphic(evt.graphic.geometry,highlightSymbol);
          map.graphics.add(highlightGraphic);
          
          dialog.setContent(content);
          domStyle.set(dialog.domNode, "opacity", 0.85);
          dijitPopup.open({
            popup: dialog, 
            x: evt.pageX,
            y: evt.pageY
          });
        });
    
        function closeDialog() {
          map.graphics.clear();
          dijitPopup.close(dialog);
        }
	
		s.startup();
		geoLocate.startup();
      });
