# NeighbourhoodCheck

This project is to take existing resources from the ONS and present them in a way that is user-friendly and geo-searchable for Ottawa community members.

The core aspects of this project are the following:

1) The ArcGIS Online infrastructure: using our UWO account, we uploaded shapefiles of the Ottawa neighbourhoods (as determinded by the ONS). These sit as a FeatureLayer on ArcGIS online.
2) The JS code is written using the ArcGIS Online API v3, referencing the FeatureLayer we uploaded in Step 1. Documentation for the API can be found at: https://developers.arcgis.com/javascript/
3) The styling for the page is largely done in the /css/main.css file. Styling for the map (the popup, the colour of the polygons, etc) is done in the JS file at /js/main.js.
