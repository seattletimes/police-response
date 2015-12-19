// require("./lib/social");
// require("./lib/ads");
// var track = require("./lib/tracking");

require("component-responsive-frame/child");
require("component-leaflet-map");

console.log(breakdownData)

var lookup = {
  "TOTAL": "All Priority-One reports",
  "MISSC1": "Missing child",
  "SUIC1": "Suicidal person",
  "ASLTV1": "Domestic violence",
  "BURGR1": "Residential burglary",
  "OD1": "Drug overdose",
  "SHOTS1": "Gunshots reported"
}

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
    // var breakdown = breakdownData[feature.properties.BEAT]
    layer.bindPopup("", {
      minWidth: 200
    });

    layer.on({
      popupopen: function(e) {
        e.popup.setContent(ich.popupTemplate({
          number: feature.properties[crime + "_time"],
          count: commafy(feature.properties[crime + "_count"]),
          breakdown0: breakdownData[feature.properties.BEAT][crime + "_0"],
          breakdown1: breakdownData[feature.properties.BEAT][crime + "_7"],
          breakdown2: breakdownData[feature.properties.BEAT][crime + "_10"],
          breakdown3: breakdownData[feature.properties.BEAT][crime + "_20"],
          breakdown4: breakdownData[feature.properties.BEAT][crime + "_30"],
          crime: lookup[crime],
          crimeCode: crime,
          beat: feature.properties.BEAT,
          color: getColor(feature.properties[crime + "_decimal"], feature.properties[crime + "_count"])
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

  function getColor(d, c) {
    if (c >= 10) {
      return d >= 12 ? '#8B261C' :
             d >= 11 ? '#D74A28' :
             d >= 10 ? '#DD703A' :
             d >= 9 ? '#FBAF41' :
             d >= 8 ? '#FFD296' :
             d >= 7  ? '#FFF0C5' :
             d >= 6 ? '#E3F3F2' :
             d >= 5 ? '#C4E7E6' :
             d >= 4 ? '#7DB9B3' :
             d >= 3 ? '#4E8B92' :
             d >= 2 ? '#176878' :
             '#164655' ;
    } else {
      return "#333"
    }
  };

  function style(feature) {
    return {
      fillColor: getColor(feature.properties[crime + "_decimal"], feature.properties[crime + "_count"]),
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