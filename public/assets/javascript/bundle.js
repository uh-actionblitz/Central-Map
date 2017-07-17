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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvbWFwLmpzIiwiY2xhc3Nlcy9yZXByZXNlbnRhdGl2ZS5qcyIsImNsYXNzZXMvc2VhcmNoLmpzIiwiY2xhc3Nlcy9zdG9yaWVzbGlzdC5qcyIsImFwcC5qcyJdLCJuYW1lcyI6WyJNYXBNYW5hZ2VyIiwiZ2VvanNvbiIsInN0YXR1c0RhdGEiLCJjb250YWN0IiwibWFwIiwiTCIsInNldFZpZXciLCJ0aWxlTGF5ZXIiLCJtYXhab29tIiwiYXR0cmlidXRpb24iLCJhZGRUbyIsInJlbmRlciIsImV2ZW50IiwicG9wdXAiLCJzZW5hdG9yIiwidGFyZ2V0Iiwib3B0aW9ucyIsIm1vcmVJbmZvIiwiY29udGVudCIsImltYWdlIiwibmFtZSIsInBhcnR5IiwiZGlzdHJpY3QiLCJzdGF0dXMiLCJjbG9zZUJ1dHRvbiIsImNsYXNzTmFtZSIsInNldENvbnRlbnQiLCJiaW5kUG9wdXAiLCJvcGVuUG9wdXAiLCJmZWF0dXJlIiwibGF5ZXIiLCJ0aGF0IiwicHJvcGVydGllcyIsIk5BTUUiLCJjaXJjbGVNYXJrZXIiLCJnZXRCb3VuZHMiLCJnZXRDZW50ZXIiLCJyYWRpdXMiLCJmaWxsQ29sb3IiLCJfY29sb3JEaXN0cmljdCIsImNvbG9yIiwib3BhY2l0eSIsImZpbGxPcGFjaXR5Iiwib24iLCJjbGljayIsIl9yZW5kZXJCdWJibGUiLCJiaW5kIiwiZSIsImNvbnNvbGUiLCJsb2ciLCJ3aW5kb3ciLCJsb2NhdGlvbiIsImhhc2giLCJsYXRsbmciLCJsYXQiLCJsbmciLCJfbGVhZmxldF9pZCIsImlkIiwid2VpZ2h0Iiwic2V0U3R5bGUiLCJfbGF5ZXJTdHlsZSIsImRpc3RyaWN0cyIsImdlb0pTT04iLCJzdHlsZSIsIm9uRWFjaEZlYXR1cmUiLCJfb25FYWNoRmVhdHVyZSIsImJyaW5nVG9CYWNrIiwibGF5ZXJzIiwibGF0TG5nIiwibGVhZmxldFBpcCIsInBvaW50SW5MYXllciIsImZpdEJvdW5kcyIsImVhY2hMYXllciIsIl9yZXNldExheWVyU3R5bGUiLCJfY2hvc2VuU3R5bGUiLCJSZXByZXNlbnRhdGl2ZU1hbmFnZXIiLCJyZXByZXNlbnRhdGl2ZUNvbnRhaW5lciIsIiQiLCJhZGRFdmVudHMiLCJlbXB0eSIsInBhcnRpZXMiLCJwYXJ0eUxpc3QiLCJzcGxpdCIsInRvU3RyaW5nIiwiaSIsImpvaW4iLCJyZXBUb1JlbmRlciIsInBob25lIiwiZGlzdHJpY3ROdW1iZXIiLCJwYXJzZUludCIsImZpbHRlciIsImNvbnRhY3RPZlJlcCIsImh0bWwiLCJyZW5kZXJQYXJ0aWVzIiwicmVuZGVyVGhhbmtzIiwicmVuZGVyVXJnZSIsIlNlYXJjaE1hbmFnZXIiLCJhZGRyZXNzRm9ybSIsInNlYXJjaFN1Z2dlc3Rpb25zQ29udGFpbmVyIiwic2VhcmNoU3VnZ2VzdGlvbnMiLCJjaG9zZW5Mb2NhdGlvbiIsInRpbWVvdXQiLCJoaWRlIiwiX3N0YXJ0TGlzdGVuZXIiLCJldiIsImFkZHJlc3MiLCJ2YWx1ZSIsImNsZWFyVGltZW91dCIsInNldFRpbWVvdXQiLCJnZXRKU09OIiwiZW5jb2RlVVJJQ29tcG9uZW50IiwiZGF0YSIsInNob3ciLCJhcHBlbmQiLCJzbGljZSIsIml0ZW0iLCJsb24iLCJkaXNwbGF5X25hbWUiLCJTdG9yaWVzTGlzdE1hbmFnZXIiLCJzdG9yaWVzIiwic3Rvcmllc0xpc3QiLCJBcHAiLCJNYXAiLCJtYXBGZXRjaCIsInNlbmF0b3JTdGF0dXNGZXRjaCIsInN0YXRlU2VuYXRvcnNJbmZvIiwic3Rvcmllc0luZm8iLCJ3aGVuIiwidGhlbiIsIlN0b3J5TGlzdCIsIlNlYXJjaCIsIlJlcCIsIl9saXN0ZW5Ub1dpbmRvdyIsImxlbmd0aCIsImRlcGFyYW0iLCJzdWJzdHJpbmciLCJsaXN0TmVhcmJ5U3RvcmllcyIsInNob3dSZXByZXNlbnRhdGl2ZSIsImZvY3VzT25EaXN0cmljdCIsInRyaWdnZXIiLCJBcHBNYW5hZ2VyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7SUFBTUE7QUFDSixzQkFBWUMsT0FBWixFQUFxQkMsVUFBckIsRUFBaUNDLE9BQWpD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QyxJQUFoQixJQUF3QkYsT0FBT0MsUUFBUCxDQUFnQkMsSUFBaEIsQ0FBcUJpRixNQUFyQixHQUE4QixDQUExRCxFQUNBO0FBQ0UsY0FBTWpGLE9BQU95QixFQUFFeUQsT0FBRixDQUFVcEYsT0FBT0MsUUFBUCxDQUFnQkMsSUFBaEIsQ0FBcUJtRixTQUFyQixDQUErQixDQUEvQixDQUFWLENBQWI7O0FBRUEsY0FBTW5FLFNBQVMsSUFBSS9ELEVBQUUrRCxNQUFOLENBQWFoQixLQUFLRSxHQUFsQixFQUF1QkYsS0FBS2dFLEdBQTVCLENBQWY7QUFDQTtBQUNBLGdCQUFLYSxTQUFMLENBQWVPLGlCQUFmLENBQWlDcEUsTUFBakM7QUFDQSxnQkFBSytELEdBQUwsQ0FBU00sa0JBQVQsQ0FBNEJyRSxNQUE1QjtBQUNBLGdCQUFLc0QsR0FBTCxDQUFTZ0IsZUFBVCxDQUF5QnRFLE1BQXpCO0FBQ0Q7QUFDRixPQVhEO0FBWUFTLFFBQUUzQixNQUFGLEVBQVV5RixPQUFWLENBQWtCLFlBQWxCO0FBQ0Q7Ozs7OztBQUdIekYsT0FBTzBGLFVBQVAsR0FBb0IsSUFBSW5CLEdBQUosQ0FBUSxFQUFSLENBQXBCIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIE1hcE1hbmFnZXIge1xuICBjb25zdHJ1Y3RvcihnZW9qc29uLCBzdGF0dXNEYXRhLCBjb250YWN0KSB7XG5cbiAgICAvL0luaXRpYWxpemluZyBNYXBcbiAgICB0aGlzLm1hcCA9IG5ldyBMLm1hcCgnbWFwJykuc2V0VmlldyhbNDIuODYzLC03NC43NTJdLCA2LjU1KTtcbiAgICBMLnRpbGVMYXllcignaHR0cHM6Ly9jYXJ0b2RiLWJhc2VtYXBzLXtzfS5nbG9iYWwuc3NsLmZhc3RseS5uZXQvbGlnaHRfYWxsL3t6fS97eH0ve3l9LnBuZycsIHtcbiAgICAgIG1heFpvb206IDE4LFxuICAgICAgYXR0cmlidXRpb246ICcmY29weTsgPGEgaHJlZj1cImh0dHA6Ly93d3cub3BlbnN0cmVldG1hcC5vcmcvY29weXJpZ2h0XCI+T3BlblN0cmVldE1hcDwvYT4sICZjb3B5OzxhIGhyZWY9XCJodHRwczovL2NhcnRvLmNvbS9hdHRyaWJ1dGlvblwiPkNBUlRPPC9hPi4gSW50ZXJhY3Rpdml0eSBieSA8YSBocmVmPVwiLy9hY3Rpb25ibGl0ei5vcmdcIj5BY3Rpb25CbGl0ejwvYT4nXG4gICAgfSkuYWRkVG8odGhpcy5tYXApO1xuXG5cbiAgICB0aGlzLnN0YXR1c0RhdGEgPSBzdGF0dXNEYXRhO1xuICAgIHRoaXMuZ2VvanNvbiA9IGdlb2pzb247XG4gICAgdGhpcy5jb250YWN0ID0gY29udGFjdDtcblxuICAgIHRoaXMucmVuZGVyKCk7XG4gIH1cblxuICAvKioqXG4gICogcHJpdmF0ZSBtZXRob2QgX3JlbmRlckJ1YmJsZVxuICAqXG4gICovXG4gIF9yZW5kZXJCdWJibGUoZXZlbnQpIHtcblxuICAgIHZhciBwb3B1cDtcbiAgICB2YXIgc2VuYXRvciA9IGV2ZW50LnRhcmdldC5vcHRpb25zLnN0YXR1c0RhdGE7XG4gICAgdmFyIG1vcmVJbmZvID0gZXZlbnQudGFyZ2V0Lm9wdGlvbnMuY29udGFjdDtcblxuICAgIHZhciBjb250ZW50ID0gKFxuICAgICAgYDxkaXY+XG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInNlbmF0b3ItaW1hZ2UtY29udGFpbmVyXCI+XG4gICAgICAgICAgPGltZyBzcmM9XCIke3NlbmF0b3IuaW1hZ2V9XCIgLz5cbiAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJzZW5hdG9yLWluZm9cIj5cbiAgICAgICAgICA8ZGl2PiR7c2VuYXRvci5uYW1lfTwvZGl2PlxuICAgICAgICAgIDxkaXY+UGFydHk6ICR7bW9yZUluZm8ucGFydHl9PC9kaXY+XG4gICAgICAgICAgPGRpdj5TZW5hdGUgRGlzdHJpY3QgJHtzZW5hdG9yLmRpc3RyaWN0fTwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCIkeyhzZW5hdG9yLnN0YXR1cyA9PT0gJ0ZPUicpID8gJ3ZvdGVzLXllcycgOiAndm90ZXMtbm8nfVwiPlxuICAgICAgICAgICAgICAke3NlbmF0b3Iuc3RhdHVzID09PSAnVEFSR0VUJyA/ICdIaWdoIHByaW9yaXR5JyA6IChzZW5hdG9yLnN0YXR1cyA9PT0gJ0ZPUicpID8gJ0NvLVNwb25zb3InIDogJ05vIHN1cHBvcnQnfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L3NlY3Rpb24+XG4gICAgICAgIDxhIGhyZWY9XCIke21vcmVJbmZvLmNvbnRhY3R9XCIgY2xhc3M9XCJjb250YWN0LWxpbmtcIiB0YXJnZXQ9XCJfYmxhbmtcIj5Db250YWN0PC9idXR0b24+XG4gICAgICA8L2Rpdj5gKTtcblxuICAgIHBvcHVwID0gTC5wb3B1cCh7XG4gICAgICBjbG9zZUJ1dHRvbjogdHJ1ZSxcbiAgICAgIGNsYXNzTmFtZTogJ3NlbmF0b3ItcG9wdXAnLFxuICAgICB9KTtcblxuICAgIHBvcHVwLnNldENvbnRlbnQoY29udGVudCk7XG4gICAgZXZlbnQudGFyZ2V0LmJpbmRQb3B1cChwb3B1cCkub3BlblBvcHVwKCk7XG4gIH1cblxuICBfb25FYWNoRmVhdHVyZShmZWF0dXJlLCBsYXllcikge1xuICAgICAgLy9cbiAgICAgIC8vIGNvbnNvbGUubG9nKHNlbmF0b3JzW2ZlYXR1cmUucHJvcGVydGllcy5OQU1FIC0gMV0uc3RhdHVzKVxuICAgICAgY29uc3QgdGhhdCA9IHRoaXM7XG5cbiAgICAgIHZhciBzdGF0dXMgPSB0aGlzLnN0YXR1c0RhdGFbZmVhdHVyZS5wcm9wZXJ0aWVzLk5BTUUgLSAxXS5zdGF0dXM7XG5cbiAgICAgIC8vIENyZWF0ZSBDaXJjbGUgTWFya2VyXG4gICAgICBMLmNpcmNsZU1hcmtlcihsYXllci5nZXRCb3VuZHMoKS5nZXRDZW50ZXIoKSwge1xuICAgICAgICByYWRpdXM6IDcsXG4gICAgICAgIGZpbGxDb2xvcjogdGhpcy5fY29sb3JEaXN0cmljdChmZWF0dXJlKSxcbiAgICAgICAgY29sb3I6ICd3aGl0ZScsXG4gICAgICAgIG9wYWNpdHk6IDEsXG4gICAgICAgIGZpbGxPcGFjaXR5OiAwLjcsXG5cbiAgICAgICAgLy9EYXRhXG4gICAgICAgIHN0YXR1c0RhdGE6IHRoaXMuc3RhdHVzRGF0YVtmZWF0dXJlLnByb3BlcnRpZXMuTkFNRSAtIDFdLFxuICAgICAgICBjb250YWN0OiB0aGlzLmNvbnRhY3RbZmVhdHVyZS5wcm9wZXJ0aWVzLk5BTUUgLSAxXSxcbiAgICAgIH0pXG4gICAgICAub24oe1xuICAgICAgICBjbGljazogdGhpcy5fcmVuZGVyQnViYmxlLmJpbmQodGhpcyksXG4gICAgICB9KS5hZGRUbyh0aGlzLm1hcCk7XG5cblxuICAgICAgbGF5ZXIub24oe1xuICAgICAgICBjbGljazogKGUpPT57XG4gICAgICAgICAgY29uc29sZS5sb2coXCJDTElDS0VEIDo6OiBcIiwgZSk7XG4gICAgICAgICAgLy8gdGhpcy5tYXAuZml0Qm91bmRzKGxheWVyLmdldEJvdW5kcygpKTtcbiAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9IGAjbGF0PSR7ZS5sYXRsbmcubGF0fSZsb249JHtlLmxhdGxuZy5sbmd9YFxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICBsYXllci5fbGVhZmxldF9pZCA9IGZlYXR1cmUuaWRcbiAgICAgIC8vIGxheWVyLm9uKHtcbiAgICAgICAgLy8gbW91c2VvdmVyOiBoYW5kbGVNb3VzZU92ZXIsXG4gICAgICAgIC8vIG1vdXNlb3V0OiBoYW5kbGVNb3VzZU91dFxuICAgICAgLy8gfSk7XG4gICAgfVxuXG4gIF9sYXllclN0eWxlKCkge1xuICAgIHJldHVybiB7XG4gICAgICBmaWxsQ29sb3I6ICdncmF5JyxcbiAgICAgIGZpbGxPcGFjaXR5OiAwLjAxLFxuICAgICAgY29sb3I6ICdncmF5JyxcbiAgICAgIG9wYWNpdHk6ICcxJyxcbiAgICAgIHdlaWdodDogMVxuICAgIH07XG4gIH1cbiAgX2Nob3NlblN0eWxlKCkge1xuICAgIHJldHVybiB7XG4gICAgICBmaWxsQ29sb3I6ICdncmVlbicsXG4gICAgICBmaWxsT3BhY2l0eTogMC41XG4gICAgfVxuICB9XG5cbiAgX3Jlc2V0TGF5ZXJTdHlsZShsYXllcikge1xuICAgIGxheWVyLnNldFN0eWxlKHRoaXMuX2xheWVyU3R5bGUoKSk7XG4gIH1cblxuICBfY29sb3JEaXN0cmljdChkaXN0cmljdCkge1xuICAgIHZhciBzdGF0dXMgPSB0aGlzLnN0YXR1c0RhdGFbZGlzdHJpY3QucHJvcGVydGllcy5OQU1FIC0gMV0uc3RhdHVzO1xuXG4gICAgc3dpdGNoKHN0YXR1cykge1xuICAgICAgY2FzZSAnRk9SJzpcbiAgICAgICAgcmV0dXJuICcjMWU5MGZmJztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdBR0FJTlNUJzpcbiAgICAgICAgcmV0dXJuICcjRkY0QzUwJztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdUQVJHRVQnOlxuICAgICAgICByZXR1cm4gJyNDQzAwMDQnO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgLy9DYWxsIGdlb2pzb25cbiAgICB0aGlzLmRpc3RyaWN0cyA9IEwuZ2VvSlNPTih0aGlzLmdlb2pzb24sIHtcbiAgICAgIHN0eWxlOiB0aGlzLl9sYXllclN0eWxlLmJpbmQodGhpcyksXG4gICAgICBvbkVhY2hGZWF0dXJlOiB0aGlzLl9vbkVhY2hGZWF0dXJlLmJpbmQodGhpcylcbiAgICB9KVxuICAgIHRoaXMuZGlzdHJpY3RzLmFkZFRvKHRoaXMubWFwKTtcbiAgICB0aGlzLmRpc3RyaWN0cy5icmluZ1RvQmFjaygpO1xuXG4gICAgY29uc29sZS5sb2codGhpcy5sYXllcnMpO1xuICB9XG5cbiAgLy9GaXRCb3VuZHMgb24gdGhlIGRpc3RyaWN0XG4gIGZvY3VzT25EaXN0cmljdChsYXRMbmcpIHtcbiAgICBjb25zdCB0YXJnZXQgPSBsZWFmbGV0UGlwLnBvaW50SW5MYXllcihsYXRMbmcsIHRoaXMuZGlzdHJpY3RzLCB0cnVlKVswXTtcblxuICAgIGlmICh0YXJnZXQpIHtcbiAgICAgIHRoaXMubWFwLmZpdEJvdW5kcyh0YXJnZXQuZ2V0Qm91bmRzKCkpO1xuICAgICAgdGhpcy5kaXN0cmljdHMuZWFjaExheWVyKHRoaXMuX3Jlc2V0TGF5ZXJTdHlsZS5iaW5kKHRoaXMpKTtcbiAgICAgIHRhcmdldC5zZXRTdHlsZSh0aGlzLl9jaG9zZW5TdHlsZSgpKVxuICAgICAgLy9SZWZyZXNoIHdob2xlIG1hcFxuICAgIH1cblxuXG5cbiAgfVxufVxuIiwiLyoqXG4gKiBSZXByZXNlbnRhdGl2ZU1hbmFnZXJcbiAqIEZhY2lsaXRhdGVzIHRoZSByZXRyaWV2YWwgb2YgdGhlIHVzZXIncyBSZXByZXNlbnRhdGl2ZSBiYXNlZCBvbiB0aGVpciBBZGRyZXNzXG4gKiovXG5jbGFzcyBSZXByZXNlbnRhdGl2ZU1hbmFnZXIge1xuXG4gIGNvbnN0cnVjdG9yKG1hcCwgc3RhdHVzLCBjb250YWN0KSB7XG4gICAgdGhpcy5tYXAgPSBtYXA7XG4gICAgdGhpcy5zdGF0dXMgPSBzdGF0dXM7XG4gICAgdGhpcy5jb250YWN0ID0gY29udGFjdDtcblxuICAgIHRoaXMucmVwcmVzZW50YXRpdmVDb250YWluZXIgPSAkKFwiI3NlbmF0b3ItaW5mb1wiKTtcblxuICAgIC8vY3JlYXRlIGxpc3RlbmVyc1xuICAgIHRoaXMuYWRkRXZlbnRzKCk7XG4gIH1cblxuICBhZGRFdmVudHMoKSB7XG4gICAgLy9DbG9zZVxuICAgIHRoaXMucmVwcmVzZW50YXRpdmVDb250YWluZXIub24oJ2NsaWNrJywgXCJhLmNsb3NlXCIsICgpID0+IHRoaXMucmVwcmVzZW50YXRpdmVDb250YWluZXIuZW1wdHkoKSk7XG4gIH1cblxuICBzaG93UmVwcmVzZW50YXRpdmUobGF0TG5nKSB7XG4gICAgdGhpcy50YXJnZXQgPSBsZWFmbGV0UGlwLnBvaW50SW5MYXllcihsYXRMbmcsIHRoaXMubWFwLmRpc3RyaWN0cywgdHJ1ZSlbMF07XG4gICAgY29uc29sZS5sb2coXCJSZXByZXNlbnRhdGl2ZU1hbmFnZXJcIiwgdGhpcy50YXJnZXQpO1xuXG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgfVxuXG4gIHJlbmRlclBhcnRpZXMocGFydGllcykge1xuICAgIGNvbnN0IHBhcnR5TGlzdCA9IHBhcnRpZXMuc3BsaXQoJywnKTtcbiAgICBjb25zdCB0b1N0cmluZyA9IHBhcnR5TGlzdC5tYXAoaT0+YDxsaSBjbGFzcz0ncGFydHkgJHtpfSc+PHNwYW4+JHtpfTwvc3Bhbj48L2xpPmApLmpvaW4oJycpO1xuICAgIHJldHVybiBgPHVsIGNsYXNzPSdwYXJ0aWVzJz4ke3RvU3RyaW5nfTwvdWw+YDtcbiAgfVxuXG4gIHJlbmRlclRoYW5rcyhyZXBUb1JlbmRlcikge1xuICAgIHJldHVybiBgXG4gICAgICA8ZGl2PlxuICAgICAgICA8cCBjbGFzcz0nc3RhdHVzJz5cbiAgICAgICAgICAke3JlcFRvUmVuZGVyLnN0YXR1cyA9PT0gXCJGT1JcIiA/IGBTZW4uICR7cmVwVG9SZW5kZXIubmFtZX0gaXMgPHN0cm9uZz5zdXBwb3J0aXZlPC9zdHJvbmc+IG9mIHRoZSBOZXcgWW9yayBIZWFsdGggQWN0IChTNDg0MCkuIENhbGwgdGhlIHNlbmF0b3IgdG8gdGhhbmsgdGhlbSFgXG4gICAgICAgICAgICA6IGBTZW4uICR7cmVwVG9SZW5kZXIubmFtZX0gaXMgbm90IHlldCBzdXBwb3J0aXZlIG9mIHRoZSBOZXcgWW9yayBIZWFsdGggQWN0ICAoUzQ4NDApLiBDYWxsIHRoZW0gdG8gZW5jb3VyYWdlIGFuZCB1cmdlIHRoZW0gdG8gZ2l2ZSB0aGVpciBzdXBwb3J0IHRvIHRoaXMgaW1wb3J0YW50IGJpbGwuYH1cbiAgICAgICAgPC9wPlxuICAgICAgICA8aDQ+SGVyZSdzIEhvdzwvaDQ+XG4gICAgICAgIDxoNT4xLiBDYWxsIHRoZSBzZW5hdG9yIGF0IDxpIGNsYXNzPVwiZmEgZmEtcGhvbmVcIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L2k+ICR7cmVwVG9SZW5kZXIucGhvbmV9PC9oNT5cbiAgICAgICAgPGg1PjIuIFRoYW5rIHRoZW0gdGhyb3VnaCB0aGVpciBzdGFmZiE8L2g1PlxuICAgICAgICA8cD5UaGUgc3RhZmZlciB3aWxsIG1ha2Ugc3VyZSB0aGF0IHlvdXIgbWVzc2FnZSBpcyBzZW50IHRvIHRoZSBzZW5hdG9yLjwvcD5cbiAgICAgICAgPHN1Yj5TYW1wbGUgTWVzc2FnZTwvc3ViPlxuICAgICAgICA8YmxvY2txdW90ZT5cbiAgICAgICAgICBIaSEgTXkgbmFtZSBpcyBfX19fX18uIEkgYW0gYSBjb25zdGl0dWVudCBvZiBTZW4uICR7cmVwVG9SZW5kZXIubmFtZX0gYXQgemlwY29kZSBfX19fXy4gSSBhbSBzZW5kaW5nIG15IHRoYW5rcyB0byB0aGUgc2VuYXRvciBmb3Igc3VwcG9ydGluZyBhbmQgY28tc3BvbnNvcmluZyB0aGUgTmV3IFlvcmsgSGVhbHRoIEFjdCAoUzQ4NDApLlxuICAgICAgICAgIEhlYWx0aCBjYXJlIGlzIGEgdmVyeSBpbXBvcnRhbnQgaXNzdWUgZm9yIG1lLCBhbmQgdGhlIHNlbmF0b3IncyBzdXBwb3J0IG1lYW5zIGEgbG90LiBUaGFuayB5b3UhXG4gICAgICAgIDwvYmxvY2txdW90ZT5cbiAgICAgICAgPGg1PjMuIFRlbGwgeW91ciBmcmllbmRzIHRvIGNhbGwhPC9oNT5cbiAgICAgICAgPHA+U2hhcmUgdGhpcyBwYWdlIHdpdGggeW91ciBmcmllbmRzIGFuZCB1cmdlIHRoZW0gdG8gY2FsbCB5b3VyIHNlbmF0b3IhPC9wPlxuICAgICAgPC9kaXY+XG4gICAgYFxuICB9XG5cbiAgcmVuZGVyVXJnZShyZXBUb1JlbmRlcikge1xuICAgIHJldHVybiBgXG4gICAgPGRpdj5cbiAgICAgIDxwIGNsYXNzPSdzdGF0dXMnPlxuICAgICAgICAke3JlcFRvUmVuZGVyLnN0YXR1cyA9PT0gXCJGT1JcIiA/IGBTZW4uICR7cmVwVG9SZW5kZXIubmFtZX0gaXMgPHN0cm9uZz5zdXBwb3J0aXZlPC9zdHJvbmc+IG9mIHRoZSBOZXcgWW9yayBIZWFsdGggQWN0IChTNDg0MCkuIENhbGwgdGhlIHNlbmF0b3IgdG8gdGhhbmsgdGhlbSFgXG4gICAgICAgICAgOiBgU2VuLiAke3JlcFRvUmVuZGVyLm5hbWV9IGlzIDxzdHJvbmcgY2xhc3M9J25vdCc+bm90IHlldCBzdXBwb3J0aXZlPC9zdHJvbmc+IG9mIHRoZSBOZXcgWW9yayBIZWFsdGggQWN0ICAoUzQ4NDApLiBDYWxsIHRoZW0gdG8gZW5jb3VyYWdlIGFuZCB1cmdlIHRoZW0gdG8gZ2l2ZSB0aGVpciBzdXBwb3J0IHRvIHRoaXMgaW1wb3J0YW50IGJpbGwuYH1cbiAgICAgIDwvcD5cbiAgICAgIDxoND5IZXJlJ3MgSG93PC9oND5cbiAgICAgIDxoNT4xLiBDYWxsIHRoZSBzZW5hdG9yIGF0IDxpIGNsYXNzPVwiZmEgZmEtcGhvbmVcIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L2k+ICR7cmVwVG9SZW5kZXIucGhvbmV9PC9oNT5cbiAgICAgIDxoNT4yLiBUYWxrIHRvIHRoZW0gYWJvdXQgeW91ciBzdXBwb3J0ITwvaDU+XG4gICAgICA8cD5Zb3Ugd2lsbCBtb3N0IGxpa2VseSB0YWxrIHdpdGggYSBzdGFmZmVyLiBUZWxsIHRoZW0gYWJvdXQgeW91ciBzdG9yeS4gVGhlIHN0YWZmZXIgd2lsbCBtYWtlIHN1cmUgdGhhdCB5b3VyIG1lc3NhZ2UgaXMgc2VudCB0byB0aGUgc2VuYXRvci48L3A+XG4gICAgICA8c3ViPlNhbXBsZSBNZXNzYWdlPC9zdWI+XG4gICAgICA8YmxvY2txdW90ZT5cbiAgICAgICAgSGkhIE15IG5hbWUgaXMgX19fX19fLiBJIGFtIGEgY29uc3RpdHVlbnQgb2YgU2VuLiAke3JlcFRvUmVuZGVyLm5hbWV9IGF0IHppcGNvZGUgX19fX18uXG4gICAgICAgIEkgYW0gc3Ryb25nbHkgdXJnaW5nIHRoZSBzZW5hdG9yIHRvIHN1cHBvcnQgYW5kIGNvLXNwb25zb3IgdGhlIE5ldyBZb3JrIEhlYWx0aCBBY3QgKFM0ODQwKS5cbiAgICAgICAgSGVhbHRoIGNhcmUgaXMgYSB2ZXJ5IGltcG9ydGFudCBpc3N1ZSBmb3IgbWUsIGFuZCB0aGUgc2VuYXRvcidzIHN1cHBvcnQgbWVhbnMgYSBsb3QuIFRoYW5rIHlvdSFcbiAgICAgIDwvYmxvY2txdW90ZT5cbiAgICAgIDxoNT4zLiBUZWxsIHlvdXIgZnJpZW5kcyB0byBjYWxsITwvaDU+XG4gICAgICA8cD5TaGFyZSB0aGlzIHBhZ2Ugd2l0aCB5b3VyIGZyaWVuZHMgYW5kIHVyZ2UgdGhlbSB0byBjYWxsIHlvdXIgc2VuYXRvciE8L3A+XG4gICAgPC9kaXY+XG4gICAgYFxuICB9XG4gIHJlbmRlcigpIHtcbiAgICBpZiAoIXRoaXMudGFyZ2V0KSByZXR1cm4gbnVsbDtcblxuICAgIGNvbnN0IGRpc3RyaWN0TnVtYmVyID0gcGFyc2VJbnQodGhpcy50YXJnZXQuZmVhdHVyZS5wcm9wZXJ0aWVzLk5BTUUpO1xuICAgIGNvbnN0IHJlcFRvUmVuZGVyID0gdGhpcy5zdGF0dXMuZmlsdGVyKGk9PmkuZGlzdHJpY3QgPT0gZGlzdHJpY3ROdW1iZXIpWzBdO1xuICAgIGNvbnN0IGNvbnRhY3RPZlJlcCA9IHRoaXMuY29udGFjdC5maWx0ZXIoaT0+aS5kaXN0cmljdCA9PSBkaXN0cmljdE51bWJlcilbMF07XG5cbiAgICBjb25zb2xlLmxvZyhyZXBUb1JlbmRlciwgY29udGFjdE9mUmVwKTtcbiAgICB0aGlzLnJlcHJlc2VudGF0aXZlQ29udGFpbmVyLmh0bWwoXG4gICAgICBgPGRpdj5cbiAgICAgICAgPGEgaHJlZj1cImphdmFzY3JpcHQ6IHZvaWQobnVsbClcIiBjbGFzcz0nY2xvc2UnPjxpIGNsYXNzPVwiZmEgZmEtdGltZXMtY2lyY2xlLW9cIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L2k+PC9hPlxuICAgICAgICA8aDUgY2xhc3M9J3lvdXItc2VuYXRvcic+WW91ciBTdGF0ZSBTZW5hdG9yPC9oNT5cbiAgICAgICAgPGRpdiBjbGFzcz0nYmFzaWMtaW5mbyc+XG4gICAgICAgICAgPGltZyBzcmM9JyR7Y29udGFjdE9mUmVwLmltYWdlfScgY2xhc3M9J3JlcC1waWMnIC8+XG4gICAgICAgICAgPGg1Pk5ZIERpc3RyaWN0ICR7cmVwVG9SZW5kZXIuZGlzdHJpY3R9PC9oNT5cbiAgICAgICAgICA8aDM+JHtyZXBUb1JlbmRlci5uYW1lfTwvaDM+XG4gICAgICAgICAgPHA+JHt0aGlzLnJlbmRlclBhcnRpZXMoY29udGFjdE9mUmVwLnBhcnR5KX08L3A+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPSdhY3Rpb24tYXJlYSc+XG4gICAgICAgICAgJHtyZXBUb1JlbmRlci5zdGF0dXMgPT09IFwiRk9SXCIgPyB0aGlzLnJlbmRlclRoYW5rcyhyZXBUb1JlbmRlcikgOiB0aGlzLnJlbmRlclVyZ2UocmVwVG9SZW5kZXIpIH1cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9J3dlYnNpdGUnPlxuICAgICAgICAgIDxhIGhyZWY9JyR7cmVwVG9SZW5kZXIuY29udGFjdH0nIHRhcmdldD0nX2JsYW5rJz5Nb3JlIHdheXMgdG8gY29udGFjdCA8c3Ryb25nPlNlbi4gJHtyZXBUb1JlbmRlci5uYW1lfTwvc3Ryb25nPjwvYT5cbiAgICAgICAgPGRpdj5cbiAgICAgICA8L2Rpdj5gXG4gICAgKTtcbiAgfVxuXG59XG4iLCIvKipcbiogRmFjaWxpdGF0ZXMgdGhlIHNlYXJjaFxuKi9cblxuY2xhc3MgU2VhcmNoTWFuYWdlciB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy50YXJnZXQgPSAkKFwiI2Zvcm0tYXJlYVwiKTtcbiAgICB0aGlzLmFkZHJlc3NGb3JtID0gJChcIiNmb3JtLWFyZWEgI2FkZHJlc3NcIik7XG5cbiAgICB0aGlzLnNlYXJjaFN1Z2dlc3Rpb25zQ29udGFpbmVyID0gJChcIiNzZWFyY2gtcmVzdWx0c1wiKTtcbiAgICB0aGlzLnNlYXJjaFN1Z2dlc3Rpb25zID0gJChcIiNzZWFyY2gtcmVzdWx0cyB1bFwiKTtcbiAgICB0aGlzLmNob3NlbkxvY2F0aW9uID0gbnVsbDtcblxuICAgIHRoaXMudGltZW91dCA9IG51bGw7XG5cbiAgICB0aGlzLnNlYXJjaFN1Z2dlc3Rpb25zQ29udGFpbmVyLmhpZGUoKTtcbiAgICB0aGlzLl9zdGFydExpc3RlbmVyKCk7XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgfVxuXG4gIF9zdGFydExpc3RlbmVyKCkge1xuICAgIGNvbnN0IHRoYXQgPSB0aGlzO1xuXG4gICAgLy8gTGlzdGVuIHRvIGFkZHJlc3MgY2hhbmdlc1xuICAgIHRoaXMuYWRkcmVzc0Zvcm0uYmluZCgna2V5dXAnLCAoZXYpPT57XG4gICAgICBjb25zdCBhZGRyZXNzID0gZXYudGFyZ2V0LnZhbHVlO1xuXG4gICAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KTtcbiAgICAgIHRoaXMudGltZW91dCA9IHNldFRpbWVvdXQoKCk9PntcbiAgICAgICAgLy9GaWx0ZXIgdGhlIGFkZHJlc3Nlc1xuICAgICAgICAkLmdldEpTT04oJ2h0dHBzOi8vbm9taW5hdGltLm9wZW5zdHJlZXRtYXAub3JnL3NlYXJjaC8nICsgZW5jb2RlVVJJQ29tcG9uZW50KGFkZHJlc3MpICsgJz9mb3JtYXQ9anNvbicsXG4gICAgICAgIChkYXRhKSA9PiB7XG4gICAgICAgICAgdGhhdC5zZWFyY2hTdWdnZXN0aW9uc0NvbnRhaW5lci5zaG93KCk7XG4gICAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgICAgICAgICB0aGF0LnJlbmRlcigpO1xuICAgICAgICB9KTtcbiAgICAgIH0sIDUwMCk7XG4gICAgfSlcblxuICAgIC8vTGlzdGVuIHRvIGNsaWNraW5nIG9mIHN1Z2dlc3Rpb25zXG4gICAgdGhhdC5zZWFyY2hTdWdnZXN0aW9uc0NvbnRhaW5lci5vbihcImNsaWNrXCIsIFwiYVwiLCAoZXYpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwiVGVzdFwiKTtcbiAgICAgIHRoYXQuc2VhcmNoU3VnZ2VzdGlvbnNDb250YWluZXIuaGlkZSgpO1xuICAgIH0pXG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgdGhpcy5zZWFyY2hTdWdnZXN0aW9ucy5lbXB0eSgpO1xuICAgIGlmICh0aGlzLmRhdGEpIHtcbiAgICAgIHRoaXMuc2VhcmNoU3VnZ2VzdGlvbnMuYXBwZW5kKFxuICAgICAgICB0aGlzLmRhdGEuc2xpY2UoMCw1KS5tYXAoKGl0ZW0pPT5gXG4gICAgICAgIDxsaT5cbiAgICAgICAgICA8ZGl2IGNsYXNzPSdzdWdnZXN0aW9uJyBsb249XCIke2l0ZW0ubG9ufVwiIGxhdD1cIiR7aXRlbS5sYXR9XCI+XG4gICAgICAgICAgICA8YSBocmVmPScjbG9uPSR7aXRlbS5sb259JmxhdD0ke2l0ZW0ubGF0fSc+JHtpdGVtLmRpc3BsYXlfbmFtZX08L2E+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvbGk+YClcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbn1cbiIsImNsYXNzIFN0b3JpZXNMaXN0TWFuYWdlciB7XG4gIGNvbnN0cnVjdG9yKGdlb2pzb24sIHN0YXR1c0RhdGEsIGNvbnRhY3QsIHN0b3JpZXMpIHtcbiAgICB0aGlzLmdlb2pzb24gPSBnZW9qc29uO1xuICAgIHRoaXMuc3RhdHVzRGF0YSA9IHN0YXR1c0RhdGE7XG4gICAgdGhpcy5jb250YWN0ID0gY29udGFjdDtcbiAgICB0aGlzLnN0b3JpZXMgPSBzdG9yaWVzO1xuXG4gICAgdGhpcy5zdG9yaWVzTGlzdCA9ICQoXCIjc3Rvcmllc1wiKTtcbiAgfVxuXG4gIGxpc3ROZWFyYnlTdG9yaWVzKGxhdExuZykge1xuICAgIGNvbnNvbGUubG9nKFwiU3Rvcmllc0xpc3RNYW5hZ2VyXCIsIGxhdExuZyk7XG4gIH1cbn1cbiIsIlxuY2xhc3MgQXBwIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIHRoaXMuTWFwID0gbnVsbDtcbiAgICB0aGlzLnJlbmRlcigpO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIC8vTG9hZGluZyBkYXRhLi4uXG4gICAgdmFyIG1hcEZldGNoID0gJC5nZXRKU09OKCcvZGF0YS9ueXMtc2VuYXRlbWFwLmpzb24nKTtcbiAgICB2YXIgc2VuYXRvclN0YXR1c0ZldGNoID0gJC5nZXRKU09OKCcvZGF0YS9zdGF0dXMuanNvbicpO1xuICAgIHZhciBzdGF0ZVNlbmF0b3JzSW5mbyA9ICQuZ2V0SlNPTignL2RhdGEvc3RhdGUtc2VuYXRvcnMuanNvbicpO1xuICAgIHZhciBzdG9yaWVzSW5mbyA9ICQuZ2V0SlNPTignL2RhdGEvc3Rvcmllcy5qc29uJyk7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICQud2hlbihtYXBGZXRjaCwgc2VuYXRvclN0YXR1c0ZldGNoLCBzdGF0ZVNlbmF0b3JzSW5mbywgc3Rvcmllc0luZm8pLnRoZW4oXG4gICAgICAoZ2VvanNvbiwgc3RhdHVzRGF0YSwgY29udGFjdCwgc3Rvcmllcyk9PntcbiAgICAgIHRoYXQuTWFwID0gbmV3IE1hcE1hbmFnZXIoZ2VvanNvblswXSwgc3RhdHVzRGF0YVswXSwgY29udGFjdFswXSwgc3Rvcmllc1swXSk7XG4gICAgICB0aGF0LlN0b3J5TGlzdCA9IG5ldyBTdG9yaWVzTGlzdE1hbmFnZXIoZ2VvanNvblswXSwgc3RhdHVzRGF0YVswXSwgY29udGFjdFswXSwgc3Rvcmllc1swXSk7XG4gICAgICB0aGF0LlNlYXJjaCA9IG5ldyBTZWFyY2hNYW5hZ2VyKCk7XG4gICAgICB0aGF0LlJlcCA9IG5ldyBSZXByZXNlbnRhdGl2ZU1hbmFnZXIodGhhdC5NYXAsIHN0YXR1c0RhdGFbMF0sIGNvbnRhY3RbMF0pO1xuICAgICAgdGhhdC5fbGlzdGVuVG9XaW5kb3coKTtcbiAgICB9KTtcbiAgfVxuXG4gIF9saXN0ZW5Ub1dpbmRvdygpIHtcblxuICAgICQod2luZG93KS5vbignaGFzaGNoYW5nZScsICgpPT57XG4gICAgICBpZiAod2luZG93LmxvY2F0aW9uLmhhc2ggJiYgd2luZG93LmxvY2F0aW9uLmhhc2gubGVuZ3RoID4gMClcbiAgICAgIHtcbiAgICAgICAgY29uc3QgaGFzaCA9ICQuZGVwYXJhbSh3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHJpbmcoMSkpO1xuXG4gICAgICAgIGNvbnN0IGxhdExuZyA9IG5ldyBMLmxhdExuZyhoYXNoLmxhdCwgaGFzaC5sb24pO1xuICAgICAgICAvLyBUcmlnZ2VyIHZhcmlvdXMgbWFuYWdlcnNcbiAgICAgICAgdGhpcy5TdG9yeUxpc3QubGlzdE5lYXJieVN0b3JpZXMobGF0TG5nKTtcbiAgICAgICAgdGhpcy5SZXAuc2hvd1JlcHJlc2VudGF0aXZlKGxhdExuZyk7XG4gICAgICAgIHRoaXMuTWFwLmZvY3VzT25EaXN0cmljdChsYXRMbmcpXG4gICAgICB9XG4gICAgfSk7XG4gICAgJCh3aW5kb3cpLnRyaWdnZXIoXCJoYXNoY2hhbmdlXCIpO1xuICB9XG59XG5cbndpbmRvdy5BcHBNYW5hZ2VyID0gbmV3IEFwcCh7fSk7XG4iXX0=
