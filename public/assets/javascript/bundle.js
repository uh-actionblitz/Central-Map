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
      var _this = this;

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
          console.log("CLICKED ::: ", e.target);
          _this.map.fitBounds(layer.getBounds());
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
  }

  _createClass(RepresentativeManager, [{
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
      this.representativeContainer.html("<div>\n        <h5 class='your-senator'>Your State Senator</h5>\n        <div class='basic-info'>\n          <img src='" + contactOfRep.image + "' class='rep-pic' />\n          <h5>NY District " + repToRender.district + "</h5>\n          <h3>" + repToRender.name + "</h3>\n          <p>" + this.renderParties(contactOfRep.party) + "</p>\n        </div>\n        <div class='action-area'>\n          " + (repToRender.status === "FOR" ? this.renderThanks(repToRender) : this.renderUrge(repToRender)) + "\n        </div>\n        <div class='website'>\n          <a href='" + repToRender.contact + "' target='_blank'>More ways to contact <strong>Sen. " + repToRender.name + "</strong></a>\n        <div>\n       </div>");
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
        this.searchSuggestions.append(this.data.slice(0, 5).map(function (item) {
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvbWFwLmpzIiwiY2xhc3Nlcy9yZXByZXNlbnRhdGl2ZS5qcyIsImNsYXNzZXMvc2VhcmNoLmpzIiwiY2xhc3Nlcy9zdG9yaWVzbGlzdC5qcyIsImFwcC5qcyJdLCJuYW1lcyI6WyJNYXBNYW5hZ2VyIiwiZ2VvanNvbiIsInN0YXR1c0RhdGEiLCJjb250YWN0IiwibWFwIiwiTCIsInNldFZpZXciLCJ0aWxlTGF5ZXIiLCJtYXhab29tIiwiYXR0cmlidXRpb24iLCJhZGRUbyIsInJlbmRlciIsImV2ZW50IiwicG9wdXAiLCJzZW5hdG9yIiwidGFyZ2V0Iiwib3B0aW9ucyIsIm1vcmVJbmZvIiwiY29udGVudCIsImltYWdlIiwibmFtZSIsInBhcnR5IiwiZGlzdHJpY3QiLCJzdGF0dXMiLCJjbG9zZUJ1dHRvbiIsImNsYXNzTmFtZSIsInNldENvbnRlbnQiLCJiaW5kUG9wdXAiLCJvcGVuUG9wdXAiLCJmZWF0dXJlIiwibGF5ZXIiLCJ0aGF0IiwicHJvcGVydGllcyIsIk5BTUUiLCJjaXJjbGVNYXJrZXIiLCJnZXRCb3VuZHMiLCJnZXRDZW50ZXIiLCJyYWRpdXMiLCJmaWxsQ29sb3IiLCJfY29sb3JEaXN0cmljdCIsImNvbG9yIiwib3BhY2l0eSIsImZpbGxPcGFjaXR5Iiwib24iLCJjbGljayIsIl9yZW5kZXJCdWJibGUiLCJiaW5kIiwiZSIsImNvbnNvbGUiLCJsb2ciLCJmaXRCb3VuZHMiLCJfbGVhZmxldF9pZCIsImlkIiwid2VpZ2h0Iiwic2V0U3R5bGUiLCJfbGF5ZXJTdHlsZSIsImRpc3RyaWN0cyIsImdlb0pTT04iLCJzdHlsZSIsIm9uRWFjaEZlYXR1cmUiLCJfb25FYWNoRmVhdHVyZSIsImJyaW5nVG9CYWNrIiwibGF5ZXJzIiwibGF0TG5nIiwibGVhZmxldFBpcCIsInBvaW50SW5MYXllciIsImVhY2hMYXllciIsIl9yZXNldExheWVyU3R5bGUiLCJfY2hvc2VuU3R5bGUiLCJSZXByZXNlbnRhdGl2ZU1hbmFnZXIiLCJyZXByZXNlbnRhdGl2ZUNvbnRhaW5lciIsIiQiLCJwYXJ0aWVzIiwicGFydHlMaXN0Iiwic3BsaXQiLCJ0b1N0cmluZyIsImkiLCJqb2luIiwicmVwVG9SZW5kZXIiLCJwaG9uZSIsImRpc3RyaWN0TnVtYmVyIiwicGFyc2VJbnQiLCJmaWx0ZXIiLCJjb250YWN0T2ZSZXAiLCJodG1sIiwicmVuZGVyUGFydGllcyIsInJlbmRlclRoYW5rcyIsInJlbmRlclVyZ2UiLCJTZWFyY2hNYW5hZ2VyIiwiYWRkcmVzc0Zvcm0iLCJzZWFyY2hTdWdnZXN0aW9uc0NvbnRhaW5lciIsInNlYXJjaFN1Z2dlc3Rpb25zIiwiY2hvc2VuTG9jYXRpb24iLCJ0aW1lb3V0IiwiaGlkZSIsIl9zdGFydExpc3RlbmVyIiwiZXYiLCJhZGRyZXNzIiwidmFsdWUiLCJjbGVhclRpbWVvdXQiLCJzZXRUaW1lb3V0IiwiZ2V0SlNPTiIsImVuY29kZVVSSUNvbXBvbmVudCIsImRhdGEiLCJzaG93IiwiZW1wdHkiLCJhcHBlbmQiLCJzbGljZSIsIml0ZW0iLCJsb24iLCJsYXQiLCJkaXNwbGF5X25hbWUiLCJTdG9yaWVzTGlzdE1hbmFnZXIiLCJzdG9yaWVzIiwic3Rvcmllc0xpc3QiLCJBcHAiLCJNYXAiLCJtYXBGZXRjaCIsInNlbmF0b3JTdGF0dXNGZXRjaCIsInN0YXRlU2VuYXRvcnNJbmZvIiwic3Rvcmllc0luZm8iLCJ3aGVuIiwidGhlbiIsIlN0b3J5TGlzdCIsIlNlYXJjaCIsIlJlcCIsIl9saXN0ZW5Ub1dpbmRvdyIsIndpbmRvdyIsImxvY2F0aW9uIiwiaGFzaCIsImxlbmd0aCIsImRlcGFyYW0iLCJzdWJzdHJpbmciLCJsaXN0TmVhcmJ5U3RvcmllcyIsInNob3dSZXByZXNlbnRhdGl2ZSIsImZvY3VzT25EaXN0cmljdCIsInRyaWdnZXIiLCJBcHBNYW5hZ2VyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7SUFBTUE7QUFDSixzQkFBWUMsT0FBWixFQUFxQkMsVUFBckIsRUFBaUNDLE9BQWpDLEVBQTBDO0FBQUE7O0FBRXhDO0FBQ0EsU0FB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QixLQUFLcEIsR0FBNUIsQ0FBZjtBQUNBO0FBQ0EsZ0JBQUtjLFNBQUwsQ0FBZVUsaUJBQWYsQ0FBaUN0RSxNQUFqQztBQUNBLGdCQUFLOEQsR0FBTCxDQUFTUyxrQkFBVCxDQUE0QnZFLE1BQTVCO0FBQ0EsZ0JBQUtxRCxHQUFMLENBQVNtQixlQUFULENBQXlCeEUsTUFBekI7QUFDRDtBQUNGLE9BWEQ7QUFZQVEsUUFBRXdELE1BQUYsRUFBVVMsT0FBVixDQUFrQixZQUFsQjtBQUNEOzs7Ozs7QUFHSFQsT0FBT1UsVUFBUCxHQUFvQixJQUFJdEIsR0FBSixDQUFRLEVBQVIsQ0FBcEIiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgTWFwTWFuYWdlciB7XG4gIGNvbnN0cnVjdG9yKGdlb2pzb24sIHN0YXR1c0RhdGEsIGNvbnRhY3QpIHtcblxuICAgIC8vSW5pdGlhbGl6aW5nIE1hcFxuICAgIHRoaXMubWFwID0gbmV3IEwubWFwKCdtYXAnKS5zZXRWaWV3KFs0Mi44NjMsLTc0Ljc1Ml0sIDYuNTUpO1xuICAgIEwudGlsZUxheWVyKCdodHRwczovL2NhcnRvZGItYmFzZW1hcHMte3N9Lmdsb2JhbC5zc2wuZmFzdGx5Lm5ldC9saWdodF9hbGwve3p9L3t4fS97eX0ucG5nJywge1xuICAgICAgbWF4Wm9vbTogMTgsXG4gICAgICBhdHRyaWJ1dGlvbjogJyZjb3B5OyA8YSBocmVmPVwiaHR0cDovL3d3dy5vcGVuc3RyZWV0bWFwLm9yZy9jb3B5cmlnaHRcIj5PcGVuU3RyZWV0TWFwPC9hPiwgJmNvcHk7PGEgaHJlZj1cImh0dHBzOi8vY2FydG8uY29tL2F0dHJpYnV0aW9uXCI+Q0FSVE88L2E+LiBJbnRlcmFjdGl2aXR5IGJ5IDxhIGhyZWY9XCIvL2FjdGlvbmJsaXR6Lm9yZ1wiPkFjdGlvbkJsaXR6PC9hPidcbiAgICB9KS5hZGRUbyh0aGlzLm1hcCk7XG5cblxuICAgIHRoaXMuc3RhdHVzRGF0YSA9IHN0YXR1c0RhdGE7XG4gICAgdGhpcy5nZW9qc29uID0gZ2VvanNvbjtcbiAgICB0aGlzLmNvbnRhY3QgPSBjb250YWN0O1xuXG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgfVxuXG4gIC8qKipcbiAgKiBwcml2YXRlIG1ldGhvZCBfcmVuZGVyQnViYmxlXG4gICpcbiAgKi9cbiAgX3JlbmRlckJ1YmJsZShldmVudCkge1xuXG4gICAgdmFyIHBvcHVwO1xuICAgIHZhciBzZW5hdG9yID0gZXZlbnQudGFyZ2V0Lm9wdGlvbnMuc3RhdHVzRGF0YTtcbiAgICB2YXIgbW9yZUluZm8gPSBldmVudC50YXJnZXQub3B0aW9ucy5jb250YWN0O1xuXG4gICAgdmFyIGNvbnRlbnQgPSAoXG4gICAgICBgPGRpdj5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwic2VuYXRvci1pbWFnZS1jb250YWluZXJcIj5cbiAgICAgICAgICA8aW1nIHNyYz1cIiR7c2VuYXRvci5pbWFnZX1cIiAvPlxuICAgICAgICA8L3NlY3Rpb24+XG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInNlbmF0b3ItaW5mb1wiPlxuICAgICAgICAgIDxkaXY+JHtzZW5hdG9yLm5hbWV9PC9kaXY+XG4gICAgICAgICAgPGRpdj5QYXJ0eTogJHttb3JlSW5mby5wYXJ0eX08L2Rpdj5cbiAgICAgICAgICA8ZGl2PlNlbmF0ZSBEaXN0cmljdCAke3NlbmF0b3IuZGlzdHJpY3R9PC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cIiR7KHNlbmF0b3Iuc3RhdHVzID09PSAnRk9SJykgPyAndm90ZXMteWVzJyA6ICd2b3Rlcy1ubyd9XCI+XG4gICAgICAgICAgICAgICR7c2VuYXRvci5zdGF0dXMgPT09ICdUQVJHRVQnID8gJ0hpZ2ggcHJpb3JpdHknIDogKHNlbmF0b3Iuc3RhdHVzID09PSAnRk9SJykgPyAnQ28tU3BvbnNvcicgOiAnTm8gc3VwcG9ydCd9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvc2VjdGlvbj5cbiAgICAgICAgPGEgaHJlZj1cIiR7bW9yZUluZm8uY29udGFjdH1cIiBjbGFzcz1cImNvbnRhY3QtbGlua1wiIHRhcmdldD1cIl9ibGFua1wiPkNvbnRhY3Q8L2J1dHRvbj5cbiAgICAgIDwvZGl2PmApO1xuXG4gICAgcG9wdXAgPSBMLnBvcHVwKHtcbiAgICAgIGNsb3NlQnV0dG9uOiB0cnVlLFxuICAgICAgY2xhc3NOYW1lOiAnc2VuYXRvci1wb3B1cCcsXG4gICAgIH0pO1xuXG4gICAgcG9wdXAuc2V0Q29udGVudChjb250ZW50KTtcbiAgICBldmVudC50YXJnZXQuYmluZFBvcHVwKHBvcHVwKS5vcGVuUG9wdXAoKTtcbiAgfVxuXG4gIF9vbkVhY2hGZWF0dXJlKGZlYXR1cmUsIGxheWVyKSB7XG4gICAgICAvL1xuICAgICAgLy8gY29uc29sZS5sb2coc2VuYXRvcnNbZmVhdHVyZS5wcm9wZXJ0aWVzLk5BTUUgLSAxXS5zdGF0dXMpXG4gICAgICBjb25zdCB0aGF0ID0gdGhpcztcblxuICAgICAgdmFyIHN0YXR1cyA9IHRoaXMuc3RhdHVzRGF0YVtmZWF0dXJlLnByb3BlcnRpZXMuTkFNRSAtIDFdLnN0YXR1cztcblxuICAgICAgLy8gQ3JlYXRlIENpcmNsZSBNYXJrZXJcbiAgICAgIEwuY2lyY2xlTWFya2VyKGxheWVyLmdldEJvdW5kcygpLmdldENlbnRlcigpLCB7XG4gICAgICAgIHJhZGl1czogNyxcbiAgICAgICAgZmlsbENvbG9yOiB0aGlzLl9jb2xvckRpc3RyaWN0KGZlYXR1cmUpLFxuICAgICAgICBjb2xvcjogJ3doaXRlJyxcbiAgICAgICAgb3BhY2l0eTogMSxcbiAgICAgICAgZmlsbE9wYWNpdHk6IDAuNyxcblxuICAgICAgICAvL0RhdGFcbiAgICAgICAgc3RhdHVzRGF0YTogdGhpcy5zdGF0dXNEYXRhW2ZlYXR1cmUucHJvcGVydGllcy5OQU1FIC0gMV0sXG4gICAgICAgIGNvbnRhY3Q6IHRoaXMuY29udGFjdFtmZWF0dXJlLnByb3BlcnRpZXMuTkFNRSAtIDFdLFxuICAgICAgfSlcbiAgICAgIC5vbih7XG4gICAgICAgIGNsaWNrOiB0aGlzLl9yZW5kZXJCdWJibGUuYmluZCh0aGlzKSxcbiAgICAgIH0pLmFkZFRvKHRoaXMubWFwKTtcblxuXG4gICAgICBsYXllci5vbih7XG4gICAgICAgIGNsaWNrOiAoZSk9PntcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIkNMSUNLRUQgOjo6IFwiLCBlLnRhcmdldCk7XG4gICAgICAgICAgdGhpcy5tYXAuZml0Qm91bmRzKGxheWVyLmdldEJvdW5kcygpKTtcblxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICBsYXllci5fbGVhZmxldF9pZCA9IGZlYXR1cmUuaWRcbiAgICAgIC8vIGxheWVyLm9uKHtcbiAgICAgICAgLy8gbW91c2VvdmVyOiBoYW5kbGVNb3VzZU92ZXIsXG4gICAgICAgIC8vIG1vdXNlb3V0OiBoYW5kbGVNb3VzZU91dFxuICAgICAgLy8gfSk7XG4gICAgfVxuXG4gIF9sYXllclN0eWxlKCkge1xuICAgIHJldHVybiB7XG4gICAgICBmaWxsQ29sb3I6ICdncmF5JyxcbiAgICAgIGZpbGxPcGFjaXR5OiAwLjAxLFxuICAgICAgY29sb3I6ICdncmF5JyxcbiAgICAgIG9wYWNpdHk6ICcxJyxcbiAgICAgIHdlaWdodDogMVxuICAgIH07XG4gIH1cbiAgX2Nob3NlblN0eWxlKCkge1xuICAgIHJldHVybiB7XG4gICAgICBmaWxsQ29sb3I6ICdncmVlbicsXG4gICAgICBmaWxsT3BhY2l0eTogMC41XG4gICAgfVxuICB9XG5cbiAgX3Jlc2V0TGF5ZXJTdHlsZShsYXllcikge1xuICAgIGxheWVyLnNldFN0eWxlKHRoaXMuX2xheWVyU3R5bGUoKSk7XG4gIH1cblxuICBfY29sb3JEaXN0cmljdChkaXN0cmljdCkge1xuICAgIHZhciBzdGF0dXMgPSB0aGlzLnN0YXR1c0RhdGFbZGlzdHJpY3QucHJvcGVydGllcy5OQU1FIC0gMV0uc3RhdHVzO1xuXG4gICAgc3dpdGNoKHN0YXR1cykge1xuICAgICAgY2FzZSAnRk9SJzpcbiAgICAgICAgcmV0dXJuICcjMWU5MGZmJztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdBR0FJTlNUJzpcbiAgICAgICAgcmV0dXJuICcjRkY0QzUwJztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdUQVJHRVQnOlxuICAgICAgICByZXR1cm4gJyNDQzAwMDQnO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgLy9DYWxsIGdlb2pzb25cbiAgICB0aGlzLmRpc3RyaWN0cyA9IEwuZ2VvSlNPTih0aGlzLmdlb2pzb24sIHtcbiAgICAgIHN0eWxlOiB0aGlzLl9sYXllclN0eWxlLmJpbmQodGhpcyksXG4gICAgICBvbkVhY2hGZWF0dXJlOiB0aGlzLl9vbkVhY2hGZWF0dXJlLmJpbmQodGhpcylcbiAgICB9KVxuICAgIHRoaXMuZGlzdHJpY3RzLmFkZFRvKHRoaXMubWFwKTtcbiAgICB0aGlzLmRpc3RyaWN0cy5icmluZ1RvQmFjaygpO1xuXG4gICAgY29uc29sZS5sb2codGhpcy5sYXllcnMpO1xuICB9XG5cbiAgLy9GaXRCb3VuZHMgb24gdGhlIGRpc3RyaWN0XG4gIGZvY3VzT25EaXN0cmljdChsYXRMbmcpIHtcbiAgICBjb25zdCB0YXJnZXQgPSBsZWFmbGV0UGlwLnBvaW50SW5MYXllcihsYXRMbmcsIHRoaXMuZGlzdHJpY3RzLCB0cnVlKVswXTtcblxuICAgIGlmICh0YXJnZXQpIHtcbiAgICAgIHRoaXMubWFwLmZpdEJvdW5kcyh0YXJnZXQuZ2V0Qm91bmRzKCkpO1xuICAgICAgdGhpcy5kaXN0cmljdHMuZWFjaExheWVyKHRoaXMuX3Jlc2V0TGF5ZXJTdHlsZS5iaW5kKHRoaXMpKTtcbiAgICAgIHRhcmdldC5zZXRTdHlsZSh0aGlzLl9jaG9zZW5TdHlsZSgpKVxuICAgICAgLy9SZWZyZXNoIHdob2xlIG1hcFxuICAgIH1cblxuXG5cbiAgfVxufVxuIiwiLyoqXG4gKiBSZXByZXNlbnRhdGl2ZU1hbmFnZXJcbiAqIEZhY2lsaXRhdGVzIHRoZSByZXRyaWV2YWwgb2YgdGhlIHVzZXIncyBSZXByZXNlbnRhdGl2ZSBiYXNlZCBvbiB0aGVpciBBZGRyZXNzXG4gKiovXG5jbGFzcyBSZXByZXNlbnRhdGl2ZU1hbmFnZXIge1xuXG4gIGNvbnN0cnVjdG9yKG1hcCwgc3RhdHVzLCBjb250YWN0KSB7XG4gICAgdGhpcy5tYXAgPSBtYXA7XG4gICAgdGhpcy5zdGF0dXMgPSBzdGF0dXM7XG4gICAgdGhpcy5jb250YWN0ID0gY29udGFjdDtcblxuICAgIHRoaXMucmVwcmVzZW50YXRpdmVDb250YWluZXIgPSAkKFwiI3NlbmF0b3ItaW5mb1wiKTtcbiAgfVxuXG4gIHNob3dSZXByZXNlbnRhdGl2ZShsYXRMbmcpIHtcbiAgICB0aGlzLnRhcmdldCA9IGxlYWZsZXRQaXAucG9pbnRJbkxheWVyKGxhdExuZywgdGhpcy5tYXAuZGlzdHJpY3RzLCB0cnVlKVswXTtcbiAgICBjb25zb2xlLmxvZyhcIlJlcHJlc2VudGF0aXZlTWFuYWdlclwiLCB0aGlzLnRhcmdldCk7XG5cbiAgICB0aGlzLnJlbmRlcigpO1xuICB9XG5cbiAgcmVuZGVyUGFydGllcyhwYXJ0aWVzKSB7XG4gICAgY29uc3QgcGFydHlMaXN0ID0gcGFydGllcy5zcGxpdCgnLCcpO1xuXG4gICAgY29uc3QgdG9TdHJpbmcgPSBwYXJ0eUxpc3QubWFwKGk9PmA8bGkgY2xhc3M9J3BhcnR5ICR7aX0nPjxzcGFuPiR7aX08L3NwYW4+PC9saT5gKS5qb2luKCcnKTtcblxuICAgIHJldHVybiBgPHVsIGNsYXNzPSdwYXJ0aWVzJz4ke3RvU3RyaW5nfTwvdWw+YDtcbiAgfVxuXG4gIHJlbmRlclRoYW5rcyhyZXBUb1JlbmRlcikge1xuICAgIHJldHVybiBgXG4gICAgICA8ZGl2PlxuICAgICAgICA8cCBjbGFzcz0nc3RhdHVzJz5cbiAgICAgICAgICAke3JlcFRvUmVuZGVyLnN0YXR1cyA9PT0gXCJGT1JcIiA/IGBTZW4uICR7cmVwVG9SZW5kZXIubmFtZX0gaXMgPHN0cm9uZz5zdXBwb3J0aXZlPC9zdHJvbmc+IG9mIHRoZSBOZXcgWW9yayBIZWFsdGggQWN0IChTNDg0MCkuIENhbGwgdGhlIHNlbmF0b3IgdG8gdGhhbmsgdGhlbSFgXG4gICAgICAgICAgICA6IGBTZW4uICR7cmVwVG9SZW5kZXIubmFtZX0gaXMgbm90IHlldCBzdXBwb3J0aXZlIG9mIHRoZSBOZXcgWW9yayBIZWFsdGggQWN0ICAoUzQ4NDApLiBDYWxsIHRoZW0gdG8gZW5jb3VyYWdlIGFuZCB1cmdlIHRoZW0gdG8gZ2l2ZSB0aGVpciBzdXBwb3J0IHRvIHRoaXMgaW1wb3J0YW50IGJpbGwuYH1cbiAgICAgICAgPC9wPlxuICAgICAgICA8aDQ+SGVyZSdzIEhvdzwvaDQ+XG4gICAgICAgIDxoNT4xLiBDYWxsIHRoZSBzZW5hdG9yIGF0IDxpIGNsYXNzPVwiZmEgZmEtcGhvbmVcIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L2k+ICR7cmVwVG9SZW5kZXIucGhvbmV9PC9oNT5cbiAgICAgICAgPGg1PjIuIFRoYW5rIHRoZW0gdGhyb3VnaCB0aGVpciBzdGFmZiE8L2g1PlxuICAgICAgICA8cD5UaGUgc3RhZmZlciB3aWxsIG1ha2Ugc3VyZSB0aGF0IHlvdXIgbWVzc2FnZSBpcyBzZW50IHRvIHRoZSBzZW5hdG9yLjwvcD5cbiAgICAgICAgPHN1Yj5TYW1wbGUgTWVzc2FnZTwvc3ViPlxuICAgICAgICA8YmxvY2txdW90ZT5cbiAgICAgICAgICBIaSEgTXkgbmFtZSBpcyBfX19fX18uIEkgYW0gYSBjb25zdGl0dWVudCBvZiBTZW4uICR7cmVwVG9SZW5kZXIubmFtZX0gYXQgemlwY29kZSBfX19fXy4gSSBhbSBzZW5kaW5nIG15IHRoYW5rcyB0byB0aGUgc2VuYXRvciBmb3Igc3VwcG9ydGluZyBhbmQgY28tc3BvbnNvcmluZyB0aGUgTmV3IFlvcmsgSGVhbHRoIEFjdCAoUzQ4NDApLlxuICAgICAgICAgIEhlYWx0aCBjYXJlIGlzIGEgdmVyeSBpbXBvcnRhbnQgaXNzdWUgZm9yIG1lLCBhbmQgdGhlIHNlbmF0b3IncyBzdXBwb3J0IG1lYW5zIGEgbG90LiBUaGFuayB5b3UhXG4gICAgICAgIDwvYmxvY2txdW90ZT5cbiAgICAgICAgPGg1PjMuIFRlbGwgeW91ciBmcmllbmRzIHRvIGNhbGwhPC9oNT5cbiAgICAgICAgPHA+U2hhcmUgdGhpcyBwYWdlIHdpdGggeW91ciBmcmllbmRzIGFuZCB1cmdlIHRoZW0gdG8gY2FsbCB5b3VyIHNlbmF0b3IhPC9wPlxuICAgICAgPC9kaXY+XG4gICAgYFxuICB9XG5cbiAgcmVuZGVyVXJnZShyZXBUb1JlbmRlcikge1xuICAgIHJldHVybiBgXG4gICAgPGRpdj5cbiAgICAgIDxwIGNsYXNzPSdzdGF0dXMnPlxuICAgICAgICAke3JlcFRvUmVuZGVyLnN0YXR1cyA9PT0gXCJGT1JcIiA/IGBTZW4uICR7cmVwVG9SZW5kZXIubmFtZX0gaXMgPHN0cm9uZz5zdXBwb3J0aXZlPC9zdHJvbmc+IG9mIHRoZSBOZXcgWW9yayBIZWFsdGggQWN0IChTNDg0MCkuIENhbGwgdGhlIHNlbmF0b3IgdG8gdGhhbmsgdGhlbSFgXG4gICAgICAgICAgOiBgU2VuLiAke3JlcFRvUmVuZGVyLm5hbWV9IGlzIDxzdHJvbmcgY2xhc3M9J25vdCc+bm90IHlldCBzdXBwb3J0aXZlPC9zdHJvbmc+IG9mIHRoZSBOZXcgWW9yayBIZWFsdGggQWN0ICAoUzQ4NDApLiBDYWxsIHRoZW0gdG8gZW5jb3VyYWdlIGFuZCB1cmdlIHRoZW0gdG8gZ2l2ZSB0aGVpciBzdXBwb3J0IHRvIHRoaXMgaW1wb3J0YW50IGJpbGwuYH1cbiAgICAgIDwvcD5cbiAgICAgIDxoND5IZXJlJ3MgSG93PC9oND5cbiAgICAgIDxoNT4xLiBDYWxsIHRoZSBzZW5hdG9yIGF0IDxpIGNsYXNzPVwiZmEgZmEtcGhvbmVcIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L2k+ICR7cmVwVG9SZW5kZXIucGhvbmV9PC9oNT5cbiAgICAgIDxoNT4yLiBUYWxrIHRvIHRoZW0gYWJvdXQgeW91ciBzdXBwb3J0ITwvaDU+XG4gICAgICA8cD5Zb3Ugd2lsbCBtb3N0IGxpa2VseSB0YWxrIHdpdGggYSBzdGFmZmVyLiBUZWxsIHRoZW0gYWJvdXQgeW91ciBzdG9yeS4gVGhlIHN0YWZmZXIgd2lsbCBtYWtlIHN1cmUgdGhhdCB5b3VyIG1lc3NhZ2UgaXMgc2VudCB0byB0aGUgc2VuYXRvci48L3A+XG4gICAgICA8c3ViPlNhbXBsZSBNZXNzYWdlPC9zdWI+XG4gICAgICA8YmxvY2txdW90ZT5cbiAgICAgICAgSGkhIE15IG5hbWUgaXMgX19fX19fLiBJIGFtIGEgY29uc3RpdHVlbnQgb2YgU2VuLiAke3JlcFRvUmVuZGVyLm5hbWV9IGF0IHppcGNvZGUgX19fX18uXG4gICAgICAgIEkgYW0gc3Ryb25nbHkgdXJnaW5nIHRoZSBzZW5hdG9yIHRvIHN1cHBvcnQgYW5kIGNvLXNwb25zb3IgdGhlIE5ldyBZb3JrIEhlYWx0aCBBY3QgKFM0ODQwKS5cbiAgICAgICAgSGVhbHRoIGNhcmUgaXMgYSB2ZXJ5IGltcG9ydGFudCBpc3N1ZSBmb3IgbWUsIGFuZCB0aGUgc2VuYXRvcidzIHN1cHBvcnQgbWVhbnMgYSBsb3QuIFRoYW5rIHlvdSFcbiAgICAgIDwvYmxvY2txdW90ZT5cbiAgICAgIDxoNT4zLiBUZWxsIHlvdXIgZnJpZW5kcyB0byBjYWxsITwvaDU+XG4gICAgICA8cD5TaGFyZSB0aGlzIHBhZ2Ugd2l0aCB5b3VyIGZyaWVuZHMgYW5kIHVyZ2UgdGhlbSB0byBjYWxsIHlvdXIgc2VuYXRvciE8L3A+XG4gICAgPC9kaXY+XG4gICAgYFxuICB9XG4gIHJlbmRlcigpIHtcbiAgICBpZiAoIXRoaXMudGFyZ2V0KSByZXR1cm4gbnVsbDtcblxuICAgIGNvbnN0IGRpc3RyaWN0TnVtYmVyID0gcGFyc2VJbnQodGhpcy50YXJnZXQuZmVhdHVyZS5wcm9wZXJ0aWVzLk5BTUUpO1xuICAgIGNvbnN0IHJlcFRvUmVuZGVyID0gdGhpcy5zdGF0dXMuZmlsdGVyKGk9PmkuZGlzdHJpY3QgPT0gZGlzdHJpY3ROdW1iZXIpWzBdO1xuICAgIGNvbnN0IGNvbnRhY3RPZlJlcCA9IHRoaXMuY29udGFjdC5maWx0ZXIoaT0+aS5kaXN0cmljdCA9PSBkaXN0cmljdE51bWJlcilbMF07XG5cbiAgICBjb25zb2xlLmxvZyhyZXBUb1JlbmRlciwgY29udGFjdE9mUmVwKTtcbiAgICB0aGlzLnJlcHJlc2VudGF0aXZlQ29udGFpbmVyLmh0bWwoXG4gICAgICBgPGRpdj5cbiAgICAgICAgPGg1IGNsYXNzPSd5b3VyLXNlbmF0b3InPllvdXIgU3RhdGUgU2VuYXRvcjwvaDU+XG4gICAgICAgIDxkaXYgY2xhc3M9J2Jhc2ljLWluZm8nPlxuICAgICAgICAgIDxpbWcgc3JjPScke2NvbnRhY3RPZlJlcC5pbWFnZX0nIGNsYXNzPSdyZXAtcGljJyAvPlxuICAgICAgICAgIDxoNT5OWSBEaXN0cmljdCAke3JlcFRvUmVuZGVyLmRpc3RyaWN0fTwvaDU+XG4gICAgICAgICAgPGgzPiR7cmVwVG9SZW5kZXIubmFtZX08L2gzPlxuICAgICAgICAgIDxwPiR7dGhpcy5yZW5kZXJQYXJ0aWVzKGNvbnRhY3RPZlJlcC5wYXJ0eSl9PC9wPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz0nYWN0aW9uLWFyZWEnPlxuICAgICAgICAgICR7cmVwVG9SZW5kZXIuc3RhdHVzID09PSBcIkZPUlwiID8gdGhpcy5yZW5kZXJUaGFua3MocmVwVG9SZW5kZXIpIDogdGhpcy5yZW5kZXJVcmdlKHJlcFRvUmVuZGVyKSB9XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPSd3ZWJzaXRlJz5cbiAgICAgICAgICA8YSBocmVmPScke3JlcFRvUmVuZGVyLmNvbnRhY3R9JyB0YXJnZXQ9J19ibGFuayc+TW9yZSB3YXlzIHRvIGNvbnRhY3QgPHN0cm9uZz5TZW4uICR7cmVwVG9SZW5kZXIubmFtZX08L3N0cm9uZz48L2E+XG4gICAgICAgIDxkaXY+XG4gICAgICAgPC9kaXY+YFxuICAgICk7XG4gIH1cblxufVxuIiwiLyoqXG4qIEZhY2lsaXRhdGVzIHRoZSBzZWFyY2hcbiovXG5cbmNsYXNzIFNlYXJjaE1hbmFnZXIge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMudGFyZ2V0ID0gJChcIiNmb3JtLWFyZWFcIik7XG4gICAgdGhpcy5hZGRyZXNzRm9ybSA9ICQoXCIjZm9ybS1hcmVhICNhZGRyZXNzXCIpO1xuXG4gICAgdGhpcy5zZWFyY2hTdWdnZXN0aW9uc0NvbnRhaW5lciA9ICQoXCIjc2VhcmNoLXJlc3VsdHNcIik7XG4gICAgdGhpcy5zZWFyY2hTdWdnZXN0aW9ucyA9ICQoXCIjc2VhcmNoLXJlc3VsdHMgdWxcIik7XG4gICAgdGhpcy5jaG9zZW5Mb2NhdGlvbiA9IG51bGw7XG5cbiAgICB0aGlzLnRpbWVvdXQgPSBudWxsO1xuXG4gICAgdGhpcy5zZWFyY2hTdWdnZXN0aW9uc0NvbnRhaW5lci5oaWRlKCk7XG4gICAgdGhpcy5fc3RhcnRMaXN0ZW5lcigpO1xuICAgIHRoaXMucmVuZGVyKCk7XG4gIH1cblxuICBfc3RhcnRMaXN0ZW5lcigpIHtcbiAgICBjb25zdCB0aGF0ID0gdGhpcztcblxuICAgIC8vIExpc3RlbiB0byBhZGRyZXNzIGNoYW5nZXNcbiAgICB0aGlzLmFkZHJlc3NGb3JtLmJpbmQoJ2tleXVwJywgKGV2KT0+e1xuICAgICAgY29uc3QgYWRkcmVzcyA9IGV2LnRhcmdldC52YWx1ZTtcblxuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dCk7XG4gICAgICB0aGlzLnRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpPT57XG4gICAgICAgIC8vRmlsdGVyIHRoZSBhZGRyZXNzZXNcbiAgICAgICAgJC5nZXRKU09OKCdodHRwczovL25vbWluYXRpbS5vcGVuc3RyZWV0bWFwLm9yZy9zZWFyY2gvJyArIGVuY29kZVVSSUNvbXBvbmVudChhZGRyZXNzKSArICc/Zm9ybWF0PWpzb24nLFxuICAgICAgICAoZGF0YSkgPT4ge1xuICAgICAgICAgIHRoYXQuc2VhcmNoU3VnZ2VzdGlvbnNDb250YWluZXIuc2hvdygpO1xuICAgICAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XG4gICAgICAgICAgdGhhdC5yZW5kZXIoKTtcbiAgICAgICAgfSk7XG4gICAgICB9LCA1MDApO1xuICAgIH0pXG5cbiAgICAvL0xpc3RlbiB0byBjbGlja2luZyBvZiBzdWdnZXN0aW9uc1xuICAgIHRoYXQuc2VhcmNoU3VnZ2VzdGlvbnNDb250YWluZXIub24oXCJjbGlja1wiLCBcImFcIiwgKGV2KSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcIlRlc3RcIik7XG4gICAgICB0aGF0LnNlYXJjaFN1Z2dlc3Rpb25zQ29udGFpbmVyLmhpZGUoKTtcbiAgICB9KVxuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIHRoaXMuc2VhcmNoU3VnZ2VzdGlvbnMuZW1wdHkoKTtcbiAgICBpZiAodGhpcy5kYXRhKSB7XG4gICAgICB0aGlzLnNlYXJjaFN1Z2dlc3Rpb25zLmFwcGVuZChcbiAgICAgICAgdGhpcy5kYXRhLnNsaWNlKDAsNSkubWFwKChpdGVtKT0+YFxuICAgICAgICA8bGk+XG4gICAgICAgICAgPGRpdiBjbGFzcz0nc3VnZ2VzdGlvbicgbG9uPVwiJHtpdGVtLmxvbn1cIiBsYXQ9XCIke2l0ZW0ubGF0fVwiPlxuICAgICAgICAgICAgPGEgaHJlZj0nI2xvbj0ke2l0ZW0ubG9ufSZsYXQ9JHtpdGVtLmxhdH0nPiR7aXRlbS5kaXNwbGF5X25hbWV9PC9hPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2xpPmApXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG59XG4iLCJjbGFzcyBTdG9yaWVzTGlzdE1hbmFnZXIge1xuICBjb25zdHJ1Y3RvcihnZW9qc29uLCBzdGF0dXNEYXRhLCBjb250YWN0LCBzdG9yaWVzKSB7XG4gICAgdGhpcy5nZW9qc29uID0gZ2VvanNvbjtcbiAgICB0aGlzLnN0YXR1c0RhdGEgPSBzdGF0dXNEYXRhO1xuICAgIHRoaXMuY29udGFjdCA9IGNvbnRhY3Q7XG4gICAgdGhpcy5zdG9yaWVzID0gc3RvcmllcztcblxuICAgIHRoaXMuc3Rvcmllc0xpc3QgPSAkKFwiI3N0b3JpZXNcIik7XG4gIH1cblxuICBsaXN0TmVhcmJ5U3RvcmllcyhsYXRMbmcpIHtcbiAgICBjb25zb2xlLmxvZyhcIlN0b3JpZXNMaXN0TWFuYWdlclwiLCBsYXRMbmcpO1xuICB9XG59XG4iLCJcbmNsYXNzIEFwcCB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICB0aGlzLk1hcCA9IG51bGw7XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICAvL0xvYWRpbmcgZGF0YS4uLlxuICAgIHZhciBtYXBGZXRjaCA9ICQuZ2V0SlNPTignL2RhdGEvbnlzLXNlbmF0ZW1hcC5qc29uJyk7XG4gICAgdmFyIHNlbmF0b3JTdGF0dXNGZXRjaCA9ICQuZ2V0SlNPTignL2RhdGEvc3RhdHVzLmpzb24nKTtcbiAgICB2YXIgc3RhdGVTZW5hdG9yc0luZm8gPSAkLmdldEpTT04oJy9kYXRhL3N0YXRlLXNlbmF0b3JzLmpzb24nKTtcbiAgICB2YXIgc3Rvcmllc0luZm8gPSAkLmdldEpTT04oJy9kYXRhL3N0b3JpZXMuanNvbicpO1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAkLndoZW4obWFwRmV0Y2gsIHNlbmF0b3JTdGF0dXNGZXRjaCwgc3RhdGVTZW5hdG9yc0luZm8sIHN0b3JpZXNJbmZvKS50aGVuKFxuICAgICAgKGdlb2pzb24sIHN0YXR1c0RhdGEsIGNvbnRhY3QsIHN0b3JpZXMpPT57XG4gICAgICB0aGF0Lk1hcCA9IG5ldyBNYXBNYW5hZ2VyKGdlb2pzb25bMF0sIHN0YXR1c0RhdGFbMF0sIGNvbnRhY3RbMF0sIHN0b3JpZXNbMF0pO1xuICAgICAgdGhhdC5TdG9yeUxpc3QgPSBuZXcgU3Rvcmllc0xpc3RNYW5hZ2VyKGdlb2pzb25bMF0sIHN0YXR1c0RhdGFbMF0sIGNvbnRhY3RbMF0sIHN0b3JpZXNbMF0pO1xuICAgICAgdGhhdC5TZWFyY2ggPSBuZXcgU2VhcmNoTWFuYWdlcigpO1xuICAgICAgdGhhdC5SZXAgPSBuZXcgUmVwcmVzZW50YXRpdmVNYW5hZ2VyKHRoYXQuTWFwLCBzdGF0dXNEYXRhWzBdLCBjb250YWN0WzBdKTtcbiAgICAgIHRoYXQuX2xpc3RlblRvV2luZG93KCk7XG4gICAgfSk7XG4gIH1cblxuICBfbGlzdGVuVG9XaW5kb3coKSB7XG5cbiAgICAkKHdpbmRvdykub24oJ2hhc2hjaGFuZ2UnLCAoKT0+e1xuICAgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5oYXNoICYmIHdpbmRvdy5sb2NhdGlvbi5oYXNoLmxlbmd0aCA+IDApXG4gICAgICB7XG4gICAgICAgIGNvbnN0IGhhc2ggPSAkLmRlcGFyYW0od2luZG93LmxvY2F0aW9uLmhhc2guc3Vic3RyaW5nKDEpKTtcblxuICAgICAgICBjb25zdCBsYXRMbmcgPSBuZXcgTC5sYXRMbmcoaGFzaC5sYXQsIGhhc2gubG9uKTtcbiAgICAgICAgLy8gVHJpZ2dlciB2YXJpb3VzIG1hbmFnZXJzXG4gICAgICAgIHRoaXMuU3RvcnlMaXN0Lmxpc3ROZWFyYnlTdG9yaWVzKGxhdExuZyk7XG4gICAgICAgIHRoaXMuUmVwLnNob3dSZXByZXNlbnRhdGl2ZShsYXRMbmcpO1xuICAgICAgICB0aGlzLk1hcC5mb2N1c09uRGlzdHJpY3QobGF0TG5nKVxuICAgICAgfVxuICAgIH0pO1xuICAgICQod2luZG93KS50cmlnZ2VyKFwiaGFzaGNoYW5nZVwiKTtcbiAgfVxufVxuXG53aW5kb3cuQXBwTWFuYWdlciA9IG5ldyBBcHAoe30pO1xuIl19
