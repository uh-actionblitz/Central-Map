'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MapManager = function () {
  function MapManager(geojson, statusData, contact, stories) {
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
    this.stories = stories;

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

      var content = '<div class=\'senator-popup-content\'>\n        <section class="senator-image-container">\n          <img src="' + senator.image + '" />\n        </section>\n        <section class="senator-info">\n          <h4>' + senator.name + '</h4>\n          <div>Party: ' + moreInfo.party + '</div>\n          <div>Senate District ' + senator.district + '</div>\n          <div class="' + (senator.status === 'FOR' ? 'votes-yes' : 'votes-no') + '">\n              ' + (senator.status === 'TARGET' ? 'High priority' : senator.status === 'FOR' ? 'Co-Sponsor' : 'Not Yet Supportive') + '\n          </div>\n        </section>\n        <a href="' + moreInfo.contact + '" class="contact-link" target="_blank">Contact</button>\n      </div>';

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
      //
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
        fillColor: 'yellow',
        fillOpacity: 0.1
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
          return 'lightgreen';
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
    }

    //FitBounds on the district

  }, {
    key: 'focusOnDistrict',
    value: function focusOnDistrict(latLng) {
      var target = leafletPip.pointInLayer(latLng, this.districts, true)[0];

      if (target) {
        this.map.fitBounds(target.getBounds(), { animate: false });
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

      this.representativeContainer.html("<div>\n        <a href=\"javascript: void(null)\" class='close'><i class=\"fa fa-times-circle-o\" aria-hidden=\"true\"></i></a>\n        <h5 class='your-senator'>Your State Senator</h5>\n        <div class='basic-info'>\n          <img src='" + contactOfRep.image + "' class='rep-pic' />\n          <h5>NY District " + repToRender.district + "</h5>\n          <h4>" + repToRender.name + "</h4>\n          <p>" + this.renderParties(contactOfRep.party) + "</p>\n        </div>\n        <div class='action-area'>\n          " + (repToRender.status === "FOR" ? this.renderThanks(repToRender) : this.renderUrge(repToRender)) + "\n        </div>\n        <div class='website'>\n          <a href='" + repToRender.contact + "' target='_blank'>More ways to contact <strong>Sen. " + repToRender.name + "</strong></a>\n        <div>\n       </div>");
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
    value: function listNearbyStories(latLng) {}
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvbWFwLmpzIiwiY2xhc3Nlcy9yZXByZXNlbnRhdGl2ZS5qcyIsImNsYXNzZXMvc2VhcmNoLmpzIiwiY2xhc3Nlcy9zdG9yaWVzbGlzdC5qcyIsImFwcC5qcyJdLCJuYW1lcyI6WyJNYXBNYW5hZ2VyIiwiZ2VvanNvbiIsInN0YXR1c0RhdGEiLCJjb250YWN0Iiwic3RvcmllcyIsIm1hcCIsIkwiLCJzZXRWaWV3IiwidGlsZUxheWVyIiwibWF4Wm9vbSIsImF0dHJpYnV0aW9uIiwiYWRkVG8iLCJyZW5kZXIiLCJldmVudCIsInBvcHVwIiwic2VuYXRvciIsInRhcmdldCIsIm9wdGlvbnMiLCJtb3JlSW5mbyIsImNvbnRlbnQiLCJpbWFnZSIsIm5hbWUiLCJwYXJ0eSIsImRpc3RyaWN0Iiwic3RhdHVzIiwiY2xvc2VCdXR0b24iLCJjbGFzc05hbWUiLCJzZXRDb250ZW50IiwiYmluZFBvcHVwIiwib3BlblBvcHVwIiwiZmVhdHVyZSIsImxheWVyIiwidGhhdCIsInByb3BlcnRpZXMiLCJOQU1FIiwiY2lyY2xlTWFya2VyIiwiZ2V0Qm91bmRzIiwiZ2V0Q2VudGVyIiwicmFkaXVzIiwiZmlsbENvbG9yIiwiX2NvbG9yRGlzdHJpY3QiLCJjb2xvciIsIm9wYWNpdHkiLCJmaWxsT3BhY2l0eSIsIm9uIiwiY2xpY2siLCJfcmVuZGVyQnViYmxlIiwiYmluZCIsImUiLCJ3aW5kb3ciLCJsb2NhdGlvbiIsImhhc2giLCJsYXRsbmciLCJsYXQiLCJsbmciLCJfbGVhZmxldF9pZCIsImlkIiwid2VpZ2h0Iiwic2V0U3R5bGUiLCJfbGF5ZXJTdHlsZSIsImRpc3RyaWN0cyIsImdlb0pTT04iLCJzdHlsZSIsIm9uRWFjaEZlYXR1cmUiLCJfb25FYWNoRmVhdHVyZSIsImJyaW5nVG9CYWNrIiwibGF0TG5nIiwibGVhZmxldFBpcCIsInBvaW50SW5MYXllciIsImZpdEJvdW5kcyIsImFuaW1hdGUiLCJlYWNoTGF5ZXIiLCJfcmVzZXRMYXllclN0eWxlIiwiX2Nob3NlblN0eWxlIiwiUmVwcmVzZW50YXRpdmVNYW5hZ2VyIiwicmVwcmVzZW50YXRpdmVDb250YWluZXIiLCIkIiwiYWRkRXZlbnRzIiwiZW1wdHkiLCJwYXJ0aWVzIiwicGFydHlMaXN0Iiwic3BsaXQiLCJ0b1N0cmluZyIsImkiLCJqb2luIiwicmVwVG9SZW5kZXIiLCJwaG9uZSIsImRpc3RyaWN0TnVtYmVyIiwicGFyc2VJbnQiLCJmaWx0ZXIiLCJjb250YWN0T2ZSZXAiLCJodG1sIiwicmVuZGVyUGFydGllcyIsInJlbmRlclRoYW5rcyIsInJlbmRlclVyZ2UiLCJTZWFyY2hNYW5hZ2VyIiwiYWRkcmVzc0Zvcm0iLCJzZWFyY2hTdWdnZXN0aW9uc0NvbnRhaW5lciIsInNlYXJjaFN1Z2dlc3Rpb25zIiwiY2hvc2VuTG9jYXRpb24iLCJ0aW1lb3V0IiwiaGlkZSIsIl9zdGFydExpc3RlbmVyIiwiZXYiLCJhZGRyZXNzIiwidmFsdWUiLCJjbGVhclRpbWVvdXQiLCJzZXRUaW1lb3V0IiwiZ2V0SlNPTiIsImVuY29kZVVSSUNvbXBvbmVudCIsImRhdGEiLCJzaG93IiwiZmluZCIsImFwcGVuZCIsInNsaWNlIiwiaXRlbSIsImxvbiIsImRpc3BsYXlfbmFtZSIsIlN0b3JpZXNMaXN0TWFuYWdlciIsInN0b3JpZXNMaXN0IiwiQXBwIiwiTWFwIiwibWFwRmV0Y2giLCJzZW5hdG9yU3RhdHVzRmV0Y2giLCJzdGF0ZVNlbmF0b3JzSW5mbyIsInN0b3JpZXNJbmZvIiwid2hlbiIsInRoZW4iLCJTdG9yeUxpc3QiLCJTZWFyY2giLCJSZXAiLCJfbGlzdGVuVG9XaW5kb3ciLCJsZW5ndGgiLCJkZXBhcmFtIiwic3Vic3RyaW5nIiwibGlzdE5lYXJieVN0b3JpZXMiLCJzaG93UmVwcmVzZW50YXRpdmUiLCJmb2N1c09uRGlzdHJpY3QiLCJ0cmlnZ2VyIiwiQXBwTWFuYWdlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0lBQU1BO0FBQ0osc0JBQVlDLE9BQVosRUFBcUJDLFVBQXJCLEVBQWlDQyxPQUFqQyxFQUEwQ0Ms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TWpGLE9BQU95QixFQUFFeUQsT0FBRixDQUFVcEYsT0FBT0MsUUFBUCxDQUFnQkMsSUFBaEIsQ0FBcUJtRixTQUFyQixDQUErQixDQUEvQixDQUFWLENBQWI7O0FBRUEsY0FBTXBFLFNBQVMsSUFBSTVELEVBQUU0RCxNQUFOLENBQWFmLEtBQUtFLEdBQWxCLEVBQXVCRixLQUFLaUUsR0FBNUIsQ0FBZjtBQUNBO0FBQ0EsZ0JBQUtZLFNBQUwsQ0FBZU8saUJBQWYsQ0FBaUNyRSxNQUFqQztBQUNBLGdCQUFLZ0UsR0FBTCxDQUFTTSxrQkFBVCxDQUE0QnRFLE1BQTVCO0FBQ0EsZ0JBQUt1RCxHQUFMLENBQVNnQixlQUFULENBQXlCdkUsTUFBekI7QUFDRDtBQUNGLE9BWEQ7QUFZQVUsUUFBRTNCLE1BQUYsRUFBVXlGLE9BQVYsQ0FBa0IsWUFBbEI7QUFDRDs7Ozs7O0FBR0h6RixPQUFPMEYsVUFBUCxHQUFvQixJQUFJbkIsR0FBSixDQUFRLEVBQVIsQ0FBcEIiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgTWFwTWFuYWdlciB7XG4gIGNvbnN0cnVjdG9yKGdlb2pzb24sIHN0YXR1c0RhdGEsIGNvbnRhY3QsIHN0b3JpZXMpIHtcblxuICAgIC8vSW5pdGlhbGl6aW5nIE1hcFxuICAgIHRoaXMubWFwID0gbmV3IEwubWFwKCdtYXAnKS5zZXRWaWV3KFs0Mi44NjMsLTc0Ljc1Ml0sIDYuNTUpO1xuICAgIEwudGlsZUxheWVyKCdodHRwczovL2NhcnRvZGItYmFzZW1hcHMte3N9Lmdsb2JhbC5zc2wuZmFzdGx5Lm5ldC9saWdodF9hbGwve3p9L3t4fS97eX0ucG5nJywge1xuICAgICAgbWF4Wm9vbTogMTgsXG4gICAgICBhdHRyaWJ1dGlvbjogJyZjb3B5OyA8YSBocmVmPVwiaHR0cDovL3d3dy5vcGVuc3RyZWV0bWFwLm9yZy9jb3B5cmlnaHRcIj5PcGVuU3RyZWV0TWFwPC9hPiwgJmNvcHk7PGEgaHJlZj1cImh0dHBzOi8vY2FydG8uY29tL2F0dHJpYnV0aW9uXCI+Q0FSVE88L2E+LiBJbnRlcmFjdGl2aXR5IGJ5IDxhIGhyZWY9XCIvL2FjdGlvbmJsaXR6Lm9yZ1wiPkFjdGlvbkJsaXR6PC9hPidcbiAgICB9KS5hZGRUbyh0aGlzLm1hcCk7XG5cblxuICAgIHRoaXMuc3RhdHVzRGF0YSA9IHN0YXR1c0RhdGE7XG4gICAgdGhpcy5nZW9qc29uID0gZ2VvanNvbjtcbiAgICB0aGlzLmNvbnRhY3QgPSBjb250YWN0O1xuICAgIHRoaXMuc3RvcmllcyA9IHN0b3JpZXM7XG5cblxuXG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgfVxuXG4gIC8qKipcbiAgKiBwcml2YXRlIG1ldGhvZCBfcmVuZGVyQnViYmxlXG4gICpcbiAgKi9cbiAgX3JlbmRlckJ1YmJsZShldmVudCkge1xuXG4gICAgdmFyIHBvcHVwO1xuICAgIHZhciBzZW5hdG9yID0gZXZlbnQudGFyZ2V0Lm9wdGlvbnMuc3RhdHVzRGF0YTtcbiAgICB2YXIgbW9yZUluZm8gPSBldmVudC50YXJnZXQub3B0aW9ucy5jb250YWN0O1xuXG4gICAgdmFyIGNvbnRlbnQgPSAoXG4gICAgICBgPGRpdiBjbGFzcz0nc2VuYXRvci1wb3B1cC1jb250ZW50Jz5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3M9XCJzZW5hdG9yLWltYWdlLWNvbnRhaW5lclwiPlxuICAgICAgICAgIDxpbWcgc3JjPVwiJHtzZW5hdG9yLmltYWdlfVwiIC8+XG4gICAgICAgIDwvc2VjdGlvbj5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3M9XCJzZW5hdG9yLWluZm9cIj5cbiAgICAgICAgICA8aDQ+JHtzZW5hdG9yLm5hbWV9PC9oND5cbiAgICAgICAgICA8ZGl2PlBhcnR5OiAke21vcmVJbmZvLnBhcnR5fTwvZGl2PlxuICAgICAgICAgIDxkaXY+U2VuYXRlIERpc3RyaWN0ICR7c2VuYXRvci5kaXN0cmljdH08L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiJHsoc2VuYXRvci5zdGF0dXMgPT09ICdGT1InKSA/ICd2b3Rlcy15ZXMnIDogJ3ZvdGVzLW5vJ31cIj5cbiAgICAgICAgICAgICAgJHtzZW5hdG9yLnN0YXR1cyA9PT0gJ1RBUkdFVCcgPyAnSGlnaCBwcmlvcml0eScgOiAoc2VuYXRvci5zdGF0dXMgPT09ICdGT1InKSA/ICdDby1TcG9uc29yJyA6ICdOb3QgWWV0IFN1cHBvcnRpdmUnfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L3NlY3Rpb24+XG4gICAgICAgIDxhIGhyZWY9XCIke21vcmVJbmZvLmNvbnRhY3R9XCIgY2xhc3M9XCJjb250YWN0LWxpbmtcIiB0YXJnZXQ9XCJfYmxhbmtcIj5Db250YWN0PC9idXR0b24+XG4gICAgICA8L2Rpdj5gKTtcblxuICAgIHBvcHVwID0gTC5wb3B1cCh7XG4gICAgICBjbG9zZUJ1dHRvbjogdHJ1ZSxcbiAgICAgIGNsYXNzTmFtZTogJ3NlbmF0b3ItcG9wdXAnLFxuICAgICB9KTtcblxuICAgIHBvcHVwLnNldENvbnRlbnQoY29udGVudCk7XG4gICAgZXZlbnQudGFyZ2V0LmJpbmRQb3B1cChwb3B1cCkub3BlblBvcHVwKCk7XG4gIH1cblxuICBfb25FYWNoRmVhdHVyZShmZWF0dXJlLCBsYXllcikge1xuICAgICAgLy9cbiAgICAgIC8vXG4gICAgICBjb25zdCB0aGF0ID0gdGhpcztcblxuICAgICAgdmFyIHN0YXR1cyA9IHRoaXMuc3RhdHVzRGF0YVtmZWF0dXJlLnByb3BlcnRpZXMuTkFNRSAtIDFdLnN0YXR1cztcblxuICAgICAgLy8gQ3JlYXRlIENpcmNsZSBNYXJrZXJcbiAgICAgIEwuY2lyY2xlTWFya2VyKGxheWVyLmdldEJvdW5kcygpLmdldENlbnRlcigpLCB7XG4gICAgICAgIHJhZGl1czogNyxcbiAgICAgICAgZmlsbENvbG9yOiB0aGlzLl9jb2xvckRpc3RyaWN0KGZlYXR1cmUpLFxuICAgICAgICBjb2xvcjogJ3doaXRlJyxcbiAgICAgICAgb3BhY2l0eTogMSxcbiAgICAgICAgZmlsbE9wYWNpdHk6IDAuNyxcblxuICAgICAgICAvL0RhdGFcbiAgICAgICAgc3RhdHVzRGF0YTogdGhpcy5zdGF0dXNEYXRhW2ZlYXR1cmUucHJvcGVydGllcy5OQU1FIC0gMV0sXG4gICAgICAgIGNvbnRhY3Q6IHRoaXMuY29udGFjdFtmZWF0dXJlLnByb3BlcnRpZXMuTkFNRSAtIDFdLFxuICAgICAgfSlcbiAgICAgIC5vbih7XG4gICAgICAgIGNsaWNrOiB0aGlzLl9yZW5kZXJCdWJibGUuYmluZCh0aGlzKSxcbiAgICAgIH0pLmFkZFRvKHRoaXMubWFwKTtcblxuXG4gICAgICBsYXllci5vbih7XG4gICAgICAgIGNsaWNrOiAoZSk9PntcblxuICAgICAgICAgIC8vIHRoaXMubWFwLmZpdEJvdW5kcyhsYXllci5nZXRCb3VuZHMoKSk7XG4gICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSBgI2xhdD0ke2UubGF0bG5nLmxhdH0mbG9uPSR7ZS5sYXRsbmcubG5nfWBcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgbGF5ZXIuX2xlYWZsZXRfaWQgPSBmZWF0dXJlLmlkXG4gICAgICAvLyBsYXllci5vbih7XG4gICAgICAgIC8vIG1vdXNlb3ZlcjogaGFuZGxlTW91c2VPdmVyLFxuICAgICAgICAvLyBtb3VzZW91dDogaGFuZGxlTW91c2VPdXRcbiAgICAgIC8vIH0pO1xuICAgIH1cblxuICBfbGF5ZXJTdHlsZSgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZmlsbENvbG9yOiAnZ3JheScsXG4gICAgICBmaWxsT3BhY2l0eTogMC4wMSxcbiAgICAgIGNvbG9yOiAnZ3JheScsXG4gICAgICBvcGFjaXR5OiAnMScsXG4gICAgICB3ZWlnaHQ6IDFcbiAgICB9O1xuICB9XG4gIF9jaG9zZW5TdHlsZSgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZmlsbENvbG9yOiAneWVsbG93JyxcbiAgICAgIGZpbGxPcGFjaXR5OiAwLjFcbiAgICB9XG4gIH1cblxuICBfcmVzZXRMYXllclN0eWxlKGxheWVyKSB7XG4gICAgbGF5ZXIuc2V0U3R5bGUodGhpcy5fbGF5ZXJTdHlsZSgpKTtcbiAgfVxuXG4gIF9jb2xvckRpc3RyaWN0KGRpc3RyaWN0KSB7XG4gICAgdmFyIHN0YXR1cyA9IHRoaXMuc3RhdHVzRGF0YVtkaXN0cmljdC5wcm9wZXJ0aWVzLk5BTUUgLSAxXS5zdGF0dXM7XG5cbiAgICBzd2l0Y2goc3RhdHVzKSB7XG4gICAgICBjYXNlICdGT1InOlxuICAgICAgICByZXR1cm4gJ2xpZ2h0Z3JlZW4nO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ0FHQUlOU1QnOlxuICAgICAgICByZXR1cm4gJyNGRjRDNTAnO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ1RBUkdFVCc6XG4gICAgICAgIHJldHVybiAnI0NDMDAwNCc7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICAvL0NhbGwgZ2VvanNvblxuICAgIHRoaXMuZGlzdHJpY3RzID0gTC5nZW9KU09OKHRoaXMuZ2VvanNvbiwge1xuICAgICAgc3R5bGU6IHRoaXMuX2xheWVyU3R5bGUuYmluZCh0aGlzKSxcbiAgICAgIG9uRWFjaEZlYXR1cmU6IHRoaXMuX29uRWFjaEZlYXR1cmUuYmluZCh0aGlzKVxuICAgIH0pXG4gICAgdGhpcy5kaXN0cmljdHMuYWRkVG8odGhpcy5tYXApO1xuICAgIHRoaXMuZGlzdHJpY3RzLmJyaW5nVG9CYWNrKCk7XG5cblxuICB9XG5cbiAgLy9GaXRCb3VuZHMgb24gdGhlIGRpc3RyaWN0XG4gIGZvY3VzT25EaXN0cmljdChsYXRMbmcpIHtcbiAgICBjb25zdCB0YXJnZXQgPSBsZWFmbGV0UGlwLnBvaW50SW5MYXllcihsYXRMbmcsIHRoaXMuZGlzdHJpY3RzLCB0cnVlKVswXTtcblxuICAgIGlmICh0YXJnZXQpIHtcbiAgICAgIHRoaXMubWFwLmZpdEJvdW5kcyh0YXJnZXQuZ2V0Qm91bmRzKCksIHsgYW5pbWF0ZTogZmFsc2UgfSk7XG4gICAgICB0aGlzLmRpc3RyaWN0cy5lYWNoTGF5ZXIodGhpcy5fcmVzZXRMYXllclN0eWxlLmJpbmQodGhpcykpO1xuICAgICAgdGFyZ2V0LnNldFN0eWxlKHRoaXMuX2Nob3NlblN0eWxlKCkpXG4gICAgICAvL1JlZnJlc2ggd2hvbGUgbWFwXG4gICAgfVxuXG5cblxuICB9XG59XG4iLCIvKipcbiAqIFJlcHJlc2VudGF0aXZlTWFuYWdlclxuICogRmFjaWxpdGF0ZXMgdGhlIHJldHJpZXZhbCBvZiB0aGUgdXNlcidzIFJlcHJlc2VudGF0aXZlIGJhc2VkIG9uIHRoZWlyIEFkZHJlc3NcbiAqKi9cbmNsYXNzIFJlcHJlc2VudGF0aXZlTWFuYWdlciB7XG5cbiAgY29uc3RydWN0b3IobWFwLCBzdGF0dXMsIGNvbnRhY3QpIHtcbiAgICB0aGlzLm1hcCA9IG1hcDtcbiAgICB0aGlzLnN0YXR1cyA9IHN0YXR1cztcbiAgICB0aGlzLmNvbnRhY3QgPSBjb250YWN0O1xuXG4gICAgdGhpcy5yZXByZXNlbnRhdGl2ZUNvbnRhaW5lciA9ICQoXCIjc2VuYXRvci1pbmZvXCIpO1xuXG4gICAgLy9jcmVhdGUgbGlzdGVuZXJzXG4gICAgdGhpcy5hZGRFdmVudHMoKTtcbiAgfVxuXG4gIGFkZEV2ZW50cygpIHtcbiAgICAvL0Nsb3NlXG4gICAgdGhpcy5yZXByZXNlbnRhdGl2ZUNvbnRhaW5lci5vbignY2xpY2snLCBcImEuY2xvc2VcIiwgKCkgPT4gdGhpcy5yZXByZXNlbnRhdGl2ZUNvbnRhaW5lci5lbXB0eSgpKTtcbiAgfVxuXG4gIHNob3dSZXByZXNlbnRhdGl2ZShsYXRMbmcpIHtcbiAgICB0aGlzLnRhcmdldCA9IGxlYWZsZXRQaXAucG9pbnRJbkxheWVyKGxhdExuZywgdGhpcy5tYXAuZGlzdHJpY3RzLCB0cnVlKVswXTtcblxuXG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgfVxuXG4gIHJlbmRlclBhcnRpZXMocGFydGllcykge1xuICAgIGNvbnN0IHBhcnR5TGlzdCA9IHBhcnRpZXMuc3BsaXQoJywnKTtcbiAgICBjb25zdCB0b1N0cmluZyA9IHBhcnR5TGlzdC5tYXAoaT0+YDxsaSBjbGFzcz0ncGFydHkgJHtpfSc+PHNwYW4+JHtpfTwvc3Bhbj48L2xpPmApLmpvaW4oJycpO1xuICAgIHJldHVybiBgPHVsIGNsYXNzPSdwYXJ0aWVzJz4ke3RvU3RyaW5nfTwvdWw+YDtcbiAgfVxuXG4gIHJlbmRlclRoYW5rcyhyZXBUb1JlbmRlcikge1xuICAgIHJldHVybiBgXG4gICAgICA8ZGl2PlxuICAgICAgICA8cCBjbGFzcz0nc3RhdHVzJz5cbiAgICAgICAgICAke3JlcFRvUmVuZGVyLnN0YXR1cyA9PT0gXCJGT1JcIiA/IGBTZW4uICR7cmVwVG9SZW5kZXIubmFtZX0gaXMgPHN0cm9uZz5zdXBwb3J0aXZlPC9zdHJvbmc+IG9mIHRoZSBOZXcgWW9yayBIZWFsdGggQWN0IChTNDg0MCkuIENhbGwgdGhlIHNlbmF0b3IgdG8gdGhhbmsgdGhlbSFgXG4gICAgICAgICAgICA6IGBTZW4uICR7cmVwVG9SZW5kZXIubmFtZX0gaXMgbm90IHlldCBzdXBwb3J0aXZlIG9mIHRoZSBOZXcgWW9yayBIZWFsdGggQWN0ICAoUzQ4NDApLiBDYWxsIHRoZW0gdG8gZW5jb3VyYWdlIGFuZCB1cmdlIHRoZW0gdG8gZ2l2ZSB0aGVpciBzdXBwb3J0IHRvIHRoaXMgaW1wb3J0YW50IGJpbGwuYH1cbiAgICAgICAgPC9wPlxuICAgICAgICA8aDQ+SGVyZSdzIEhvdzwvaDQ+XG4gICAgICAgIDxoNT4xLiBDYWxsIHRoZSBzZW5hdG9yIGF0IDxpIGNsYXNzPVwiZmEgZmEtcGhvbmVcIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L2k+ICR7cmVwVG9SZW5kZXIucGhvbmV9PC9oNT5cbiAgICAgICAgPGg1PjIuIFRoYW5rIHRoZW0gdGhyb3VnaCB0aGVpciBzdGFmZiE8L2g1PlxuICAgICAgICA8cD5UaGUgc3RhZmZlciB3aWxsIG1ha2Ugc3VyZSB0aGF0IHlvdXIgbWVzc2FnZSBpcyBzZW50IHRvIHRoZSBzZW5hdG9yLjwvcD5cbiAgICAgICAgPHN1Yj5TYW1wbGUgTWVzc2FnZTwvc3ViPlxuICAgICAgICA8YmxvY2txdW90ZT5cbiAgICAgICAgICBIaSEgTXkgbmFtZSBpcyBfX19fX18uIEkgYW0gYSBjb25zdGl0dWVudCBvZiBTZW4uICR7cmVwVG9SZW5kZXIubmFtZX0gYXQgemlwY29kZSBfX19fXy4gSSBhbSBzZW5kaW5nIG15IHRoYW5rcyB0byB0aGUgc2VuYXRvciBmb3Igc3VwcG9ydGluZyBhbmQgY28tc3BvbnNvcmluZyB0aGUgTmV3IFlvcmsgSGVhbHRoIEFjdCAoUzQ4NDApLlxuICAgICAgICAgIEhlYWx0aCBjYXJlIGlzIGEgdmVyeSBpbXBvcnRhbnQgaXNzdWUgZm9yIG1lLCBhbmQgdGhlIHNlbmF0b3IncyBzdXBwb3J0IG1lYW5zIGEgbG90LiBUaGFuayB5b3UhXG4gICAgICAgIDwvYmxvY2txdW90ZT5cbiAgICAgICAgPGg1PjMuIFRlbGwgeW91ciBmcmllbmRzIHRvIGNhbGwhPC9oNT5cbiAgICAgICAgPHA+U2hhcmUgdGhpcyBwYWdlIHdpdGggeW91ciBmcmllbmRzIGFuZCB1cmdlIHRoZW0gdG8gY2FsbCB5b3VyIHNlbmF0b3IhPC9wPlxuICAgICAgPC9kaXY+XG4gICAgYFxuICB9XG5cbiAgcmVuZGVyVXJnZShyZXBUb1JlbmRlcikge1xuICAgIHJldHVybiBgXG4gICAgPGRpdj5cbiAgICAgIDxwIGNsYXNzPSdzdGF0dXMnPlxuICAgICAgICAke3JlcFRvUmVuZGVyLnN0YXR1cyA9PT0gXCJGT1JcIiA/IGBTZW4uICR7cmVwVG9SZW5kZXIubmFtZX0gaXMgPHN0cm9uZz5zdXBwb3J0aXZlPC9zdHJvbmc+IG9mIHRoZSBOZXcgWW9yayBIZWFsdGggQWN0IChTNDg0MCkuIENhbGwgdGhlIHNlbmF0b3IgdG8gdGhhbmsgdGhlbSFgXG4gICAgICAgICAgOiBgU2VuLiAke3JlcFRvUmVuZGVyLm5hbWV9IGlzIDxzdHJvbmcgY2xhc3M9J25vdCc+bm90IHlldCBzdXBwb3J0aXZlPC9zdHJvbmc+IG9mIHRoZSBOZXcgWW9yayBIZWFsdGggQWN0ICAoUzQ4NDApLiBDYWxsIHRoZW0gdG8gZW5jb3VyYWdlIGFuZCB1cmdlIHRoZW0gdG8gZ2l2ZSB0aGVpciBzdXBwb3J0IHRvIHRoaXMgaW1wb3J0YW50IGJpbGwuYH1cbiAgICAgIDwvcD5cbiAgICAgIDxoND5IZXJlJ3MgSG93PC9oND5cbiAgICAgIDxoNT4xLiBDYWxsIHRoZSBzZW5hdG9yIGF0IDxpIGNsYXNzPVwiZmEgZmEtcGhvbmVcIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L2k+ICR7cmVwVG9SZW5kZXIucGhvbmV9PC9oNT5cbiAgICAgIDxoNT4yLiBUYWxrIHRvIHRoZW0gYWJvdXQgeW91ciBzdXBwb3J0ITwvaDU+XG4gICAgICA8cD5Zb3Ugd2lsbCBtb3N0IGxpa2VseSB0YWxrIHdpdGggYSBzdGFmZmVyLiBUZWxsIHRoZW0gYWJvdXQgeW91ciBzdG9yeS4gVGhlIHN0YWZmZXIgd2lsbCBtYWtlIHN1cmUgdGhhdCB5b3VyIG1lc3NhZ2UgaXMgc2VudCB0byB0aGUgc2VuYXRvci48L3A+XG4gICAgICA8c3ViPlNhbXBsZSBNZXNzYWdlPC9zdWI+XG4gICAgICA8YmxvY2txdW90ZT5cbiAgICAgICAgSGkhIE15IG5hbWUgaXMgX19fX19fLiBJIGFtIGEgY29uc3RpdHVlbnQgb2YgU2VuLiAke3JlcFRvUmVuZGVyLm5hbWV9IGF0IHppcGNvZGUgX19fX18uXG4gICAgICAgIEkgYW0gc3Ryb25nbHkgdXJnaW5nIHRoZSBzZW5hdG9yIHRvIHN1cHBvcnQgYW5kIGNvLXNwb25zb3IgdGhlIE5ldyBZb3JrIEhlYWx0aCBBY3QgKFM0ODQwKS5cbiAgICAgICAgSGVhbHRoIGNhcmUgaXMgYSB2ZXJ5IGltcG9ydGFudCBpc3N1ZSBmb3IgbWUsIGFuZCB0aGUgc2VuYXRvcidzIHN1cHBvcnQgbWVhbnMgYSBsb3QuIFRoYW5rIHlvdSFcbiAgICAgIDwvYmxvY2txdW90ZT5cbiAgICAgIDxoNT4zLiBUZWxsIHlvdXIgZnJpZW5kcyB0byBjYWxsITwvaDU+XG4gICAgICA8cD5TaGFyZSB0aGlzIHBhZ2Ugd2l0aCB5b3VyIGZyaWVuZHMgYW5kIHVyZ2UgdGhlbSB0byBjYWxsIHlvdXIgc2VuYXRvciE8L3A+XG4gICAgPC9kaXY+XG4gICAgYFxuICB9XG4gIHJlbmRlcigpIHtcbiAgICBpZiAoIXRoaXMudGFyZ2V0KSByZXR1cm4gbnVsbDtcblxuICAgIGNvbnN0IGRpc3RyaWN0TnVtYmVyID0gcGFyc2VJbnQodGhpcy50YXJnZXQuZmVhdHVyZS5wcm9wZXJ0aWVzLk5BTUUpO1xuICAgIGNvbnN0IHJlcFRvUmVuZGVyID0gdGhpcy5zdGF0dXMuZmlsdGVyKGk9PmkuZGlzdHJpY3QgPT0gZGlzdHJpY3ROdW1iZXIpWzBdO1xuICAgIGNvbnN0IGNvbnRhY3RPZlJlcCA9IHRoaXMuY29udGFjdC5maWx0ZXIoaT0+aS5kaXN0cmljdCA9PSBkaXN0cmljdE51bWJlcilbMF07XG5cblxuICAgIHRoaXMucmVwcmVzZW50YXRpdmVDb250YWluZXIuaHRtbChcbiAgICAgIGA8ZGl2PlxuICAgICAgICA8YSBocmVmPVwiamF2YXNjcmlwdDogdm9pZChudWxsKVwiIGNsYXNzPSdjbG9zZSc+PGkgY2xhc3M9XCJmYSBmYS10aW1lcy1jaXJjbGUtb1wiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvaT48L2E+XG4gICAgICAgIDxoNSBjbGFzcz0neW91ci1zZW5hdG9yJz5Zb3VyIFN0YXRlIFNlbmF0b3I8L2g1PlxuICAgICAgICA8ZGl2IGNsYXNzPSdiYXNpYy1pbmZvJz5cbiAgICAgICAgICA8aW1nIHNyYz0nJHtjb250YWN0T2ZSZXAuaW1hZ2V9JyBjbGFzcz0ncmVwLXBpYycgLz5cbiAgICAgICAgICA8aDU+TlkgRGlzdHJpY3QgJHtyZXBUb1JlbmRlci5kaXN0cmljdH08L2g1PlxuICAgICAgICAgIDxoND4ke3JlcFRvUmVuZGVyLm5hbWV9PC9oND5cbiAgICAgICAgICA8cD4ke3RoaXMucmVuZGVyUGFydGllcyhjb250YWN0T2ZSZXAucGFydHkpfTwvcD5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9J2FjdGlvbi1hcmVhJz5cbiAgICAgICAgICAke3JlcFRvUmVuZGVyLnN0YXR1cyA9PT0gXCJGT1JcIiA/IHRoaXMucmVuZGVyVGhhbmtzKHJlcFRvUmVuZGVyKSA6IHRoaXMucmVuZGVyVXJnZShyZXBUb1JlbmRlcikgfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz0nd2Vic2l0ZSc+XG4gICAgICAgICAgPGEgaHJlZj0nJHtyZXBUb1JlbmRlci5jb250YWN0fScgdGFyZ2V0PSdfYmxhbmsnPk1vcmUgd2F5cyB0byBjb250YWN0IDxzdHJvbmc+U2VuLiAke3JlcFRvUmVuZGVyLm5hbWV9PC9zdHJvbmc+PC9hPlxuICAgICAgICA8ZGl2PlxuICAgICAgIDwvZGl2PmBcbiAgICApO1xuICB9XG5cbn1cbiIsIi8qKlxuKiBGYWNpbGl0YXRlcyB0aGUgc2VhcmNoXG4qL1xuXG5jbGFzcyBTZWFyY2hNYW5hZ2VyIHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnRhcmdldCA9ICQoXCIjZm9ybS1hcmVhXCIpO1xuICAgIHRoaXMuYWRkcmVzc0Zvcm0gPSAkKFwiI2Zvcm0tYXJlYSAjYWRkcmVzc1wiKTtcblxuICAgIHRoaXMuc2VhcmNoU3VnZ2VzdGlvbnNDb250YWluZXIgPSAkKFwiI3NlYXJjaC1yZXN1bHRzXCIpO1xuICAgIHRoaXMuc2VhcmNoU3VnZ2VzdGlvbnMgPSAkKFwiI3NlYXJjaC1yZXN1bHRzIHVsXCIpO1xuICAgIHRoaXMuY2hvc2VuTG9jYXRpb24gPSBudWxsO1xuXG4gICAgdGhpcy50aW1lb3V0ID0gbnVsbDtcblxuICAgIHRoaXMuc2VhcmNoU3VnZ2VzdGlvbnNDb250YWluZXIuaGlkZSgpO1xuICAgIHRoaXMuX3N0YXJ0TGlzdGVuZXIoKTtcbiAgICB0aGlzLnJlbmRlcigpO1xuICB9XG5cbiAgX3N0YXJ0TGlzdGVuZXIoKSB7XG4gICAgY29uc3QgdGhhdCA9IHRoaXM7XG5cbiAgICAvLyBMaXN0ZW4gdG8gYWRkcmVzcyBjaGFuZ2VzXG4gICAgdGhpcy5hZGRyZXNzRm9ybS5iaW5kKCdrZXl1cCcsIChldik9PntcbiAgICAgIGNvbnN0IGFkZHJlc3MgPSBldi50YXJnZXQudmFsdWU7XG5cbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpO1xuICAgICAgdGhpcy50aW1lb3V0ID0gc2V0VGltZW91dCgoKT0+e1xuICAgICAgICAvL0ZpbHRlciB0aGUgYWRkcmVzc2VzXG4gICAgICAgICQuZ2V0SlNPTignaHR0cHM6Ly9ub21pbmF0aW0ub3BlbnN0cmVldG1hcC5vcmcvc2VhcmNoLycgKyBlbmNvZGVVUklDb21wb25lbnQoYWRkcmVzcykgKyAnP2Zvcm1hdD1qc29uJyxcbiAgICAgICAgKGRhdGEpID0+IHtcbiAgICAgICAgICB0aGF0LnNlYXJjaFN1Z2dlc3Rpb25zQ29udGFpbmVyLnNob3coKTtcbiAgICAgICAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICAgICAgICAgIHRoYXQucmVuZGVyKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSwgNTAwKTtcbiAgICB9KVxuXG4gICAgdGhpcy50YXJnZXQuZmluZChcImZvcm1cIikub24oXCJzdWJtaXRcIiwgKCkgPT57IHJldHVybiBmYWxzZTsgfSk7XG5cbiAgICAvL0xpc3RlbiB0byBjbGlja2luZyBvZiBzdWdnZXN0aW9uc1xuICAgIHRoYXQuc2VhcmNoU3VnZ2VzdGlvbnNDb250YWluZXIub24oXCJjbGlja1wiLCBcImFcIiwgKGV2KSA9PiB7XG5cbiAgICAgIHRoYXQuc2VhcmNoU3VnZ2VzdGlvbnNDb250YWluZXIuaGlkZSgpO1xuICAgIH0pXG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgdGhpcy5zZWFyY2hTdWdnZXN0aW9ucy5lbXB0eSgpO1xuICAgIGlmICh0aGlzLmRhdGEpIHtcbiAgICAgIHRoaXMuc2VhcmNoU3VnZ2VzdGlvbnMuYXBwZW5kKFxuICAgICAgICB0aGlzLmRhdGEuc2xpY2UoMCwxMCkubWFwKChpdGVtKT0+YFxuICAgICAgICA8bGk+XG4gICAgICAgICAgPGRpdiBjbGFzcz0nc3VnZ2VzdGlvbicgbG9uPVwiJHtpdGVtLmxvbn1cIiBsYXQ9XCIke2l0ZW0ubGF0fVwiPlxuICAgICAgICAgICAgPGEgaHJlZj0nI2xvbj0ke2l0ZW0ubG9ufSZsYXQ9JHtpdGVtLmxhdH0nPiR7aXRlbS5kaXNwbGF5X25hbWV9PC9hPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2xpPmApXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG59XG4iLCJjbGFzcyBTdG9yaWVzTGlzdE1hbmFnZXIge1xuICBjb25zdHJ1Y3RvcihnZW9qc29uLCBzdGF0dXNEYXRhLCBjb250YWN0LCBzdG9yaWVzKSB7XG4gICAgdGhpcy5nZW9qc29uID0gZ2VvanNvbjtcbiAgICB0aGlzLnN0YXR1c0RhdGEgPSBzdGF0dXNEYXRhO1xuICAgIHRoaXMuY29udGFjdCA9IGNvbnRhY3Q7XG4gICAgdGhpcy5zdG9yaWVzID0gc3RvcmllcztcblxuICAgIHRoaXMuc3Rvcmllc0xpc3QgPSAkKFwiI3N0b3JpZXNcIik7XG4gIH1cblxuICBsaXN0TmVhcmJ5U3RvcmllcyhsYXRMbmcpIHtcbiAgICBcbiAgfVxufVxuIiwiXG5jbGFzcyBBcHAge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgdGhpcy5NYXAgPSBudWxsO1xuICAgIHRoaXMucmVuZGVyKCk7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgLy9Mb2FkaW5nIGRhdGEuLi5cbiAgICB2YXIgbWFwRmV0Y2ggPSAkLmdldEpTT04oJy9kYXRhL255cy1zZW5hdGVtYXAuanNvbicpO1xuICAgIHZhciBzZW5hdG9yU3RhdHVzRmV0Y2ggPSAkLmdldEpTT04oJy9kYXRhL3N0YXR1cy5qc29uJyk7XG4gICAgdmFyIHN0YXRlU2VuYXRvcnNJbmZvID0gJC5nZXRKU09OKCcvZGF0YS9zdGF0ZS1zZW5hdG9ycy5qc29uJyk7XG4gICAgdmFyIHN0b3JpZXNJbmZvID0gJC5nZXRKU09OKCcvZGF0YS9zdG9yaWVzLmpzb24nKTtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgJC53aGVuKG1hcEZldGNoLCBzZW5hdG9yU3RhdHVzRmV0Y2gsIHN0YXRlU2VuYXRvcnNJbmZvLCBzdG9yaWVzSW5mbykudGhlbihcbiAgICAgIChnZW9qc29uLCBzdGF0dXNEYXRhLCBjb250YWN0LCBzdG9yaWVzKT0+e1xuICAgICAgdGhhdC5NYXAgPSBuZXcgTWFwTWFuYWdlcihnZW9qc29uWzBdLCBzdGF0dXNEYXRhWzBdLCBjb250YWN0WzBdLCBzdG9yaWVzWzBdKTtcbiAgICAgIHRoYXQuU3RvcnlMaXN0ID0gbmV3IFN0b3JpZXNMaXN0TWFuYWdlcihnZW9qc29uWzBdLCBzdGF0dXNEYXRhWzBdLCBjb250YWN0WzBdLCBzdG9yaWVzWzBdKTtcbiAgICAgIHRoYXQuU2VhcmNoID0gbmV3IFNlYXJjaE1hbmFnZXIoKTtcbiAgICAgIHRoYXQuUmVwID0gbmV3IFJlcHJlc2VudGF0aXZlTWFuYWdlcih0aGF0Lk1hcCwgc3RhdHVzRGF0YVswXSwgY29udGFjdFswXSk7XG4gICAgICB0aGF0Ll9saXN0ZW5Ub1dpbmRvdygpO1xuICAgIH0pO1xuICB9XG5cbiAgX2xpc3RlblRvV2luZG93KCkge1xuXG4gICAgJCh3aW5kb3cpLm9uKCdoYXNoY2hhbmdlJywgKCk9PntcbiAgICAgIGlmICh3aW5kb3cubG9jYXRpb24uaGFzaCAmJiB3aW5kb3cubG9jYXRpb24uaGFzaC5sZW5ndGggPiAwKVxuICAgICAge1xuICAgICAgICBjb25zdCBoYXNoID0gJC5kZXBhcmFtKHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cmluZygxKSk7XG5cbiAgICAgICAgY29uc3QgbGF0TG5nID0gbmV3IEwubGF0TG5nKGhhc2gubGF0LCBoYXNoLmxvbik7XG4gICAgICAgIC8vIFRyaWdnZXIgdmFyaW91cyBtYW5hZ2Vyc1xuICAgICAgICB0aGlzLlN0b3J5TGlzdC5saXN0TmVhcmJ5U3RvcmllcyhsYXRMbmcpO1xuICAgICAgICB0aGlzLlJlcC5zaG93UmVwcmVzZW50YXRpdmUobGF0TG5nKTtcbiAgICAgICAgdGhpcy5NYXAuZm9jdXNPbkRpc3RyaWN0KGxhdExuZylcbiAgICAgIH1cbiAgICB9KTtcbiAgICAkKHdpbmRvdykudHJpZ2dlcihcImhhc2hjaGFuZ2VcIik7XG4gIH1cbn1cblxud2luZG93LkFwcE1hbmFnZXIgPSBuZXcgQXBwKHt9KTtcbiJdfQ==
