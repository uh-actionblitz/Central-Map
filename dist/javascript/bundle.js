'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MapManager = function () {
  function MapManager(geojson, statusData, contact) {
    _classCallCheck(this, MapManager);

    //Initializing Map
    this.map = new L.map('map').setView([42.863, -74.752], 6.55);
    L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy;<a href="https://carto.com/attribution">CARTO</a>. Interactivity by <a href="//actionblitz.org">ActionBlitz</a>'
    }).addTo(this.map);

    this.statusData = statusData;
    this.geojson = geojson;
    this.contact = contact;

    this.render();
  }

  /***
  * private method _renderBubble
  *
  */


  _createClass(MapManager, [{
    key: '_renderBubble',
    value: function _renderBubble(event) {

      var popup;
      var senator = event.target.options.statusData;
      var moreInfo = event.target.options.contact;

      var content = '<div>\n        <section className="senator-image-container">\n          <img src="' + senator.image + '" />\n        </section>\n        <section className="senator-info">\n          <div>' + senator.name + '</div>\n          <div>Party: ' + moreInfo.party + '</div>\n          <div>Senate District ' + senator.district + '</div>\n          <div class="' + (senator.status === 'FOR' ? 'votes-yes' : 'votes-no') + '">\n              ' + (senator.status === 'TARGET' ? 'High priority' : senator.status === 'FOR' ? 'Co-Sponsor' : 'No support') + '\n          </div>\n        </section>\n        <a href="' + moreInfo.contact + '" class="contact-link" target="_blank">Contact</button>\n      </div>';

      popup = L.popup({
        closeButton: true,
        className: 'senator-popup'
      });

      popup.setContent(content);
      event.target.bindPopup(popup).openPopup();
    }
  }, {
    key: '_onEachFeature',
    value: function _onEachFeature(feature, layer) {
      //
      // console.log(senators[feature.properties.NAME - 1].status)
      var that = this;

      var status = this.statusData[feature.properties.NAME - 1].status;

      // Create Circle Marker
      L.circleMarker(layer.getBounds().getCenter(), {
        radius: 7,
        fillColor: this._colorDistrict(feature),
        color: 'white',
        opacity: 1,
        fillOpacity: 0.7,

        //Data
        statusData: this.statusData[feature.properties.NAME - 1],
        contact: this.contact[feature.properties.NAME - 1]
      }).on({
        click: this._renderBubble.bind(this)
      }).addTo(this.map);

      layer.on({
        click: function click(e) {
          console.log("CLICKED ::: ", e);
          // this.map.fitBounds(layer.getBounds());
          window.location.hash = '#lat=' + e.latlng.lat + '&lon=' + e.latlng.lng;
        }
      });

      layer._leaflet_id = feature.id;
      // layer.on({
      // mouseover: handleMouseOver,
      // mouseout: handleMouseOut
      // });
    }
  }, {
    key: '_layerStyle',
    value: function _layerStyle() {
      return {
        fillColor: 'gray',
        fillOpacity: 0.01,
        color: 'gray',
        opacity: '1',
        weight: 1
      };
    }
  }, {
    key: '_chosenStyle',
    value: function _chosenStyle() {
      return {
        fillColor: 'green',
        fillOpacity: 0.5
      };
    }
  }, {
    key: '_resetLayerStyle',
    value: function _resetLayerStyle(layer) {
      layer.setStyle(this._layerStyle());
    }
  }, {
    key: '_colorDistrict',
    value: function _colorDistrict(district) {
      var status = this.statusData[district.properties.NAME - 1].status;

      switch (status) {
        case 'FOR':
          return '#1e90ff';
          break;
        case 'AGAINST':
          return '#FF4C50';
          break;
        case 'TARGET':
          return '#CC0004';
          break;
      }
    }
  }, {
    key: 'render',
    value: function render() {
      //Call geojson
      this.districts = L.geoJSON(this.geojson, {
        style: this._layerStyle.bind(this),
        onEachFeature: this._onEachFeature.bind(this)
      });
      this.districts.addTo(this.map);
      this.districts.bringToBack();

      console.log(this.layers);
    }

    //FitBounds on the district

  }, {
    key: 'focusOnDistrict',
    value: function focusOnDistrict(latLng) {
      var target = leafletPip.pointInLayer(latLng, this.districts, true)[0];

      if (target) {
        this.map.fitBounds(target.getBounds());
        this.districts.eachLayer(this._resetLayerStyle.bind(this));
        target.setStyle(this._chosenStyle());
        //Refresh whole map
      }
    }
  }]);

  return MapManager;
}();
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * RepresentativeManager
 * Facilitates the retrieval of the user's Representative based on their Address
 **/
var RepresentativeManager = function () {
  function RepresentativeManager(map, status, contact) {
    _classCallCheck(this, RepresentativeManager);

    this.map = map;
    this.status = status;
    this.contact = contact;

    this.representativeContainer = $("#senator-info");

    //create listeners
    this.addEvents();
  }

  _createClass(RepresentativeManager, [{
    key: "addEvents",
    value: function addEvents() {
      var _this = this;

      //Close
      this.representativeContainer.on('click', "a.close", function () {
        return _this.representativeContainer.empty();
      });
    }
  }, {
    key: "showRepresentative",
    value: function showRepresentative(latLng) {
      this.target = leafletPip.pointInLayer(latLng, this.map.districts, true)[0];
      console.log("RepresentativeManager", this.target);

      this.render();
    }
  }, {
    key: "renderParties",
    value: function renderParties(parties) {
      var partyList = parties.split(',');
      var toString = partyList.map(function (i) {
        return "<li class='party " + i + "'><span>" + i + "</span></li>";
      }).join('');
      return "<ul class='parties'>" + toString + "</ul>";
    }
  }, {
    key: "renderThanks",
    value: function renderThanks(repToRender) {
      return "\n      <div>\n        <p class='status'>\n          " + (repToRender.status === "FOR" ? "Sen. " + repToRender.name + " is <strong>supportive</strong> of the New York Health Act (S4840). Call the senator to thank them!" : "Sen. " + repToRender.name + " is not yet supportive of the New York Health Act  (S4840). Call them to encourage and urge them to give their support to this important bill.") + "\n        </p>\n        <h4>Here's How</h4>\n        <h5>1. Call the senator at <i class=\"fa fa-phone\" aria-hidden=\"true\"></i> " + repToRender.phone + "</h5>\n        <h5>2. Thank them through their staff!</h5>\n        <p>The staffer will make sure that your message is sent to the senator.</p>\n        <sub>Sample Message</sub>\n        <blockquote>\n          Hi! My name is ______. I am a constituent of Sen. " + repToRender.name + " at zipcode _____. I am sending my thanks to the senator for supporting and co-sponsoring the New York Health Act (S4840).\n          Health care is a very important issue for me, and the senator's support means a lot. Thank you!\n        </blockquote>\n        <h5>3. Tell your friends to call!</h5>\n        <p>Share this page with your friends and urge them to call your senator!</p>\n      </div>\n    ";
    }
  }, {
    key: "renderUrge",
    value: function renderUrge(repToRender) {
      return "\n    <div>\n      <p class='status'>\n        " + (repToRender.status === "FOR" ? "Sen. " + repToRender.name + " is <strong>supportive</strong> of the New York Health Act (S4840). Call the senator to thank them!" : "Sen. " + repToRender.name + " is <strong class='not'>not yet supportive</strong> of the New York Health Act  (S4840). Call them to encourage and urge them to give their support to this important bill.") + "\n      </p>\n      <h4>Here's How</h4>\n      <h5>1. Call the senator at <i class=\"fa fa-phone\" aria-hidden=\"true\"></i> " + repToRender.phone + "</h5>\n      <h5>2. Talk to them about your support!</h5>\n      <p>You will most likely talk with a staffer. Tell them about your story. The staffer will make sure that your message is sent to the senator.</p>\n      <sub>Sample Message</sub>\n      <blockquote>\n        Hi! My name is ______. I am a constituent of Sen. " + repToRender.name + " at zipcode _____.\n        I am strongly urging the senator to support and co-sponsor the New York Health Act (S4840).\n        Health care is a very important issue for me, and the senator's support means a lot. Thank you!\n      </blockquote>\n      <h5>3. Tell your friends to call!</h5>\n      <p>Share this page with your friends and urge them to call your senator!</p>\n    </div>\n    ";
    }
  }, {
    key: "render",
    value: function render() {
      if (!this.target) return null;

      var districtNumber = parseInt(this.target.feature.properties.NAME);
      var repToRender = this.status.filter(function (i) {
        return i.district == districtNumber;
      })[0];
      var contactOfRep = this.contact.filter(function (i) {
        return i.district == districtNumber;
      })[0];

      console.log(repToRender, contactOfRep);
      this.representativeContainer.html("<div>\n        <a href=\"javascript: void(null)\" class='close'><i class=\"fa fa-times-circle-o\" aria-hidden=\"true\"></i></a>\n        <h5 class='your-senator'>Your State Senator</h5>\n        <div class='basic-info'>\n          <img src='" + contactOfRep.image + "' class='rep-pic' />\n          <h5>NY District " + repToRender.district + "</h5>\n          <h3>" + repToRender.name + "</h3>\n          <p>" + this.renderParties(contactOfRep.party) + "</p>\n        </div>\n        <div class='action-area'>\n          " + (repToRender.status === "FOR" ? this.renderThanks(repToRender) : this.renderUrge(repToRender)) + "\n        </div>\n        <div class='website'>\n          <a href='" + repToRender.contact + "' target='_blank'>More ways to contact <strong>Sen. " + repToRender.name + "</strong></a>\n        <div>\n       </div>");
    }
  }]);

  return RepresentativeManager;
}();
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
* Facilitates the search
*/

var SearchManager = function () {
  function SearchManager() {
    _classCallCheck(this, SearchManager);

    this.target = $("#form-area");
    this.addressForm = $("#form-area #address");

    this.searchSuggestionsContainer = $("#search-results");
    this.searchSuggestions = $("#search-results ul");
    this.chosenLocation = null;

    this.timeout = null;

    this.searchSuggestionsContainer.hide();
    this._startListener();
    this.render();
  }

  _createClass(SearchManager, [{
    key: "_startListener",
    value: function _startListener() {
      var _this = this;

      var that = this;

      // Listen to address changes
      this.addressForm.bind('keyup', function (ev) {
        var address = ev.target.value;

        clearTimeout(_this.timeout);
        _this.timeout = setTimeout(function () {
          //Filter the addresses
          $.getJSON('https://nominatim.openstreetmap.org/search/' + encodeURIComponent(address) + '?format=json', function (data) {
            that.searchSuggestionsContainer.show();
            _this.data = data;
            that.render();
          });
        }, 500);
      });

      this.target.find("form").on("submit", function () {
        return false;
      });

      //Listen to clicking of suggestions
      that.searchSuggestionsContainer.on("click", "a", function (ev) {
        console.log("Test");
        that.searchSuggestionsContainer.hide();
      });
    }
  }, {
    key: "render",
    value: function render() {
      this.searchSuggestions.empty();
      if (this.data) {
        this.searchSuggestions.append(this.data.slice(0, 10).map(function (item) {
          return "\n        <li>\n          <div class='suggestion' lon=\"" + item.lon + "\" lat=\"" + item.lat + "\">\n            <a href='#lon=" + item.lon + "&lat=" + item.lat + "'>" + item.display_name + "</a>\n          </div>\n        </li>";
        }));
      }
    }
  }]);

  return SearchManager;
}();
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var StoriesListManager = function () {
  function StoriesListManager(geojson, statusData, contact, stories) {
    _classCallCheck(this, StoriesListManager);

    this.geojson = geojson;
    this.statusData = statusData;
    this.contact = contact;
    this.stories = stories;

    this.storiesList = $("#stories");
  }

  _createClass(StoriesListManager, [{
    key: "listNearbyStories",
    value: function listNearbyStories(latLng) {
      console.log("StoriesListManager", latLng);
    }
  }]);

  return StoriesListManager;
}();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var App = function () {
  function App(options) {
    _classCallCheck(this, App);

    this.Map = null;
    this.render();
  }

  _createClass(App, [{
    key: 'render',
    value: function render() {
      //Loading data...
      var mapFetch = $.getJSON('/data/nys-senatemap.json');
      var senatorStatusFetch = $.getJSON('/data/status.json');
      var stateSenatorsInfo = $.getJSON('/data/state-senators.json');
      var storiesInfo = $.getJSON('/data/stories.json');
      var that = this;
      $.when(mapFetch, senatorStatusFetch, stateSenatorsInfo, storiesInfo).then(function (geojson, statusData, contact, stories) {
        that.Map = new MapManager(geojson[0], statusData[0], contact[0], stories[0]);
        that.StoryList = new StoriesListManager(geojson[0], statusData[0], contact[0], stories[0]);
        that.Search = new SearchManager();
        that.Rep = new RepresentativeManager(that.Map, statusData[0], contact[0]);
        that._listenToWindow();
      });
    }
  }, {
    key: '_listenToWindow',
    value: function _listenToWindow() {
      var _this = this;

      $(window).on('hashchange', function () {
        if (window.location.hash && window.location.hash.length > 0) {
          var hash = $.deparam(window.location.hash.substring(1));

          var latLng = new L.latLng(hash.lat, hash.lon);
          // Trigger various managers
          _this.StoryList.listNearbyStories(latLng);
          _this.Rep.showRepresentative(latLng);
          _this.Map.focusOnDistrict(latLng);
        }
      });
      $(window).trigger("hashchange");
    }
  }]);

  return App;
}();

window.AppManager = new App({});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvbWFwLmpzIiwiY2xhc3Nlcy9yZXByZXNlbnRhdGl2ZS5qcyIsImNsYXNzZXMvc2VhcmNoLmpzIiwiY2xhc3Nlcy9zdG9yaWVzbGlzdC5qcyIsImFwcC5qcyJdLCJuYW1lcyI6WyJNYXBNYW5hZ2VyIiwiZ2VvanNvbiIsInN0YXR1c0RhdGEiLCJjb250YWN0IiwibWFwIiwiTCIsInNldFZpZXciLCJ0aWxlTGF5ZXIiLCJtYXhab29tIiwiYXR0cmlidXRpb24iLCJhZGRUbyIsInJlbmRlciIsImV2ZW50IiwicG9wdXAiLCJzZW5hdG9yIiwidGFyZ2V0Iiwib3B0aW9ucyIsIm1vcmVJbmZvIiwiY29udGVudCIsImltYWdlIiwibmFtZSIsInBhcnR5IiwiZGlzdHJpY3QiLCJzdGF0dXMiLCJjbG9zZUJ1dHRvbiIsImNsYXNzTmFtZSIsInNldENvbnRlbnQiLCJiaW5kUG9wdXAiLCJvcGVuUG9wdXAiLCJmZWF0dXJlIiwibGF5ZXIiLCJ0aGF0IiwicHJvcGVydGllcyIsIk5BTUUiLCJjaXJjbGVNYXJrZXIiLCJnZXRCb3VuZHMiLCJnZXRDZW50ZXIiLCJyYWRpdXMiLCJmaWxsQ29sb3IiLCJfY29sb3JEaXN0cmljdCIsImNvbG9yIiwib3BhY2l0eSIsImZpbGxPcGFjaXR5Iiwib24iLCJjbGljayIsIl9yZW5kZXJCdWJibGUiLCJiaW5kIiwiZSIsImNvbnNvbGUiLCJsb2ciLCJ3aW5kb3ciLCJsb2NhdGlvbiIsImhhc2giLCJsYXRsbmciLCJsYXQiLCJsbmciLCJfbGVhZmxldF9pZCIsImlkIiwid2VpZ2h0Iiwic2V0U3R5bGUiLCJfbGF5ZXJTdHlsZSIsImRpc3RyaWN0cyIsImdlb0pTT04iLCJzdHlsZSIsIm9uRWFjaEZlYXR1cmUiLCJfb25FYWNoRmVhdHVyZSIsImJyaW5nVG9CYWNrIiwibGF5ZXJzIiwibGF0TG5nIiwibGVhZmxldFBpcCIsInBvaW50SW5MYXllciIsImZpdEJvdW5kcyIsImVhY2hMYXllciIsIl9yZXNldExheWVyU3R5bGUiLCJfY2hvc2VuU3R5bGUiLCJSZXByZXNlbnRhdGl2ZU1hbmFnZXIiLCJyZXByZXNlbnRhdGl2ZUNvbnRhaW5lciIsIiQiLCJhZGRFdmVudHMiLCJlbXB0eSIsInBhcnRpZXMiLCJwYXJ0eUxpc3QiLCJzcGxpdCIsInRvU3RyaW5nIiwiaSIsImpvaW4iLCJyZXBUb1JlbmRlciIsInBob25lIiwiZGlzdHJpY3ROdW1iZXIiLCJwYXJzZUludCIsImZpbHRlciIsImNvbnRhY3RPZlJlcCIsImh0bWwiLCJyZW5kZXJQYXJ0aWVzIiwicmVuZGVyVGhhbmtzIiwicmVuZGVyVXJnZSIsIlNlYXJjaE1hbmFnZXIiLCJhZGRyZXNzRm9ybSIsInNlYXJjaFN1Z2dlc3Rpb25zQ29udGFpbmVyIiwic2VhcmNoU3VnZ2VzdGlvbnMiLCJjaG9zZW5Mb2NhdGlvbiIsInRpbWVvdXQiLCJoaWRlIiwiX3N0YXJ0TGlzdGVuZXIiLCJldiIsImFkZHJlc3MiLCJ2YWx1ZSIsImNsZWFyVGltZW91dCIsInNldFRpbWVvdXQiLCJnZXRKU09OIiwiZW5jb2RlVVJJQ29tcG9uZW50IiwiZGF0YSIsInNob3ciLCJmaW5kIiwiYXBwZW5kIiwic2xpY2UiLCJpdGVtIiwibG9uIiwiZGlzcGxheV9uYW1lIiwiU3Rvcmllc0xpc3RNYW5hZ2VyIiwic3RvcmllcyIsInN0b3JpZXNMaXN0IiwiQXBwIiwiTWFwIiwibWFwRmV0Y2giLCJzZW5hdG9yU3RhdHVzRmV0Y2giLCJzdGF0ZVNlbmF0b3JzSW5mbyIsInN0b3JpZXNJbmZvIiwid2hlbiIsInRoZW4iLCJTdG9yeUxpc3QiLCJTZWFyY2giLCJSZXAiLCJfbGlzdGVuVG9XaW5kb3ciLCJsZW5ndGgiLCJkZXBhcmFtIiwic3Vic3RyaW5nIiwibGlzdE5lYXJieVN0b3JpZXMiLCJzaG93UmVwcmVzZW50YXRpdmUiLCJmb2N1c09uRGlzdHJpY3QiLCJ0cmlnZ2VyIiwiQXBwTWFuYWdlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0lBQU1BO0FBQ0osc0JBQVlDLE9BQVosRUFBcUJDLFVBQXJCLEVBQWlD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QUFDRCxPQVBEO0FBUUQ7OztzQ0FFaUI7QUFBQTs7QUFFaEJ4RCxRQUFFM0IsTUFBRixFQUFVUCxFQUFWLENBQWEsWUFBYixFQUEyQixZQUFJO0FBQzdCLFlBQUlPLE9BQU9DLFFBQVAsQ0FBZ0JDLElBQWhCLElBQXdCRixPQUFPQyxRQUFQLENBQWdCQyxJQUFoQixDQUFxQmtGLE1BQXJCLEdBQThCLENBQTFELEVBQ0E7QUFDRSxjQUFNbEYsT0FBT3lCLEVBQUUwRCxPQUFGLENBQVVyRixPQUFPQyxRQUFQLENBQWdCQyxJQUFoQixDQUFxQm9GLFNBQXJCLENBQStCLENBQS9CLENBQVYsQ0FBYjs7QUFFQSxjQUFNcEUsU0FBUyxJQUFJL0QsRUFBRStELE1BQU4sQ0FBYWhCLEtBQUtFLEdBQWxCLEVBQXVCRixLQUFLaUUsR0FBNUIsQ0FBZjtBQUNBO0FBQ0EsZ0JBQUthLFNBQUwsQ0FBZU8saUJBQWYsQ0FBaUNyRSxNQUFqQztBQUNBLGdCQUFLZ0UsR0FBTCxDQUFTTSxrQkFBVCxDQUE0QnRFLE1BQTVCO0FBQ0EsZ0JBQUt1RCxHQUFMLENBQVNnQixlQUFULENBQXlCdkUsTUFBekI7QUFDRDtBQUNGLE9BWEQ7QUFZQVMsUUFBRTNCLE1BQUYsRUFBVTBGLE9BQVYsQ0FBa0IsWUFBbEI7QUFDRDs7Ozs7O0FBR0gxRixPQUFPMkYsVUFBUCxHQUFvQixJQUFJbkIsR0FBSixDQUFRLEVBQVIsQ0FBcEIiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgTWFwTWFuYWdlciB7XG4gIGNvbnN0cnVjdG9yKGdlb2pzb24sIHN0YXR1c0RhdGEsIGNvbnRhY3QpIHtcblxuICAgIC8vSW5pdGlhbGl6aW5nIE1hcFxuICAgIHRoaXMubWFwID0gbmV3IEwubWFwKCdtYXAnKS5zZXRWaWV3KFs0Mi44NjMsLTc0Ljc1Ml0sIDYuNTUpO1xuICAgIEwudGlsZUxheWVyKCdodHRwczovL2NhcnRvZGItYmFzZW1hcHMte3N9Lmdsb2JhbC5zc2wuZmFzdGx5Lm5ldC9saWdodF9hbGwve3p9L3t4fS97eX0ucG5nJywge1xuICAgICAgbWF4Wm9vbTogMTgsXG4gICAgICBhdHRyaWJ1dGlvbjogJyZjb3B5OyA8YSBocmVmPVwiaHR0cDovL3d3dy5vcGVuc3RyZWV0bWFwLm9yZy9jb3B5cmlnaHRcIj5PcGVuU3RyZWV0TWFwPC9hPiwgJmNvcHk7PGEgaHJlZj1cImh0dHBzOi8vY2FydG8uY29tL2F0dHJpYnV0aW9uXCI+Q0FSVE88L2E+LiBJbnRlcmFjdGl2aXR5IGJ5IDxhIGhyZWY9XCIvL2FjdGlvbmJsaXR6Lm9yZ1wiPkFjdGlvbkJsaXR6PC9hPidcbiAgICB9KS5hZGRUbyh0aGlzLm1hcCk7XG5cblxuICAgIHRoaXMuc3RhdHVzRGF0YSA9IHN0YXR1c0RhdGE7XG4gICAgdGhpcy5nZW9qc29uID0gZ2VvanNvbjtcbiAgICB0aGlzLmNvbnRhY3QgPSBjb250YWN0O1xuXG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgfVxuXG4gIC8qKipcbiAgKiBwcml2YXRlIG1ldGhvZCBfcmVuZGVyQnViYmxlXG4gICpcbiAgKi9cbiAgX3JlbmRlckJ1YmJsZShldmVudCkge1xuXG4gICAgdmFyIHBvcHVwO1xuICAgIHZhciBzZW5hdG9yID0gZXZlbnQudGFyZ2V0Lm9wdGlvbnMuc3RhdHVzRGF0YTtcbiAgICB2YXIgbW9yZUluZm8gPSBldmVudC50YXJnZXQub3B0aW9ucy5jb250YWN0O1xuXG4gICAgdmFyIGNvbnRlbnQgPSAoXG4gICAgICBgPGRpdj5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwic2VuYXRvci1pbWFnZS1jb250YWluZXJcIj5cbiAgICAgICAgICA8aW1nIHNyYz1cIiR7c2VuYXRvci5pbWFnZX1cIiAvPlxuICAgICAgICA8L3NlY3Rpb24+XG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInNlbmF0b3ItaW5mb1wiPlxuICAgICAgICAgIDxkaXY+JHtzZW5hdG9yLm5hbWV9PC9kaXY+XG4gICAgICAgICAgPGRpdj5QYXJ0eTogJHttb3JlSW5mby5wYXJ0eX08L2Rpdj5cbiAgICAgICAgICA8ZGl2PlNlbmF0ZSBEaXN0cmljdCAke3NlbmF0b3IuZGlzdHJpY3R9PC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cIiR7KHNlbmF0b3Iuc3RhdHVzID09PSAnRk9SJykgPyAndm90ZXMteWVzJyA6ICd2b3Rlcy1ubyd9XCI+XG4gICAgICAgICAgICAgICR7c2VuYXRvci5zdGF0dXMgPT09ICdUQVJHRVQnID8gJ0hpZ2ggcHJpb3JpdHknIDogKHNlbmF0b3Iuc3RhdHVzID09PSAnRk9SJykgPyAnQ28tU3BvbnNvcicgOiAnTm8gc3VwcG9ydCd9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvc2VjdGlvbj5cbiAgICAgICAgPGEgaHJlZj1cIiR7bW9yZUluZm8uY29udGFjdH1cIiBjbGFzcz1cImNvbnRhY3QtbGlua1wiIHRhcmdldD1cIl9ibGFua1wiPkNvbnRhY3Q8L2J1dHRvbj5cbiAgICAgIDwvZGl2PmApO1xuXG4gICAgcG9wdXAgPSBMLnBvcHVwKHtcbiAgICAgIGNsb3NlQnV0dG9uOiB0cnVlLFxuICAgICAgY2xhc3NOYW1lOiAnc2VuYXRvci1wb3B1cCcsXG4gICAgIH0pO1xuXG4gICAgcG9wdXAuc2V0Q29udGVudChjb250ZW50KTtcbiAgICBldmVudC50YXJnZXQuYmluZFBvcHVwKHBvcHVwKS5vcGVuUG9wdXAoKTtcbiAgfVxuXG4gIF9vbkVhY2hGZWF0dXJlKGZlYXR1cmUsIGxheWVyKSB7XG4gICAgICAvL1xuICAgICAgLy8gY29uc29sZS5sb2coc2VuYXRvcnNbZmVhdHVyZS5wcm9wZXJ0aWVzLk5BTUUgLSAxXS5zdGF0dXMpXG4gICAgICBjb25zdCB0aGF0ID0gdGhpcztcblxuICAgICAgdmFyIHN0YXR1cyA9IHRoaXMuc3RhdHVzRGF0YVtmZWF0dXJlLnByb3BlcnRpZXMuTkFNRSAtIDFdLnN0YXR1cztcblxuICAgICAgLy8gQ3JlYXRlIENpcmNsZSBNYXJrZXJcbiAgICAgIEwuY2lyY2xlTWFya2VyKGxheWVyLmdldEJvdW5kcygpLmdldENlbnRlcigpLCB7XG4gICAgICAgIHJhZGl1czogNyxcbiAgICAgICAgZmlsbENvbG9yOiB0aGlzLl9jb2xvckRpc3RyaWN0KGZlYXR1cmUpLFxuICAgICAgICBjb2xvcjogJ3doaXRlJyxcbiAgICAgICAgb3BhY2l0eTogMSxcbiAgICAgICAgZmlsbE9wYWNpdHk6IDAuNyxcblxuICAgICAgICAvL0RhdGFcbiAgICAgICAgc3RhdHVzRGF0YTogdGhpcy5zdGF0dXNEYXRhW2ZlYXR1cmUucHJvcGVydGllcy5OQU1FIC0gMV0sXG4gICAgICAgIGNvbnRhY3Q6IHRoaXMuY29udGFjdFtmZWF0dXJlLnByb3BlcnRpZXMuTkFNRSAtIDFdLFxuICAgICAgfSlcbiAgICAgIC5vbih7XG4gICAgICAgIGNsaWNrOiB0aGlzLl9yZW5kZXJCdWJibGUuYmluZCh0aGlzKSxcbiAgICAgIH0pLmFkZFRvKHRoaXMubWFwKTtcblxuXG4gICAgICBsYXllci5vbih7XG4gICAgICAgIGNsaWNrOiAoZSk9PntcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIkNMSUNLRUQgOjo6IFwiLCBlKTtcbiAgICAgICAgICAvLyB0aGlzLm1hcC5maXRCb3VuZHMobGF5ZXIuZ2V0Qm91bmRzKCkpO1xuICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gYCNsYXQ9JHtlLmxhdGxuZy5sYXR9Jmxvbj0ke2UubGF0bG5nLmxuZ31gXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIGxheWVyLl9sZWFmbGV0X2lkID0gZmVhdHVyZS5pZFxuICAgICAgLy8gbGF5ZXIub24oe1xuICAgICAgICAvLyBtb3VzZW92ZXI6IGhhbmRsZU1vdXNlT3ZlcixcbiAgICAgICAgLy8gbW91c2VvdXQ6IGhhbmRsZU1vdXNlT3V0XG4gICAgICAvLyB9KTtcbiAgICB9XG5cbiAgX2xheWVyU3R5bGUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGZpbGxDb2xvcjogJ2dyYXknLFxuICAgICAgZmlsbE9wYWNpdHk6IDAuMDEsXG4gICAgICBjb2xvcjogJ2dyYXknLFxuICAgICAgb3BhY2l0eTogJzEnLFxuICAgICAgd2VpZ2h0OiAxXG4gICAgfTtcbiAgfVxuICBfY2hvc2VuU3R5bGUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGZpbGxDb2xvcjogJ2dyZWVuJyxcbiAgICAgIGZpbGxPcGFjaXR5OiAwLjVcbiAgICB9XG4gIH1cblxuICBfcmVzZXRMYXllclN0eWxlKGxheWVyKSB7XG4gICAgbGF5ZXIuc2V0U3R5bGUodGhpcy5fbGF5ZXJTdHlsZSgpKTtcbiAgfVxuXG4gIF9jb2xvckRpc3RyaWN0KGRpc3RyaWN0KSB7XG4gICAgdmFyIHN0YXR1cyA9IHRoaXMuc3RhdHVzRGF0YVtkaXN0cmljdC5wcm9wZXJ0aWVzLk5BTUUgLSAxXS5zdGF0dXM7XG5cbiAgICBzd2l0Y2goc3RhdHVzKSB7XG4gICAgICBjYXNlICdGT1InOlxuICAgICAgICByZXR1cm4gJyMxZTkwZmYnO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ0FHQUlOU1QnOlxuICAgICAgICByZXR1cm4gJyNGRjRDNTAnO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ1RBUkdFVCc6XG4gICAgICAgIHJldHVybiAnI0NDMDAwNCc7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICAvL0NhbGwgZ2VvanNvblxuICAgIHRoaXMuZGlzdHJpY3RzID0gTC5nZW9KU09OKHRoaXMuZ2VvanNvbiwge1xuICAgICAgc3R5bGU6IHRoaXMuX2xheWVyU3R5bGUuYmluZCh0aGlzKSxcbiAgICAgIG9uRWFjaEZlYXR1cmU6IHRoaXMuX29uRWFjaEZlYXR1cmUuYmluZCh0aGlzKVxuICAgIH0pXG4gICAgdGhpcy5kaXN0cmljdHMuYWRkVG8odGhpcy5tYXApO1xuICAgIHRoaXMuZGlzdHJpY3RzLmJyaW5nVG9CYWNrKCk7XG5cbiAgICBjb25zb2xlLmxvZyh0aGlzLmxheWVycyk7XG4gIH1cblxuICAvL0ZpdEJvdW5kcyBvbiB0aGUgZGlzdHJpY3RcbiAgZm9jdXNPbkRpc3RyaWN0KGxhdExuZykge1xuICAgIGNvbnN0IHRhcmdldCA9IGxlYWZsZXRQaXAucG9pbnRJbkxheWVyKGxhdExuZywgdGhpcy5kaXN0cmljdHMsIHRydWUpWzBdO1xuXG4gICAgaWYgKHRhcmdldCkge1xuICAgICAgdGhpcy5tYXAuZml0Qm91bmRzKHRhcmdldC5nZXRCb3VuZHMoKSk7XG4gICAgICB0aGlzLmRpc3RyaWN0cy5lYWNoTGF5ZXIodGhpcy5fcmVzZXRMYXllclN0eWxlLmJpbmQodGhpcykpO1xuICAgICAgdGFyZ2V0LnNldFN0eWxlKHRoaXMuX2Nob3NlblN0eWxlKCkpXG4gICAgICAvL1JlZnJlc2ggd2hvbGUgbWFwXG4gICAgfVxuXG5cblxuICB9XG59XG4iLCIvKipcbiAqIFJlcHJlc2VudGF0aXZlTWFuYWdlclxuICogRmFjaWxpdGF0ZXMgdGhlIHJldHJpZXZhbCBvZiB0aGUgdXNlcidzIFJlcHJlc2VudGF0aXZlIGJhc2VkIG9uIHRoZWlyIEFkZHJlc3NcbiAqKi9cbmNsYXNzIFJlcHJlc2VudGF0aXZlTWFuYWdlciB7XG5cbiAgY29uc3RydWN0b3IobWFwLCBzdGF0dXMsIGNvbnRhY3QpIHtcbiAgICB0aGlzLm1hcCA9IG1hcDtcbiAgICB0aGlzLnN0YXR1cyA9IHN0YXR1cztcbiAgICB0aGlzLmNvbnRhY3QgPSBjb250YWN0O1xuXG4gICAgdGhpcy5yZXByZXNlbnRhdGl2ZUNvbnRhaW5lciA9ICQoXCIjc2VuYXRvci1pbmZvXCIpO1xuXG4gICAgLy9jcmVhdGUgbGlzdGVuZXJzXG4gICAgdGhpcy5hZGRFdmVudHMoKTtcbiAgfVxuXG4gIGFkZEV2ZW50cygpIHtcbiAgICAvL0Nsb3NlXG4gICAgdGhpcy5yZXByZXNlbnRhdGl2ZUNvbnRhaW5lci5vbignY2xpY2snLCBcImEuY2xvc2VcIiwgKCkgPT4gdGhpcy5yZXByZXNlbnRhdGl2ZUNvbnRhaW5lci5lbXB0eSgpKTtcbiAgfVxuXG4gIHNob3dSZXByZXNlbnRhdGl2ZShsYXRMbmcpIHtcbiAgICB0aGlzLnRhcmdldCA9IGxlYWZsZXRQaXAucG9pbnRJbkxheWVyKGxhdExuZywgdGhpcy5tYXAuZGlzdHJpY3RzLCB0cnVlKVswXTtcbiAgICBjb25zb2xlLmxvZyhcIlJlcHJlc2VudGF0aXZlTWFuYWdlclwiLCB0aGlzLnRhcmdldCk7XG5cbiAgICB0aGlzLnJlbmRlcigpO1xuICB9XG5cbiAgcmVuZGVyUGFydGllcyhwYXJ0aWVzKSB7XG4gICAgY29uc3QgcGFydHlMaXN0ID0gcGFydGllcy5zcGxpdCgnLCcpO1xuICAgIGNvbnN0IHRvU3RyaW5nID0gcGFydHlMaXN0Lm1hcChpPT5gPGxpIGNsYXNzPSdwYXJ0eSAke2l9Jz48c3Bhbj4ke2l9PC9zcGFuPjwvbGk+YCkuam9pbignJyk7XG4gICAgcmV0dXJuIGA8dWwgY2xhc3M9J3BhcnRpZXMnPiR7dG9TdHJpbmd9PC91bD5gO1xuICB9XG5cbiAgcmVuZGVyVGhhbmtzKHJlcFRvUmVuZGVyKSB7XG4gICAgcmV0dXJuIGBcbiAgICAgIDxkaXY+XG4gICAgICAgIDxwIGNsYXNzPSdzdGF0dXMnPlxuICAgICAgICAgICR7cmVwVG9SZW5kZXIuc3RhdHVzID09PSBcIkZPUlwiID8gYFNlbi4gJHtyZXBUb1JlbmRlci5uYW1lfSBpcyA8c3Ryb25nPnN1cHBvcnRpdmU8L3N0cm9uZz4gb2YgdGhlIE5ldyBZb3JrIEhlYWx0aCBBY3QgKFM0ODQwKS4gQ2FsbCB0aGUgc2VuYXRvciB0byB0aGFuayB0aGVtIWBcbiAgICAgICAgICAgIDogYFNlbi4gJHtyZXBUb1JlbmRlci5uYW1lfSBpcyBub3QgeWV0IHN1cHBvcnRpdmUgb2YgdGhlIE5ldyBZb3JrIEhlYWx0aCBBY3QgIChTNDg0MCkuIENhbGwgdGhlbSB0byBlbmNvdXJhZ2UgYW5kIHVyZ2UgdGhlbSB0byBnaXZlIHRoZWlyIHN1cHBvcnQgdG8gdGhpcyBpbXBvcnRhbnQgYmlsbC5gfVxuICAgICAgICA8L3A+XG4gICAgICAgIDxoND5IZXJlJ3MgSG93PC9oND5cbiAgICAgICAgPGg1PjEuIENhbGwgdGhlIHNlbmF0b3IgYXQgPGkgY2xhc3M9XCJmYSBmYS1waG9uZVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvaT4gJHtyZXBUb1JlbmRlci5waG9uZX08L2g1PlxuICAgICAgICA8aDU+Mi4gVGhhbmsgdGhlbSB0aHJvdWdoIHRoZWlyIHN0YWZmITwvaDU+XG4gICAgICAgIDxwPlRoZSBzdGFmZmVyIHdpbGwgbWFrZSBzdXJlIHRoYXQgeW91ciBtZXNzYWdlIGlzIHNlbnQgdG8gdGhlIHNlbmF0b3IuPC9wPlxuICAgICAgICA8c3ViPlNhbXBsZSBNZXNzYWdlPC9zdWI+XG4gICAgICAgIDxibG9ja3F1b3RlPlxuICAgICAgICAgIEhpISBNeSBuYW1lIGlzIF9fX19fXy4gSSBhbSBhIGNvbnN0aXR1ZW50IG9mIFNlbi4gJHtyZXBUb1JlbmRlci5uYW1lfSBhdCB6aXBjb2RlIF9fX19fLiBJIGFtIHNlbmRpbmcgbXkgdGhhbmtzIHRvIHRoZSBzZW5hdG9yIGZvciBzdXBwb3J0aW5nIGFuZCBjby1zcG9uc29yaW5nIHRoZSBOZXcgWW9yayBIZWFsdGggQWN0IChTNDg0MCkuXG4gICAgICAgICAgSGVhbHRoIGNhcmUgaXMgYSB2ZXJ5IGltcG9ydGFudCBpc3N1ZSBmb3IgbWUsIGFuZCB0aGUgc2VuYXRvcidzIHN1cHBvcnQgbWVhbnMgYSBsb3QuIFRoYW5rIHlvdSFcbiAgICAgICAgPC9ibG9ja3F1b3RlPlxuICAgICAgICA8aDU+My4gVGVsbCB5b3VyIGZyaWVuZHMgdG8gY2FsbCE8L2g1PlxuICAgICAgICA8cD5TaGFyZSB0aGlzIHBhZ2Ugd2l0aCB5b3VyIGZyaWVuZHMgYW5kIHVyZ2UgdGhlbSB0byBjYWxsIHlvdXIgc2VuYXRvciE8L3A+XG4gICAgICA8L2Rpdj5cbiAgICBgXG4gIH1cblxuICByZW5kZXJVcmdlKHJlcFRvUmVuZGVyKSB7XG4gICAgcmV0dXJuIGBcbiAgICA8ZGl2PlxuICAgICAgPHAgY2xhc3M9J3N0YXR1cyc+XG4gICAgICAgICR7cmVwVG9SZW5kZXIuc3RhdHVzID09PSBcIkZPUlwiID8gYFNlbi4gJHtyZXBUb1JlbmRlci5uYW1lfSBpcyA8c3Ryb25nPnN1cHBvcnRpdmU8L3N0cm9uZz4gb2YgdGhlIE5ldyBZb3JrIEhlYWx0aCBBY3QgKFM0ODQwKS4gQ2FsbCB0aGUgc2VuYXRvciB0byB0aGFuayB0aGVtIWBcbiAgICAgICAgICA6IGBTZW4uICR7cmVwVG9SZW5kZXIubmFtZX0gaXMgPHN0cm9uZyBjbGFzcz0nbm90Jz5ub3QgeWV0IHN1cHBvcnRpdmU8L3N0cm9uZz4gb2YgdGhlIE5ldyBZb3JrIEhlYWx0aCBBY3QgIChTNDg0MCkuIENhbGwgdGhlbSB0byBlbmNvdXJhZ2UgYW5kIHVyZ2UgdGhlbSB0byBnaXZlIHRoZWlyIHN1cHBvcnQgdG8gdGhpcyBpbXBvcnRhbnQgYmlsbC5gfVxuICAgICAgPC9wPlxuICAgICAgPGg0PkhlcmUncyBIb3c8L2g0PlxuICAgICAgPGg1PjEuIENhbGwgdGhlIHNlbmF0b3IgYXQgPGkgY2xhc3M9XCJmYSBmYS1waG9uZVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvaT4gJHtyZXBUb1JlbmRlci5waG9uZX08L2g1PlxuICAgICAgPGg1PjIuIFRhbGsgdG8gdGhlbSBhYm91dCB5b3VyIHN1cHBvcnQhPC9oNT5cbiAgICAgIDxwPllvdSB3aWxsIG1vc3QgbGlrZWx5IHRhbGsgd2l0aCBhIHN0YWZmZXIuIFRlbGwgdGhlbSBhYm91dCB5b3VyIHN0b3J5LiBUaGUgc3RhZmZlciB3aWxsIG1ha2Ugc3VyZSB0aGF0IHlvdXIgbWVzc2FnZSBpcyBzZW50IHRvIHRoZSBzZW5hdG9yLjwvcD5cbiAgICAgIDxzdWI+U2FtcGxlIE1lc3NhZ2U8L3N1Yj5cbiAgICAgIDxibG9ja3F1b3RlPlxuICAgICAgICBIaSEgTXkgbmFtZSBpcyBfX19fX18uIEkgYW0gYSBjb25zdGl0dWVudCBvZiBTZW4uICR7cmVwVG9SZW5kZXIubmFtZX0gYXQgemlwY29kZSBfX19fXy5cbiAgICAgICAgSSBhbSBzdHJvbmdseSB1cmdpbmcgdGhlIHNlbmF0b3IgdG8gc3VwcG9ydCBhbmQgY28tc3BvbnNvciB0aGUgTmV3IFlvcmsgSGVhbHRoIEFjdCAoUzQ4NDApLlxuICAgICAgICBIZWFsdGggY2FyZSBpcyBhIHZlcnkgaW1wb3J0YW50IGlzc3VlIGZvciBtZSwgYW5kIHRoZSBzZW5hdG9yJ3Mgc3VwcG9ydCBtZWFucyBhIGxvdC4gVGhhbmsgeW91IVxuICAgICAgPC9ibG9ja3F1b3RlPlxuICAgICAgPGg1PjMuIFRlbGwgeW91ciBmcmllbmRzIHRvIGNhbGwhPC9oNT5cbiAgICAgIDxwPlNoYXJlIHRoaXMgcGFnZSB3aXRoIHlvdXIgZnJpZW5kcyBhbmQgdXJnZSB0aGVtIHRvIGNhbGwgeW91ciBzZW5hdG9yITwvcD5cbiAgICA8L2Rpdj5cbiAgICBgXG4gIH1cbiAgcmVuZGVyKCkge1xuICAgIGlmICghdGhpcy50YXJnZXQpIHJldHVybiBudWxsO1xuXG4gICAgY29uc3QgZGlzdHJpY3ROdW1iZXIgPSBwYXJzZUludCh0aGlzLnRhcmdldC5mZWF0dXJlLnByb3BlcnRpZXMuTkFNRSk7XG4gICAgY29uc3QgcmVwVG9SZW5kZXIgPSB0aGlzLnN0YXR1cy5maWx0ZXIoaT0+aS5kaXN0cmljdCA9PSBkaXN0cmljdE51bWJlcilbMF07XG4gICAgY29uc3QgY29udGFjdE9mUmVwID0gdGhpcy5jb250YWN0LmZpbHRlcihpPT5pLmRpc3RyaWN0ID09IGRpc3RyaWN0TnVtYmVyKVswXTtcblxuICAgIGNvbnNvbGUubG9nKHJlcFRvUmVuZGVyLCBjb250YWN0T2ZSZXApO1xuICAgIHRoaXMucmVwcmVzZW50YXRpdmVDb250YWluZXIuaHRtbChcbiAgICAgIGA8ZGl2PlxuICAgICAgICA8YSBocmVmPVwiamF2YXNjcmlwdDogdm9pZChudWxsKVwiIGNsYXNzPSdjbG9zZSc+PGkgY2xhc3M9XCJmYSBmYS10aW1lcy1jaXJjbGUtb1wiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvaT48L2E+XG4gICAgICAgIDxoNSBjbGFzcz0neW91ci1zZW5hdG9yJz5Zb3VyIFN0YXRlIFNlbmF0b3I8L2g1PlxuICAgICAgICA8ZGl2IGNsYXNzPSdiYXNpYy1pbmZvJz5cbiAgICAgICAgICA8aW1nIHNyYz0nJHtjb250YWN0T2ZSZXAuaW1hZ2V9JyBjbGFzcz0ncmVwLXBpYycgLz5cbiAgICAgICAgICA8aDU+TlkgRGlzdHJpY3QgJHtyZXBUb1JlbmRlci5kaXN0cmljdH08L2g1PlxuICAgICAgICAgIDxoMz4ke3JlcFRvUmVuZGVyLm5hbWV9PC9oMz5cbiAgICAgICAgICA8cD4ke3RoaXMucmVuZGVyUGFydGllcyhjb250YWN0T2ZSZXAucGFydHkpfTwvcD5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9J2FjdGlvbi1hcmVhJz5cbiAgICAgICAgICAke3JlcFRvUmVuZGVyLnN0YXR1cyA9PT0gXCJGT1JcIiA/IHRoaXMucmVuZGVyVGhhbmtzKHJlcFRvUmVuZGVyKSA6IHRoaXMucmVuZGVyVXJnZShyZXBUb1JlbmRlcikgfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz0nd2Vic2l0ZSc+XG4gICAgICAgICAgPGEgaHJlZj0nJHtyZXBUb1JlbmRlci5jb250YWN0fScgdGFyZ2V0PSdfYmxhbmsnPk1vcmUgd2F5cyB0byBjb250YWN0IDxzdHJvbmc+U2VuLiAke3JlcFRvUmVuZGVyLm5hbWV9PC9zdHJvbmc+PC9hPlxuICAgICAgICA8ZGl2PlxuICAgICAgIDwvZGl2PmBcbiAgICApO1xuICB9XG5cbn1cbiIsIi8qKlxuKiBGYWNpbGl0YXRlcyB0aGUgc2VhcmNoXG4qL1xuXG5jbGFzcyBTZWFyY2hNYW5hZ2VyIHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnRhcmdldCA9ICQoXCIjZm9ybS1hcmVhXCIpO1xuICAgIHRoaXMuYWRkcmVzc0Zvcm0gPSAkKFwiI2Zvcm0tYXJlYSAjYWRkcmVzc1wiKTtcblxuICAgIHRoaXMuc2VhcmNoU3VnZ2VzdGlvbnNDb250YWluZXIgPSAkKFwiI3NlYXJjaC1yZXN1bHRzXCIpO1xuICAgIHRoaXMuc2VhcmNoU3VnZ2VzdGlvbnMgPSAkKFwiI3NlYXJjaC1yZXN1bHRzIHVsXCIpO1xuICAgIHRoaXMuY2hvc2VuTG9jYXRpb24gPSBudWxsO1xuXG4gICAgdGhpcy50aW1lb3V0ID0gbnVsbDtcblxuICAgIHRoaXMuc2VhcmNoU3VnZ2VzdGlvbnNDb250YWluZXIuaGlkZSgpO1xuICAgIHRoaXMuX3N0YXJ0TGlzdGVuZXIoKTtcbiAgICB0aGlzLnJlbmRlcigpO1xuICB9XG5cbiAgX3N0YXJ0TGlzdGVuZXIoKSB7XG4gICAgY29uc3QgdGhhdCA9IHRoaXM7XG5cbiAgICAvLyBMaXN0ZW4gdG8gYWRkcmVzcyBjaGFuZ2VzXG4gICAgdGhpcy5hZGRyZXNzRm9ybS5iaW5kKCdrZXl1cCcsIChldik9PntcbiAgICAgIGNvbnN0IGFkZHJlc3MgPSBldi50YXJnZXQudmFsdWU7XG5cbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpO1xuICAgICAgdGhpcy50aW1lb3V0ID0gc2V0VGltZW91dCgoKT0+e1xuICAgICAgICAvL0ZpbHRlciB0aGUgYWRkcmVzc2VzXG4gICAgICAgICQuZ2V0SlNPTignaHR0cHM6Ly9ub21pbmF0aW0ub3BlbnN0cmVldG1hcC5vcmcvc2VhcmNoLycgKyBlbmNvZGVVUklDb21wb25lbnQoYWRkcmVzcykgKyAnP2Zvcm1hdD1qc29uJyxcbiAgICAgICAgKGRhdGEpID0+IHtcbiAgICAgICAgICB0aGF0LnNlYXJjaFN1Z2dlc3Rpb25zQ29udGFpbmVyLnNob3coKTtcbiAgICAgICAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICAgICAgICAgIHRoYXQucmVuZGVyKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSwgNTAwKTtcbiAgICB9KVxuXG4gICAgdGhpcy50YXJnZXQuZmluZChcImZvcm1cIikub24oXCJzdWJtaXRcIiwgKCkgPT57IHJldHVybiBmYWxzZTsgfSk7XG5cbiAgICAvL0xpc3RlbiB0byBjbGlja2luZyBvZiBzdWdnZXN0aW9uc1xuICAgIHRoYXQuc2VhcmNoU3VnZ2VzdGlvbnNDb250YWluZXIub24oXCJjbGlja1wiLCBcImFcIiwgKGV2KSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcIlRlc3RcIik7XG4gICAgICB0aGF0LnNlYXJjaFN1Z2dlc3Rpb25zQ29udGFpbmVyLmhpZGUoKTtcbiAgICB9KVxuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIHRoaXMuc2VhcmNoU3VnZ2VzdGlvbnMuZW1wdHkoKTtcbiAgICBpZiAodGhpcy5kYXRhKSB7XG4gICAgICB0aGlzLnNlYXJjaFN1Z2dlc3Rpb25zLmFwcGVuZChcbiAgICAgICAgdGhpcy5kYXRhLnNsaWNlKDAsMTApLm1hcCgoaXRlbSk9PmBcbiAgICAgICAgPGxpPlxuICAgICAgICAgIDxkaXYgY2xhc3M9J3N1Z2dlc3Rpb24nIGxvbj1cIiR7aXRlbS5sb259XCIgbGF0PVwiJHtpdGVtLmxhdH1cIj5cbiAgICAgICAgICAgIDxhIGhyZWY9JyNsb249JHtpdGVtLmxvbn0mbGF0PSR7aXRlbS5sYXR9Jz4ke2l0ZW0uZGlzcGxheV9uYW1lfTwvYT5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9saT5gKVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxufVxuIiwiY2xhc3MgU3Rvcmllc0xpc3RNYW5hZ2VyIHtcbiAgY29uc3RydWN0b3IoZ2VvanNvbiwgc3RhdHVzRGF0YSwgY29udGFjdCwgc3Rvcmllcykge1xuICAgIHRoaXMuZ2VvanNvbiA9IGdlb2pzb247XG4gICAgdGhpcy5zdGF0dXNEYXRhID0gc3RhdHVzRGF0YTtcbiAgICB0aGlzLmNvbnRhY3QgPSBjb250YWN0O1xuICAgIHRoaXMuc3RvcmllcyA9IHN0b3JpZXM7XG5cbiAgICB0aGlzLnN0b3JpZXNMaXN0ID0gJChcIiNzdG9yaWVzXCIpO1xuICB9XG5cbiAgbGlzdE5lYXJieVN0b3JpZXMobGF0TG5nKSB7XG4gICAgY29uc29sZS5sb2coXCJTdG9yaWVzTGlzdE1hbmFnZXJcIiwgbGF0TG5nKTtcbiAgfVxufVxuIiwiXG5jbGFzcyBBcHAge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgdGhpcy5NYXAgPSBudWxsO1xuICAgIHRoaXMucmVuZGVyKCk7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgLy9Mb2FkaW5nIGRhdGEuLi5cbiAgICB2YXIgbWFwRmV0Y2ggPSAkLmdldEpTT04oJy9kYXRhL255cy1zZW5hdGVtYXAuanNvbicpO1xuICAgIHZhciBzZW5hdG9yU3RhdHVzRmV0Y2ggPSAkLmdldEpTT04oJy9kYXRhL3N0YXR1cy5qc29uJyk7XG4gICAgdmFyIHN0YXRlU2VuYXRvcnNJbmZvID0gJC5nZXRKU09OKCcvZGF0YS9zdGF0ZS1zZW5hdG9ycy5qc29uJyk7XG4gICAgdmFyIHN0b3JpZXNJbmZvID0gJC5nZXRKU09OKCcvZGF0YS9zdG9yaWVzLmpzb24nKTtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgJC53aGVuKG1hcEZldGNoLCBzZW5hdG9yU3RhdHVzRmV0Y2gsIHN0YXRlU2VuYXRvcnNJbmZvLCBzdG9yaWVzSW5mbykudGhlbihcbiAgICAgIChnZW9qc29uLCBzdGF0dXNEYXRhLCBjb250YWN0LCBzdG9yaWVzKT0+e1xuICAgICAgdGhhdC5NYXAgPSBuZXcgTWFwTWFuYWdlcihnZW9qc29uWzBdLCBzdGF0dXNEYXRhWzBdLCBjb250YWN0WzBdLCBzdG9yaWVzWzBdKTtcbiAgICAgIHRoYXQuU3RvcnlMaXN0ID0gbmV3IFN0b3JpZXNMaXN0TWFuYWdlcihnZW9qc29uWzBdLCBzdGF0dXNEYXRhWzBdLCBjb250YWN0WzBdLCBzdG9yaWVzWzBdKTtcbiAgICAgIHRoYXQuU2VhcmNoID0gbmV3IFNlYXJjaE1hbmFnZXIoKTtcbiAgICAgIHRoYXQuUmVwID0gbmV3IFJlcHJlc2VudGF0aXZlTWFuYWdlcih0aGF0Lk1hcCwgc3RhdHVzRGF0YVswXSwgY29udGFjdFswXSk7XG4gICAgICB0aGF0Ll9saXN0ZW5Ub1dpbmRvdygpO1xuICAgIH0pO1xuICB9XG5cbiAgX2xpc3RlblRvV2luZG93KCkge1xuXG4gICAgJCh3aW5kb3cpLm9uKCdoYXNoY2hhbmdlJywgKCk9PntcbiAgICAgIGlmICh3aW5kb3cubG9jYXRpb24uaGFzaCAmJiB3aW5kb3cubG9jYXRpb24uaGFzaC5sZW5ndGggPiAwKVxuICAgICAge1xuICAgICAgICBjb25zdCBoYXNoID0gJC5kZXBhcmFtKHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cmluZygxKSk7XG5cbiAgICAgICAgY29uc3QgbGF0TG5nID0gbmV3IEwubGF0TG5nKGhhc2gubGF0LCBoYXNoLmxvbik7XG4gICAgICAgIC8vIFRyaWdnZXIgdmFyaW91cyBtYW5hZ2Vyc1xuICAgICAgICB0aGlzLlN0b3J5TGlzdC5saXN0TmVhcmJ5U3RvcmllcyhsYXRMbmcpO1xuICAgICAgICB0aGlzLlJlcC5zaG93UmVwcmVzZW50YXRpdmUobGF0TG5nKTtcbiAgICAgICAgdGhpcy5NYXAuZm9jdXNPbkRpc3RyaWN0KGxhdExuZylcbiAgICAgIH1cbiAgICB9KTtcbiAgICAkKHdpbmRvdykudHJpZ2dlcihcImhhc2hjaGFuZ2VcIik7XG4gIH1cbn1cblxud2luZG93LkFwcE1hbmFnZXIgPSBuZXcgQXBwKHt9KTtcbiJdfQ==
