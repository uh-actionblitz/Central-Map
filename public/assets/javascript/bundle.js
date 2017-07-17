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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvbWFwLmpzIiwiY2xhc3Nlcy9yZXByZXNlbnRhdGl2ZS5qcyIsImNsYXNzZXMvc2VhcmNoLmpzIiwiY2xhc3Nlcy9zdG9yaWVzbGlzdC5qcyIsImFwcC5qcyJdLCJuYW1lcyI6WyJNYXBNYW5hZ2VyIiwiZ2VvanNvbiIsInN0YXR1c0RhdGEiLCJjb250YWN0IiwibWFwIiwiTCIsInNldFZpZXciLCJ0aWxlTGF5ZXIiLCJtYXhab29tIiwiYXR0cmlidXRpb24iLCJhZGRUbyIsInJlbmRlciIsImV2ZW50IiwicG9wdXAiLCJzZW5hdG9yIiwidGFyZ2V0Iiwib3B0aW9ucyIsIm1vcmVJbmZvIiwiY29udGVudCIsImltYWdlIiwibmFtZSIsInBhcnR5IiwiZGlzdHJpY3QiLCJzdGF0dXMiLCJjbG9zZUJ1dHRvbiIsImNsYXNzTmFtZSIsInNldENvbnRlbnQiLCJiaW5kUG9wdXAiLCJvcGVuUG9wdXAiLCJmZWF0dXJlIiwibGF5ZXIiLCJ0aGF0IiwicHJvcGVydGllcyIsIk5BTUUiLCJjaXJjbGVNYXJrZXIiLCJnZXRCb3VuZHMiLCJnZXRDZW50ZXIiLCJyYWRpdXMiLCJmaWxsQ29sb3IiLCJfY29sb3JEaXN0cmljdCIsImNvbG9yIiwib3BhY2l0eSIsImZpbGxPcGFjaXR5Iiwib24iLCJjbGljayIsIl9yZW5kZXJCdWJibGUiLCJiaW5kIiwiZSIsImNvbnNvbGUiLCJsb2ciLCJ3aW5kb3ciLCJsb2NhdGlvbiIsImhhc2giLCJsYXRsbmciLCJsYXQiLCJsbmciLCJfbGVhZmxldF9pZCIsImlkIiwid2VpZ2h0Iiwic2V0U3R5bGUiLCJfbGF5ZXJTdHlsZSIsImRpc3RyaWN0cyIsImdlb0pTT04iLCJzdHlsZSIsIm9uRWFjaEZlYXR1cmUiLCJfb25FYWNoRmVhdHVyZSIsImJyaW5nVG9CYWNrIiwibGF5ZXJzIiwibGF0TG5nIiwibGVhZmxldFBpcCIsInBvaW50SW5MYXllciIsImZpdEJvdW5kcyIsImVhY2hMYXllciIsIl9yZXNldExheWVyU3R5bGUiLCJfY2hvc2VuU3R5bGUiLCJSZXByZXNlbnRhdGl2ZU1hbmFnZXIiLCJyZXByZXNlbnRhdGl2ZUNvbnRhaW5lciIsIiQiLCJhZGRFdmVudHMiLCJlbXB0eSIsInBhcnRpZXMiLCJwYXJ0eUxpc3QiLCJzcGxpdCIsInRvU3RyaW5nIiwiaSIsImpvaW4iLCJyZXBUb1JlbmRlciIsInBob25lIiwiZGlzdHJpY3ROdW1iZXIiLCJwYXJzZUludCIsImZpbHRlciIsImNvbnRhY3RPZlJlcCIsImh0bWwiLCJyZW5kZXJQYXJ0aWVzIiwicmVuZGVyVGhhbmtzIiwicmVuZGVyVXJnZSIsIlNlYXJjaE1hbmFnZXIiLCJhZGRyZXNzRm9ybSIsInNlYXJjaFN1Z2dlc3Rpb25zQ29udGFpbmVyIiwic2VhcmNoU3VnZ2VzdGlvbnMiLCJjaG9zZW5Mb2NhdGlvbiIsInRpbWVvdXQiLCJoaWRlIiwiX3N0YXJ0TGlzdGVuZXIiLCJldiIsImFkZHJlc3MiLCJ2YWx1ZSIsImNsZWFyVGltZW91dCIsInNldFRpbWVvdXQiLCJnZXRKU09OIiwiZW5jb2RlVVJJQ29tcG9uZW50IiwiZGF0YSIsInNob3ciLCJhcHBlbmQiLCJzbGljZSIsIml0ZW0iLCJsb24iLCJkaXNwbGF5X25hbWUiLCJTdG9yaWVzTGlzdE1hbmFnZXIiLCJzdG9yaWVzIiwic3Rvcmllc0xpc3QiLCJBcHAiLCJNYXAiLCJtYXBGZXRjaCIsInNlbmF0b3JTdGF0dXNGZXRjaCIsInN0YXRlU2VuYXRvcnNJbmZvIiwic3Rvcmllc0luZm8iLCJ3aGVuIiwidGhlbiIsIlN0b3J5TGlzdCIsIlNlYXJjaCIsIlJlcCIsIl9saXN0ZW5Ub1dpbmRvdyIsImxlbmd0aCIsImRlcGFyYW0iLCJzdWJzdHJpbmciLCJsaXN0TmVhcmJ5U3RvcmllcyIsInNob3dSZXByZXNlbnRhdGl2ZSIsImZvY3VzT25EaXN0cmljdCIsInRyaWdnZXIiLCJBcHBNYW5hZ2VyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7SUFBTUE7QUFDSixzQkFBWUMsT0FBWixFQUFxQkMsVUFBckIsRUFBaUNDLE9BQWpD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LElBQWhCLElBQXdCRixPQUFPQyxRQUFQLENBQWdCQyxJQUFoQixDQUFxQmlGLE1BQXJCLEdBQThCLENBQTFELEVBQ0E7QUFDRSxjQUFNakYsT0FBT3lCLEVBQUV5RCxPQUFGLENBQVVwRixPQUFPQyxRQUFQLENBQWdCQyxJQUFoQixDQUFxQm1GLFNBQXJCLENBQStCLENBQS9CLENBQVYsQ0FBYjs7QUFFQSxjQUFNbkUsU0FBUyxJQUFJL0QsRUFBRStELE1BQU4sQ0FBYWhCLEtBQUtFLEdBQWxCLEVBQXVCRixLQUFLZ0UsR0FBNUIsQ0FBZjtBQUNBO0FBQ0EsZ0JBQUthLFNBQUwsQ0FBZU8saUJBQWYsQ0FBaUNwRSxNQUFqQztBQUNBLGdCQUFLK0QsR0FBTCxDQUFTTSxrQkFBVCxDQUE0QnJFLE1BQTVCO0FBQ0EsZ0JBQUtzRCxHQUFMLENBQVNnQixlQUFULENBQXlCdEUsTUFBekI7QUFDRDtBQUNGLE9BWEQ7QUFZQVMsUUFBRTNCLE1BQUYsRUFBVXlGLE9BQVYsQ0FBa0IsWUFBbEI7QUFDRDs7Ozs7O0FBR0h6RixPQUFPMEYsVUFBUCxHQUFvQixJQUFJbkIsR0FBSixDQUFRLEVBQVIsQ0FBcEIiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgTWFwTWFuYWdlciB7XG4gIGNvbnN0cnVjdG9yKGdlb2pzb24sIHN0YXR1c0RhdGEsIGNvbnRhY3QpIHtcblxuICAgIC8vSW5pdGlhbGl6aW5nIE1hcFxuICAgIHRoaXMubWFwID0gbmV3IEwubWFwKCdtYXAnKS5zZXRWaWV3KFs0Mi44NjMsLTc0Ljc1Ml0sIDYuNTUpO1xuICAgIEwudGlsZUxheWVyKCdodHRwczovL2NhcnRvZGItYmFzZW1hcHMte3N9Lmdsb2JhbC5zc2wuZmFzdGx5Lm5ldC9saWdodF9hbGwve3p9L3t4fS97eX0ucG5nJywge1xuICAgICAgbWF4Wm9vbTogMTgsXG4gICAgICBhdHRyaWJ1dGlvbjogJyZjb3B5OyA8YSBocmVmPVwiaHR0cDovL3d3dy5vcGVuc3RyZWV0bWFwLm9yZy9jb3B5cmlnaHRcIj5PcGVuU3RyZWV0TWFwPC9hPiwgJmNvcHk7PGEgaHJlZj1cImh0dHBzOi8vY2FydG8uY29tL2F0dHJpYnV0aW9uXCI+Q0FSVE88L2E+LiBJbnRlcmFjdGl2aXR5IGJ5IDxhIGhyZWY9XCIvL2FjdGlvbmJsaXR6Lm9yZ1wiPkFjdGlvbkJsaXR6PC9hPidcbiAgICB9KS5hZGRUbyh0aGlzLm1hcCk7XG5cblxuICAgIHRoaXMuc3RhdHVzRGF0YSA9IHN0YXR1c0RhdGE7XG4gICAgdGhpcy5nZW9qc29uID0gZ2VvanNvbjtcbiAgICB0aGlzLmNvbnRhY3QgPSBjb250YWN0O1xuXG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgfVxuXG4gIC8qKipcbiAgKiBwcml2YXRlIG1ldGhvZCBfcmVuZGVyQnViYmxlXG4gICpcbiAgKi9cbiAgX3JlbmRlckJ1YmJsZShldmVudCkge1xuXG4gICAgdmFyIHBvcHVwO1xuICAgIHZhciBzZW5hdG9yID0gZXZlbnQudGFyZ2V0Lm9wdGlvbnMuc3RhdHVzRGF0YTtcbiAgICB2YXIgbW9yZUluZm8gPSBldmVudC50YXJnZXQub3B0aW9ucy5jb250YWN0O1xuXG4gICAgdmFyIGNvbnRlbnQgPSAoXG4gICAgICBgPGRpdj5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwic2VuYXRvci1pbWFnZS1jb250YWluZXJcIj5cbiAgICAgICAgICA8aW1nIHNyYz1cIiR7c2VuYXRvci5pbWFnZX1cIiAvPlxuICAgICAgICA8L3NlY3Rpb24+XG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInNlbmF0b3ItaW5mb1wiPlxuICAgICAgICAgIDxkaXY+JHtzZW5hdG9yLm5hbWV9PC9kaXY+XG4gICAgICAgICAgPGRpdj5QYXJ0eTogJHttb3JlSW5mby5wYXJ0eX08L2Rpdj5cbiAgICAgICAgICA8ZGl2PlNlbmF0ZSBEaXN0cmljdCAke3NlbmF0b3IuZGlzdHJpY3R9PC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cIiR7KHNlbmF0b3Iuc3RhdHVzID09PSAnRk9SJykgPyAndm90ZXMteWVzJyA6ICd2b3Rlcy1ubyd9XCI+XG4gICAgICAgICAgICAgICR7c2VuYXRvci5zdGF0dXMgPT09ICdUQVJHRVQnID8gJ0hpZ2ggcHJpb3JpdHknIDogKHNlbmF0b3Iuc3RhdHVzID09PSAnRk9SJykgPyAnQ28tU3BvbnNvcicgOiAnTm8gc3VwcG9ydCd9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvc2VjdGlvbj5cbiAgICAgICAgPGEgaHJlZj1cIiR7bW9yZUluZm8uY29udGFjdH1cIiBjbGFzcz1cImNvbnRhY3QtbGlua1wiIHRhcmdldD1cIl9ibGFua1wiPkNvbnRhY3Q8L2J1dHRvbj5cbiAgICAgIDwvZGl2PmApO1xuXG4gICAgcG9wdXAgPSBMLnBvcHVwKHtcbiAgICAgIGNsb3NlQnV0dG9uOiB0cnVlLFxuICAgICAgY2xhc3NOYW1lOiAnc2VuYXRvci1wb3B1cCcsXG4gICAgIH0pO1xuXG4gICAgcG9wdXAuc2V0Q29udGVudChjb250ZW50KTtcbiAgICBldmVudC50YXJnZXQuYmluZFBvcHVwKHBvcHVwKS5vcGVuUG9wdXAoKTtcbiAgfVxuXG4gIF9vbkVhY2hGZWF0dXJlKGZlYXR1cmUsIGxheWVyKSB7XG4gICAgICAvL1xuICAgICAgLy8gY29uc29sZS5sb2coc2VuYXRvcnNbZmVhdHVyZS5wcm9wZXJ0aWVzLk5BTUUgLSAxXS5zdGF0dXMpXG4gICAgICBjb25zdCB0aGF0ID0gdGhpcztcblxuICAgICAgdmFyIHN0YXR1cyA9IHRoaXMuc3RhdHVzRGF0YVtmZWF0dXJlLnByb3BlcnRpZXMuTkFNRSAtIDFdLnN0YXR1cztcblxuICAgICAgLy8gQ3JlYXRlIENpcmNsZSBNYXJrZXJcbiAgICAgIEwuY2lyY2xlTWFya2VyKGxheWVyLmdldEJvdW5kcygpLmdldENlbnRlcigpLCB7XG4gICAgICAgIHJhZGl1czogNyxcbiAgICAgICAgZmlsbENvbG9yOiB0aGlzLl9jb2xvckRpc3RyaWN0KGZlYXR1cmUpLFxuICAgICAgICBjb2xvcjogJ3doaXRlJyxcbiAgICAgICAgb3BhY2l0eTogMSxcbiAgICAgICAgZmlsbE9wYWNpdHk6IDAuNyxcblxuICAgICAgICAvL0RhdGFcbiAgICAgICAgc3RhdHVzRGF0YTogdGhpcy5zdGF0dXNEYXRhW2ZlYXR1cmUucHJvcGVydGllcy5OQU1FIC0gMV0sXG4gICAgICAgIGNvbnRhY3Q6IHRoaXMuY29udGFjdFtmZWF0dXJlLnByb3BlcnRpZXMuTkFNRSAtIDFdLFxuICAgICAgfSlcbiAgICAgIC5vbih7XG4gICAgICAgIGNsaWNrOiB0aGlzLl9yZW5kZXJCdWJibGUuYmluZCh0aGlzKSxcbiAgICAgIH0pLmFkZFRvKHRoaXMubWFwKTtcblxuXG4gICAgICBsYXllci5vbih7XG4gICAgICAgIGNsaWNrOiAoZSk9PntcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIkNMSUNLRUQgOjo6IFwiLCBlKTtcbiAgICAgICAgICAvLyB0aGlzLm1hcC5maXRCb3VuZHMobGF5ZXIuZ2V0Qm91bmRzKCkpO1xuICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gYCNsYXQ9JHtlLmxhdGxuZy5sYXR9Jmxvbj0ke2UubGF0bG5nLmxuZ31gXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIGxheWVyLl9sZWFmbGV0X2lkID0gZmVhdHVyZS5pZFxuICAgICAgLy8gbGF5ZXIub24oe1xuICAgICAgICAvLyBtb3VzZW92ZXI6IGhhbmRsZU1vdXNlT3ZlcixcbiAgICAgICAgLy8gbW91c2VvdXQ6IGhhbmRsZU1vdXNlT3V0XG4gICAgICAvLyB9KTtcbiAgICB9XG5cbiAgX2xheWVyU3R5bGUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGZpbGxDb2xvcjogJ2dyYXknLFxuICAgICAgZmlsbE9wYWNpdHk6IDAuMDEsXG4gICAgICBjb2xvcjogJ2dyYXknLFxuICAgICAgb3BhY2l0eTogJzEnLFxuICAgICAgd2VpZ2h0OiAxXG4gICAgfTtcbiAgfVxuICBfY2hvc2VuU3R5bGUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGZpbGxDb2xvcjogJ2dyZWVuJyxcbiAgICAgIGZpbGxPcGFjaXR5OiAwLjVcbiAgICB9XG4gIH1cblxuICBfcmVzZXRMYXllclN0eWxlKGxheWVyKSB7XG4gICAgbGF5ZXIuc2V0U3R5bGUodGhpcy5fbGF5ZXJTdHlsZSgpKTtcbiAgfVxuXG4gIF9jb2xvckRpc3RyaWN0KGRpc3RyaWN0KSB7XG4gICAgdmFyIHN0YXR1cyA9IHRoaXMuc3RhdHVzRGF0YVtkaXN0cmljdC5wcm9wZXJ0aWVzLk5BTUUgLSAxXS5zdGF0dXM7XG5cbiAgICBzd2l0Y2goc3RhdHVzKSB7XG4gICAgICBjYXNlICdGT1InOlxuICAgICAgICByZXR1cm4gJyMxZTkwZmYnO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ0FHQUlOU1QnOlxuICAgICAgICByZXR1cm4gJyNGRjRDNTAnO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ1RBUkdFVCc6XG4gICAgICAgIHJldHVybiAnI0NDMDAwNCc7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICAvL0NhbGwgZ2VvanNvblxuICAgIHRoaXMuZGlzdHJpY3RzID0gTC5nZW9KU09OKHRoaXMuZ2VvanNvbiwge1xuICAgICAgc3R5bGU6IHRoaXMuX2xheWVyU3R5bGUuYmluZCh0aGlzKSxcbiAgICAgIG9uRWFjaEZlYXR1cmU6IHRoaXMuX29uRWFjaEZlYXR1cmUuYmluZCh0aGlzKVxuICAgIH0pXG4gICAgdGhpcy5kaXN0cmljdHMuYWRkVG8odGhpcy5tYXApO1xuICAgIHRoaXMuZGlzdHJpY3RzLmJyaW5nVG9CYWNrKCk7XG5cbiAgICBjb25zb2xlLmxvZyh0aGlzLmxheWVycyk7XG4gIH1cblxuICAvL0ZpdEJvdW5kcyBvbiB0aGUgZGlzdHJpY3RcbiAgZm9jdXNPbkRpc3RyaWN0KGxhdExuZykge1xuICAgIGNvbnN0IHRhcmdldCA9IGxlYWZsZXRQaXAucG9pbnRJbkxheWVyKGxhdExuZywgdGhpcy5kaXN0cmljdHMsIHRydWUpWzBdO1xuXG4gICAgaWYgKHRhcmdldCkge1xuICAgICAgdGhpcy5tYXAuZml0Qm91bmRzKHRhcmdldC5nZXRCb3VuZHMoKSk7XG4gICAgICB0aGlzLmRpc3RyaWN0cy5lYWNoTGF5ZXIodGhpcy5fcmVzZXRMYXllclN0eWxlLmJpbmQodGhpcykpO1xuICAgICAgdGFyZ2V0LnNldFN0eWxlKHRoaXMuX2Nob3NlblN0eWxlKCkpXG4gICAgICAvL1JlZnJlc2ggd2hvbGUgbWFwXG4gICAgfVxuXG5cblxuICB9XG59XG4iLCIvKipcbiAqIFJlcHJlc2VudGF0aXZlTWFuYWdlclxuICogRmFjaWxpdGF0ZXMgdGhlIHJldHJpZXZhbCBvZiB0aGUgdXNlcidzIFJlcHJlc2VudGF0aXZlIGJhc2VkIG9uIHRoZWlyIEFkZHJlc3NcbiAqKi9cbmNsYXNzIFJlcHJlc2VudGF0aXZlTWFuYWdlciB7XG5cbiAgY29uc3RydWN0b3IobWFwLCBzdGF0dXMsIGNvbnRhY3QpIHtcbiAgICB0aGlzLm1hcCA9IG1hcDtcbiAgICB0aGlzLnN0YXR1cyA9IHN0YXR1cztcbiAgICB0aGlzLmNvbnRhY3QgPSBjb250YWN0O1xuXG4gICAgdGhpcy5yZXByZXNlbnRhdGl2ZUNvbnRhaW5lciA9ICQoXCIjc2VuYXRvci1pbmZvXCIpO1xuXG4gICAgLy9jcmVhdGUgbGlzdGVuZXJzXG4gICAgdGhpcy5hZGRFdmVudHMoKTtcbiAgfVxuXG4gIGFkZEV2ZW50cygpIHtcbiAgICAvL0Nsb3NlXG4gICAgdGhpcy5yZXByZXNlbnRhdGl2ZUNvbnRhaW5lci5vbignY2xpY2snLCBcImEuY2xvc2VcIiwgKCkgPT4gdGhpcy5yZXByZXNlbnRhdGl2ZUNvbnRhaW5lci5lbXB0eSgpKTtcbiAgfVxuXG4gIHNob3dSZXByZXNlbnRhdGl2ZShsYXRMbmcpIHtcbiAgICB0aGlzLnRhcmdldCA9IGxlYWZsZXRQaXAucG9pbnRJbkxheWVyKGxhdExuZywgdGhpcy5tYXAuZGlzdHJpY3RzLCB0cnVlKVswXTtcbiAgICBjb25zb2xlLmxvZyhcIlJlcHJlc2VudGF0aXZlTWFuYWdlclwiLCB0aGlzLnRhcmdldCk7XG5cbiAgICB0aGlzLnJlbmRlcigpO1xuICB9XG5cbiAgcmVuZGVyUGFydGllcyhwYXJ0aWVzKSB7XG4gICAgY29uc3QgcGFydHlMaXN0ID0gcGFydGllcy5zcGxpdCgnLCcpO1xuICAgIGNvbnN0IHRvU3RyaW5nID0gcGFydHlMaXN0Lm1hcChpPT5gPGxpIGNsYXNzPSdwYXJ0eSAke2l9Jz48c3Bhbj4ke2l9PC9zcGFuPjwvbGk+YCkuam9pbignJyk7XG4gICAgcmV0dXJuIGA8dWwgY2xhc3M9J3BhcnRpZXMnPiR7dG9TdHJpbmd9PC91bD5gO1xuICB9XG5cbiAgcmVuZGVyVGhhbmtzKHJlcFRvUmVuZGVyKSB7XG4gICAgcmV0dXJuIGBcbiAgICAgIDxkaXY+XG4gICAgICAgIDxwIGNsYXNzPSdzdGF0dXMnPlxuICAgICAgICAgICR7cmVwVG9SZW5kZXIuc3RhdHVzID09PSBcIkZPUlwiID8gYFNlbi4gJHtyZXBUb1JlbmRlci5uYW1lfSBpcyA8c3Ryb25nPnN1cHBvcnRpdmU8L3N0cm9uZz4gb2YgdGhlIE5ldyBZb3JrIEhlYWx0aCBBY3QgKFM0ODQwKS4gQ2FsbCB0aGUgc2VuYXRvciB0byB0aGFuayB0aGVtIWBcbiAgICAgICAgICAgIDogYFNlbi4gJHtyZXBUb1JlbmRlci5uYW1lfSBpcyBub3QgeWV0IHN1cHBvcnRpdmUgb2YgdGhlIE5ldyBZb3JrIEhlYWx0aCBBY3QgIChTNDg0MCkuIENhbGwgdGhlbSB0byBlbmNvdXJhZ2UgYW5kIHVyZ2UgdGhlbSB0byBnaXZlIHRoZWlyIHN1cHBvcnQgdG8gdGhpcyBpbXBvcnRhbnQgYmlsbC5gfVxuICAgICAgICA8L3A+XG4gICAgICAgIDxoND5IZXJlJ3MgSG93PC9oND5cbiAgICAgICAgPGg1PjEuIENhbGwgdGhlIHNlbmF0b3IgYXQgPGkgY2xhc3M9XCJmYSBmYS1waG9uZVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvaT4gJHtyZXBUb1JlbmRlci5waG9uZX08L2g1PlxuICAgICAgICA8aDU+Mi4gVGhhbmsgdGhlbSB0aHJvdWdoIHRoZWlyIHN0YWZmITwvaDU+XG4gICAgICAgIDxwPlRoZSBzdGFmZmVyIHdpbGwgbWFrZSBzdXJlIHRoYXQgeW91ciBtZXNzYWdlIGlzIHNlbnQgdG8gdGhlIHNlbmF0b3IuPC9wPlxuICAgICAgICA8c3ViPlNhbXBsZSBNZXNzYWdlPC9zdWI+XG4gICAgICAgIDxibG9ja3F1b3RlPlxuICAgICAgICAgIEhpISBNeSBuYW1lIGlzIF9fX19fXy4gSSBhbSBhIGNvbnN0aXR1ZW50IG9mIFNlbi4gJHtyZXBUb1JlbmRlci5uYW1lfSBhdCB6aXBjb2RlIF9fX19fLiBJIGFtIHNlbmRpbmcgbXkgdGhhbmtzIHRvIHRoZSBzZW5hdG9yIGZvciBzdXBwb3J0aW5nIGFuZCBjby1zcG9uc29yaW5nIHRoZSBOZXcgWW9yayBIZWFsdGggQWN0IChTNDg0MCkuXG4gICAgICAgICAgSGVhbHRoIGNhcmUgaXMgYSB2ZXJ5IGltcG9ydGFudCBpc3N1ZSBmb3IgbWUsIGFuZCB0aGUgc2VuYXRvcidzIHN1cHBvcnQgbWVhbnMgYSBsb3QuIFRoYW5rIHlvdSFcbiAgICAgICAgPC9ibG9ja3F1b3RlPlxuICAgICAgICA8aDU+My4gVGVsbCB5b3VyIGZyaWVuZHMgdG8gY2FsbCE8L2g1PlxuICAgICAgICA8cD5TaGFyZSB0aGlzIHBhZ2Ugd2l0aCB5b3VyIGZyaWVuZHMgYW5kIHVyZ2UgdGhlbSB0byBjYWxsIHlvdXIgc2VuYXRvciE8L3A+XG4gICAgICA8L2Rpdj5cbiAgICBgXG4gIH1cblxuICByZW5kZXJVcmdlKHJlcFRvUmVuZGVyKSB7XG4gICAgcmV0dXJuIGBcbiAgICA8ZGl2PlxuICAgICAgPHAgY2xhc3M9J3N0YXR1cyc+XG4gICAgICAgICR7cmVwVG9SZW5kZXIuc3RhdHVzID09PSBcIkZPUlwiID8gYFNlbi4gJHtyZXBUb1JlbmRlci5uYW1lfSBpcyA8c3Ryb25nPnN1cHBvcnRpdmU8L3N0cm9uZz4gb2YgdGhlIE5ldyBZb3JrIEhlYWx0aCBBY3QgKFM0ODQwKS4gQ2FsbCB0aGUgc2VuYXRvciB0byB0aGFuayB0aGVtIWBcbiAgICAgICAgICA6IGBTZW4uICR7cmVwVG9SZW5kZXIubmFtZX0gaXMgPHN0cm9uZyBjbGFzcz0nbm90Jz5ub3QgeWV0IHN1cHBvcnRpdmU8L3N0cm9uZz4gb2YgdGhlIE5ldyBZb3JrIEhlYWx0aCBBY3QgIChTNDg0MCkuIENhbGwgdGhlbSB0byBlbmNvdXJhZ2UgYW5kIHVyZ2UgdGhlbSB0byBnaXZlIHRoZWlyIHN1cHBvcnQgdG8gdGhpcyBpbXBvcnRhbnQgYmlsbC5gfVxuICAgICAgPC9wPlxuICAgICAgPGg0PkhlcmUncyBIb3c8L2g0PlxuICAgICAgPGg1PjEuIENhbGwgdGhlIHNlbmF0b3IgYXQgPGkgY2xhc3M9XCJmYSBmYS1waG9uZVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvaT4gJHtyZXBUb1JlbmRlci5waG9uZX08L2g1PlxuICAgICAgPGg1PjIuIFRhbGsgdG8gdGhlbSBhYm91dCB5b3VyIHN1cHBvcnQhPC9oNT5cbiAgICAgIDxwPllvdSB3aWxsIG1vc3QgbGlrZWx5IHRhbGsgd2l0aCBhIHN0YWZmZXIuIFRlbGwgdGhlbSBhYm91dCB5b3VyIHN0b3J5LiBUaGUgc3RhZmZlciB3aWxsIG1ha2Ugc3VyZSB0aGF0IHlvdXIgbWVzc2FnZSBpcyBzZW50IHRvIHRoZSBzZW5hdG9yLjwvcD5cbiAgICAgIDxzdWI+U2FtcGxlIE1lc3NhZ2U8L3N1Yj5cbiAgICAgIDxibG9ja3F1b3RlPlxuICAgICAgICBIaSEgTXkgbmFtZSBpcyBfX19fX18uIEkgYW0gYSBjb25zdGl0dWVudCBvZiBTZW4uICR7cmVwVG9SZW5kZXIubmFtZX0gYXQgemlwY29kZSBfX19fXy5cbiAgICAgICAgSSBhbSBzdHJvbmdseSB1cmdpbmcgdGhlIHNlbmF0b3IgdG8gc3VwcG9ydCBhbmQgY28tc3BvbnNvciB0aGUgTmV3IFlvcmsgSGVhbHRoIEFjdCAoUzQ4NDApLlxuICAgICAgICBIZWFsdGggY2FyZSBpcyBhIHZlcnkgaW1wb3J0YW50IGlzc3VlIGZvciBtZSwgYW5kIHRoZSBzZW5hdG9yJ3Mgc3VwcG9ydCBtZWFucyBhIGxvdC4gVGhhbmsgeW91IVxuICAgICAgPC9ibG9ja3F1b3RlPlxuICAgICAgPGg1PjMuIFRlbGwgeW91ciBmcmllbmRzIHRvIGNhbGwhPC9oNT5cbiAgICAgIDxwPlNoYXJlIHRoaXMgcGFnZSB3aXRoIHlvdXIgZnJpZW5kcyBhbmQgdXJnZSB0aGVtIHRvIGNhbGwgeW91ciBzZW5hdG9yITwvcD5cbiAgICA8L2Rpdj5cbiAgICBgXG4gIH1cbiAgcmVuZGVyKCkge1xuICAgIGlmICghdGhpcy50YXJnZXQpIHJldHVybiBudWxsO1xuXG4gICAgY29uc3QgZGlzdHJpY3ROdW1iZXIgPSBwYXJzZUludCh0aGlzLnRhcmdldC5mZWF0dXJlLnByb3BlcnRpZXMuTkFNRSk7XG4gICAgY29uc3QgcmVwVG9SZW5kZXIgPSB0aGlzLnN0YXR1cy5maWx0ZXIoaT0+aS5kaXN0cmljdCA9PSBkaXN0cmljdE51bWJlcilbMF07XG4gICAgY29uc3QgY29udGFjdE9mUmVwID0gdGhpcy5jb250YWN0LmZpbHRlcihpPT5pLmRpc3RyaWN0ID09IGRpc3RyaWN0TnVtYmVyKVswXTtcblxuICAgIGNvbnNvbGUubG9nKHJlcFRvUmVuZGVyLCBjb250YWN0T2ZSZXApO1xuICAgIHRoaXMucmVwcmVzZW50YXRpdmVDb250YWluZXIuaHRtbChcbiAgICAgIGA8ZGl2PlxuICAgICAgICA8YSBocmVmPVwiamF2YXNjcmlwdDogdm9pZChudWxsKVwiIGNsYXNzPSdjbG9zZSc+PGkgY2xhc3M9XCJmYSBmYS10aW1lcy1jaXJjbGUtb1wiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvaT48L2E+XG4gICAgICAgIDxoNSBjbGFzcz0neW91ci1zZW5hdG9yJz5Zb3VyIFN0YXRlIFNlbmF0b3I8L2g1PlxuICAgICAgICA8ZGl2IGNsYXNzPSdiYXNpYy1pbmZvJz5cbiAgICAgICAgICA8aW1nIHNyYz0nJHtjb250YWN0T2ZSZXAuaW1hZ2V9JyBjbGFzcz0ncmVwLXBpYycgLz5cbiAgICAgICAgICA8aDU+TlkgRGlzdHJpY3QgJHtyZXBUb1JlbmRlci5kaXN0cmljdH08L2g1PlxuICAgICAgICAgIDxoMz4ke3JlcFRvUmVuZGVyLm5hbWV9PC9oMz5cbiAgICAgICAgICA8cD4ke3RoaXMucmVuZGVyUGFydGllcyhjb250YWN0T2ZSZXAucGFydHkpfTwvcD5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9J2FjdGlvbi1hcmVhJz5cbiAgICAgICAgICAke3JlcFRvUmVuZGVyLnN0YXR1cyA9PT0gXCJGT1JcIiA/IHRoaXMucmVuZGVyVGhhbmtzKHJlcFRvUmVuZGVyKSA6IHRoaXMucmVuZGVyVXJnZShyZXBUb1JlbmRlcikgfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz0nd2Vic2l0ZSc+XG4gICAgICAgICAgPGEgaHJlZj0nJHtyZXBUb1JlbmRlci5jb250YWN0fScgdGFyZ2V0PSdfYmxhbmsnPk1vcmUgd2F5cyB0byBjb250YWN0IDxzdHJvbmc+U2VuLiAke3JlcFRvUmVuZGVyLm5hbWV9PC9zdHJvbmc+PC9hPlxuICAgICAgICA8ZGl2PlxuICAgICAgIDwvZGl2PmBcbiAgICApO1xuICB9XG5cbn1cbiIsIi8qKlxuKiBGYWNpbGl0YXRlcyB0aGUgc2VhcmNoXG4qL1xuXG5jbGFzcyBTZWFyY2hNYW5hZ2VyIHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnRhcmdldCA9ICQoXCIjZm9ybS1hcmVhXCIpO1xuICAgIHRoaXMuYWRkcmVzc0Zvcm0gPSAkKFwiI2Zvcm0tYXJlYSAjYWRkcmVzc1wiKTtcblxuICAgIHRoaXMuc2VhcmNoU3VnZ2VzdGlvbnNDb250YWluZXIgPSAkKFwiI3NlYXJjaC1yZXN1bHRzXCIpO1xuICAgIHRoaXMuc2VhcmNoU3VnZ2VzdGlvbnMgPSAkKFwiI3NlYXJjaC1yZXN1bHRzIHVsXCIpO1xuICAgIHRoaXMuY2hvc2VuTG9jYXRpb24gPSBudWxsO1xuXG4gICAgdGhpcy50aW1lb3V0ID0gbnVsbDtcblxuICAgIHRoaXMuc2VhcmNoU3VnZ2VzdGlvbnNDb250YWluZXIuaGlkZSgpO1xuICAgIHRoaXMuX3N0YXJ0TGlzdGVuZXIoKTtcbiAgICB0aGlzLnJlbmRlcigpO1xuICB9XG5cbiAgX3N0YXJ0TGlzdGVuZXIoKSB7XG4gICAgY29uc3QgdGhhdCA9IHRoaXM7XG5cbiAgICAvLyBMaXN0ZW4gdG8gYWRkcmVzcyBjaGFuZ2VzXG4gICAgdGhpcy5hZGRyZXNzRm9ybS5iaW5kKCdrZXl1cCcsIChldik9PntcbiAgICAgIGNvbnN0IGFkZHJlc3MgPSBldi50YXJnZXQudmFsdWU7XG5cbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpO1xuICAgICAgdGhpcy50aW1lb3V0ID0gc2V0VGltZW91dCgoKT0+e1xuICAgICAgICAvL0ZpbHRlciB0aGUgYWRkcmVzc2VzXG4gICAgICAgICQuZ2V0SlNPTignaHR0cHM6Ly9ub21pbmF0aW0ub3BlbnN0cmVldG1hcC5vcmcvc2VhcmNoLycgKyBlbmNvZGVVUklDb21wb25lbnQoYWRkcmVzcykgKyAnP2Zvcm1hdD1qc29uJyxcbiAgICAgICAgKGRhdGEpID0+IHtcbiAgICAgICAgICB0aGF0LnNlYXJjaFN1Z2dlc3Rpb25zQ29udGFpbmVyLnNob3coKTtcbiAgICAgICAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICAgICAgICAgIHRoYXQucmVuZGVyKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSwgNTAwKTtcbiAgICB9KVxuXG4gICAgLy9MaXN0ZW4gdG8gY2xpY2tpbmcgb2Ygc3VnZ2VzdGlvbnNcbiAgICB0aGF0LnNlYXJjaFN1Z2dlc3Rpb25zQ29udGFpbmVyLm9uKFwiY2xpY2tcIiwgXCJhXCIsIChldikgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJUZXN0XCIpO1xuICAgICAgdGhhdC5zZWFyY2hTdWdnZXN0aW9uc0NvbnRhaW5lci5oaWRlKCk7XG4gICAgfSlcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICB0aGlzLnNlYXJjaFN1Z2dlc3Rpb25zLmVtcHR5KCk7XG4gICAgaWYgKHRoaXMuZGF0YSkge1xuICAgICAgdGhpcy5zZWFyY2hTdWdnZXN0aW9ucy5hcHBlbmQoXG4gICAgICAgIHRoaXMuZGF0YS5zbGljZSgwLDEwKS5tYXAoKGl0ZW0pPT5gXG4gICAgICAgIDxsaT5cbiAgICAgICAgICA8ZGl2IGNsYXNzPSdzdWdnZXN0aW9uJyBsb249XCIke2l0ZW0ubG9ufVwiIGxhdD1cIiR7aXRlbS5sYXR9XCI+XG4gICAgICAgICAgICA8YSBocmVmPScjbG9uPSR7aXRlbS5sb259JmxhdD0ke2l0ZW0ubGF0fSc+JHtpdGVtLmRpc3BsYXlfbmFtZX08L2E+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvbGk+YClcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbn1cbiIsImNsYXNzIFN0b3JpZXNMaXN0TWFuYWdlciB7XG4gIGNvbnN0cnVjdG9yKGdlb2pzb24sIHN0YXR1c0RhdGEsIGNvbnRhY3QsIHN0b3JpZXMpIHtcbiAgICB0aGlzLmdlb2pzb24gPSBnZW9qc29uO1xuICAgIHRoaXMuc3RhdHVzRGF0YSA9IHN0YXR1c0RhdGE7XG4gICAgdGhpcy5jb250YWN0ID0gY29udGFjdDtcbiAgICB0aGlzLnN0b3JpZXMgPSBzdG9yaWVzO1xuXG4gICAgdGhpcy5zdG9yaWVzTGlzdCA9ICQoXCIjc3Rvcmllc1wiKTtcbiAgfVxuXG4gIGxpc3ROZWFyYnlTdG9yaWVzKGxhdExuZykge1xuICAgIGNvbnNvbGUubG9nKFwiU3Rvcmllc0xpc3RNYW5hZ2VyXCIsIGxhdExuZyk7XG4gIH1cbn1cbiIsIlxuY2xhc3MgQXBwIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIHRoaXMuTWFwID0gbnVsbDtcbiAgICB0aGlzLnJlbmRlcigpO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIC8vTG9hZGluZyBkYXRhLi4uXG4gICAgdmFyIG1hcEZldGNoID0gJC5nZXRKU09OKCcvZGF0YS9ueXMtc2VuYXRlbWFwLmpzb24nKTtcbiAgICB2YXIgc2VuYXRvclN0YXR1c0ZldGNoID0gJC5nZXRKU09OKCcvZGF0YS9zdGF0dXMuanNvbicpO1xuICAgIHZhciBzdGF0ZVNlbmF0b3JzSW5mbyA9ICQuZ2V0SlNPTignL2RhdGEvc3RhdGUtc2VuYXRvcnMuanNvbicpO1xuICAgIHZhciBzdG9yaWVzSW5mbyA9ICQuZ2V0SlNPTignL2RhdGEvc3Rvcmllcy5qc29uJyk7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICQud2hlbihtYXBGZXRjaCwgc2VuYXRvclN0YXR1c0ZldGNoLCBzdGF0ZVNlbmF0b3JzSW5mbywgc3Rvcmllc0luZm8pLnRoZW4oXG4gICAgICAoZ2VvanNvbiwgc3RhdHVzRGF0YSwgY29udGFjdCwgc3Rvcmllcyk9PntcbiAgICAgIHRoYXQuTWFwID0gbmV3IE1hcE1hbmFnZXIoZ2VvanNvblswXSwgc3RhdHVzRGF0YVswXSwgY29udGFjdFswXSwgc3Rvcmllc1swXSk7XG4gICAgICB0aGF0LlN0b3J5TGlzdCA9IG5ldyBTdG9yaWVzTGlzdE1hbmFnZXIoZ2VvanNvblswXSwgc3RhdHVzRGF0YVswXSwgY29udGFjdFswXSwgc3Rvcmllc1swXSk7XG4gICAgICB0aGF0LlNlYXJjaCA9IG5ldyBTZWFyY2hNYW5hZ2VyKCk7XG4gICAgICB0aGF0LlJlcCA9IG5ldyBSZXByZXNlbnRhdGl2ZU1hbmFnZXIodGhhdC5NYXAsIHN0YXR1c0RhdGFbMF0sIGNvbnRhY3RbMF0pO1xuICAgICAgdGhhdC5fbGlzdGVuVG9XaW5kb3coKTtcbiAgICB9KTtcbiAgfVxuXG4gIF9saXN0ZW5Ub1dpbmRvdygpIHtcblxuICAgICQod2luZG93KS5vbignaGFzaGNoYW5nZScsICgpPT57XG4gICAgICBpZiAod2luZG93LmxvY2F0aW9uLmhhc2ggJiYgd2luZG93LmxvY2F0aW9uLmhhc2gubGVuZ3RoID4gMClcbiAgICAgIHtcbiAgICAgICAgY29uc3QgaGFzaCA9ICQuZGVwYXJhbSh3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHJpbmcoMSkpO1xuXG4gICAgICAgIGNvbnN0IGxhdExuZyA9IG5ldyBMLmxhdExuZyhoYXNoLmxhdCwgaGFzaC5sb24pO1xuICAgICAgICAvLyBUcmlnZ2VyIHZhcmlvdXMgbWFuYWdlcnNcbiAgICAgICAgdGhpcy5TdG9yeUxpc3QubGlzdE5lYXJieVN0b3JpZXMobGF0TG5nKTtcbiAgICAgICAgdGhpcy5SZXAuc2hvd1JlcHJlc2VudGF0aXZlKGxhdExuZyk7XG4gICAgICAgIHRoaXMuTWFwLmZvY3VzT25EaXN0cmljdChsYXRMbmcpXG4gICAgICB9XG4gICAgfSk7XG4gICAgJCh3aW5kb3cpLnRyaWdnZXIoXCJoYXNoY2hhbmdlXCIpO1xuICB9XG59XG5cbndpbmRvdy5BcHBNYW5hZ2VyID0gbmV3IEFwcCh7fSk7XG4iXX0=
