 
var map, dialog;

      require([
        
        "esri/map", 
        "esri/graphic",

        "esri/layers/FeatureLayer", 
        "esri/dijit/Search",
        "esri/renderers/SimpleRenderer", 
        "esri/lang",
        "esri/Color", 
        "dojo/number",
        "dijit/TooltipDialog", 
        "dijit/popup", 
        "esri/dijit/LocateButton",

        "esri/geometry/Point",
        "esri/geometry/Polyline",
        "esri/geometry/Polygon",

        "esri/symbols/SimpleLineSymbol",
        "esri/symbols/SimpleFillSymbol",
        "esri/symbols/TextSymbol",

        "dojo/_base/event",
        "dojo/parser",
        "dojo/dom", 
        "dojo/dom-style", 
        "dijit/registry", 
        "dijit/Menu",

        "dijit/layout/LayoutContainer", 
        "dijit/layout/ContentPane", 
        "dojo/domReady!"
      ], function(
        Map, 
        Graphic, 
        FeatureLayer, 
        Search, 
        SimpleRenderer, 
        esriLang, 
        Color, 
        number, 
        TooltipDialog, 
        dijitPopup, 
        LocateButton,
        Point, 
        Polyline, 
        Polygon,
        SimpleLineSymbol, 
        SimpleFillSymbol, 
        TextSymbol,
        event, parser, dom, domStyle, registry, Menu
      ) {
        parser.parse();

        domStyle.set(registry.byId("mainWindow").domNode, "visibility", "visible");

        map = new Map("mapDiv", {
          basemap: "gray",
          center: [-75.7900, 45.300],
          zoom: 11,
      //slider: false,
        });
        
    var NeighbourhoodsLayer = new FeatureLayer("http://services1.arcgis.com/1EiQC2OVJfJVgJes/arcgis/rest/services/NeighbourhoodFile_FinalData/FeatureServer/0", {
            outFields: ["*"],
            styling: true
         });
    
//old layer: http://services1.arcgis.com/1EiQC2OVJfJVgJes/arcgis/rest/services/NBwithPC/FeatureServer/0

    var s = new Search({
            enableLabel: false,
            enableInfoWindow: false,
            showInfoWindowOnSelect: false,
            map: map
         }, "search");

    //begin search experiment


    s.on("select-result", showLocation);

    function showLocation(evt) {
      map.graphics.clear;
      var locationPoint = evt.result.feature.geometry;
      var locationSymbol = new SimpleMarkerSymbol().setStyle(
        SimpleMarkerSymbol.STYLE_SQUARE).setColor(
        new Color([255, 0, 0, 0.5])
        );

      var searchResult = new Graphic(locationPoint, locationSymbol);
      map.graphics.add(searchResult);
    };

    //end experiment

    // add locator button that users can tap and the app zeros in on their IP location
      var geoLocate = new LocateButton({
        map: map
        }, "LocateButton");
      
    // introduce base symbology for neighbourhoods polygon
        var symbol = new SimpleFillSymbol(
          SimpleFillSymbol.STYLE_SOLID, 
          new SimpleLineSymbol(
            SimpleLineSymbol.STYLE_SOLID, 
            new Color([255,255,255,0.35]), 1
          ),
          new Color([204,255,153,0.35])
        );

        NeighbourhoodsLayer.setRenderer(new SimpleRenderer(symbol));
        map.addLayer(NeighbourhoodsLayer);
        map.infoWindow.resize(245,125);
        
    //begin tooltip code
        var dialog = new TooltipDialog({
          id: "tooltipDialog",
          style: "position: absolute; width: 250px; font: normal normal normal 10pt Arial;z-index:100",
          errorMessage: "Sorry! We're having problems loading your data. Try back later.",
        });
        dialog.startup();
        

        var highlightSymbol = new SimpleFillSymbol( 
          SimpleFillSymbol.STYLE_SOLID, 
          new SimpleLineSymbol(
            SimpleLineSymbol.STYLE_SOLID, 
            new Color([255,255,255]), 3
          ), 
          new Color([102,204,255,0.35])
        );
        //close the dialog when the mouse leaves the highlight graphic
        map.on("load", function(){
          map.graphics.enableMouseEvents();
          map.graphics.on("mouse-out", closeDialog);
          
        });
        
        // create object for city averages 

        var CityWideAverages = new Object();

            CityWideAverages.MedianIncome = 35555;
            CityWideAverages.Population = 8560;
            CityWideAverages.SeniorsAlone = 0.236;
            CityWideAverages.ChildrenUnderSix = 0.214;
            CityWideAverages.Walkability = 50;

        //listen for when the onMouseOver event fires on neighbourhoods layer
        //when fired, create a new graphic with the geometry from the event.graphic and add it to the maps graphics layer
        NeighbourhoodsLayer.on("mouse-over", function(evt){
          var t = "<b>${Name}</b><hr><b>Population: </b>${Populati_1} <br>"
            + "<b>Median income: </b>$${MedianAfte:NumberFormat} <br>"
            + "<b>Walkability score: </b> ${Walkabilit:NoZeroes} <br>"
            + "<b>Seniors living alone: </b>${PercSenior:NumberFormat}% <br>"
            + "<b>Children under 6: </b> ${PercChildr:NumberFormat}% <br><br>"
            + "<b>Population comparison: </b> ${Walkabilit:WalkabilityComparison} %<br>"
            + "<b>Income comparison: </b> ${MedianAfte:ComparingAverages} %<br>"
            + "<b>Seniors comparison: </b> ${Walkabilit:WalkabilityComparison} %<br>"
            + "<b>Kids comparison: </b> ${Walkabilit:WalkabilityComparison} %<br>";
      //+ "The walkability score is ${Walkabilit:WalkabilityComparison} % compared to the city average.";
  
    //Comparison function to populate tooltip
      WalkabilityComparison = function(value) {
          var cityAverage = CityWideAverages.Walkability //take property from CityWideAverages object
          var comparison = (value.hasOwnProperty("attributes")) ? value.attributes.Walkabilit : value; //get value from ArcGIS layer
          return number.format((comparison - cityAverage)/cityAverage*100, { places: 2});
          };

    //Because we don't have data for all the neighbourhood walkscores, replace any zeroes with NA statement instead.
      NoZeroes = function(value) {
          var tocheck = (value.hasOwnProperty("attributes")) ? value.attributes.Walkabilit : value;
          if (tocheck == 0) {
            return "Not available."
          } else {
            return number.format(tocheck)
          }
      };

        //Start compare function experiment

      ComparingAverages = function(value) {
          var cityAverage = CityWideAverages.currentONSAttribute //take property from CityWideAverages object
          var comparison = (value.hasOwnProperty("attributes")) ? value.attributes.LayerFieldNames: value; //get value from ArcGIS layer
          return number.format((comparison - cityAverage)/cityAverage*100, { places: 2});
        };

      var ONSAttributes = [ "Population", "MedianIncome", "Walkability", "SeniorsAlone", "ChildrenUnderSix"];
      var LayerFieldNames = ["Populati_1", "MedianAfte", "Walkabilit", "PercSenior", "PercChildr"];

        for (i = 0; i < ONSAttributes.length; ++i) {
          currentONSAttribute = ONSAttributes[i];
          window.alert(currentONSAttribute);
          LayerFieldNames[i].ComparingAverages;
          
        }

        //end compare function experiment

      
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
