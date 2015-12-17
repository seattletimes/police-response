// require("./lib/social");
// require("./lib/ads");
// var track = require("./lib/tracking");

require("component-responsive-frame/child");
require("component-leaflet-map");

var ich = require("icanhaz");
var data = require("./crimes.geo.json");

var mapElement = document.querySelector("leaflet-map");

if (mapElement) {
  var L = mapElement.leaflet;
  var map = mapElement.map;

  map.scrollWheelZoom.disable();

  var focused = false;

  var crime = "TOTAL";

  var popupTemplate = require("./_popupTemplate.html");
  ich.addTemplate("popupTemplate", popupTemplate);

  var onEachFeature = function(feature, layer) {
    layer.bindPopup(ich.popupTemplate({
      number: feature.properties[crime + "_time"],
      count: commafy(feature.properties[crime + "_count"])
    }));
    layer.on({
      popupopen: function(e) {
        e.popup.setContent(ich.popupTemplate({
          number: feature.properties[crime + "_time"],
          count: commafy(feature.properties[crime + "_count"])
        }));
        focused = layer;
        layer.setStyle({ weight: 2, fillOpacity: 1 });
      },
      mouseover: function(e) {
        layer.setStyle({ weight: 2, fillOpacity: 1 });
      },
      mouseout: function(e) {
        if (focused && focused == layer) { return }
        layer.setStyle({ weight: 0.5, fillOpacity: 0.7 });
      }
    });
  };

  map.on("popupclose", function() {
    if (focused) {
      focused.setStyle({ weight: 0.5, fillOpacity: 0.7 });
      focused = false;
    }
  });

  function getColor(d) {
    return d >= 12 ? '#990000' :
           d >= 11 ? '#d7301f' :
           d >= 10 ? '#ef6548' :
           d >= 9 ? '#fc8d59' :
           d >= 8 ? '#fdbb84' :
           d >= 7  ? '#fdd49e' :
           d >= 6 ? '#d0d1e6' :
           d >= 5 ? '#a6bddb' :
           d >= 4 ? '#74a9cf' :
           d >= 3 ? '#3690c0' :
           d >= 2 ? '#0570b0' :
           '#034e7b' ;
  }

  function style(feature) {
    return {
      fillColor: getColor(feature.properties[crime + "_decimal"]),
      weight: 0.5,
      opacity: 1,
      color: 'white',
      fillOpacity: 0.7
    };
  }

  function commafy( num ) {
    if (!num) return;
    if (num.length >= 4) {
      num = num.replace(/(\d)(?=(\d{3})+$)/g, '$1,');
    }
    return num;
  }

  var geojson = L.geoJson(data, {
    style: style, 
    onEachFeature: onEachFeature
  }).addTo(map);

  Array.prototype.slice.call(document.querySelectorAll('.tab')).forEach(function(tab) {
    tab.addEventListener("click", function() {
      if (document.querySelector(".selected")) document.querySelector(".selected").classList.remove("selected");
      tab.classList.add("selected");
      crime = tab.getAttribute("data-crime");
      // if (country == "Overall foreign-born population") {
      //   document.querySelector(".key").innerHTML = ich.overallLegend();
      //   countryLookup = "PercentForeignBorn";
      // } else {
      //   if (country == "Middle East" || country == "Philippines") {
      //     var countryLabel = "the " + country;
      //   } else {
      //     var countryLabel = country;
      //   }
      //   document.querySelector(".key").innerHTML = ich.countryLegend({
      //     country: countryLabel,
      //     total: totalLookup[country]
      //   });
      //   countryLookup = tab.innerHTML.split(' ').join('');
      // }
      geojson.setStyle(style);
      map.closePopup();
    })
  });

}