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
      console.log("RepresentativeManager", latLng);
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvbWFwLmpzIiwiY2xhc3Nlcy9yZXByZXNlbnRhdGl2ZS5qcyIsImNsYXNzZXMvc2VhcmNoLmpzIiwiY2xhc3Nlcy9zdG9yaWVzbGlzdC5qcyIsImFwcC5qcyJdLCJuYW1lcyI6WyJNYXBNYW5hZ2VyIiwiZ2VvanNvbiIsInN0YXR1c0RhdGEiLCJjb250YWN0IiwibWFwIiwiTCIsInNldFZpZXciLCJ0aWxlTGF5ZXIiLCJtYXhab29tIiwiYXR0cmlidXRpb24iLCJhZGRUbyIsInJlbmRlciIsImV2ZW50IiwicG9wdXAiLCJzZW5hdG9yIiwidGFyZ2V0Iiwib3B0aW9ucyIsIm1vcmVJbmZvIiwiY29udGVudCIsImltYWdlIiwibmFtZSIsInBhcnR5IiwiZGlzdHJpY3QiLCJzdGF0dXMiLCJjbG9zZUJ1dHRvbiIsImNsYXNzTmFtZSIsInNldENvbnRlbnQiLCJiaW5kUG9wdXAiLCJvcGVuUG9wdXAiLCJmZWF0dXJlIiwibGF5ZXIiLCJ0aGF0IiwicHJvcGVydGllcyIsIk5BTUUiLCJjaXJjbGVNYXJrZXIiLCJnZXRCb3VuZHMiLCJnZXRDZW50ZXIiLCJyYWRpdXMiLCJmaWxsQ29sb3IiLCJfY29sb3JEaXN0cmljdCIsImNvbG9yIiwib3BhY2l0eSIsImZpbGxPcGFjaXR5Iiwib24iLCJjbGljayIsIl9yZW5kZXJCdWJibGUiLCJiaW5kIiwiZSIsImNvbnNvbGUiLCJsb2ciLCJmaXRCb3VuZHMiLCJfbGVhZmxldF9pZCIsImlkIiwid2VpZ2h0Iiwic2V0U3R5bGUiLCJfbGF5ZXJTdHlsZSIsImRpc3RyaWN0cyIsImdlb0pTT04iLCJzdHlsZSIsIm9uRWFjaEZlYXR1cmUiLCJfb25FYWNoRmVhdHVyZSIsImJyaW5nVG9CYWNrIiwibGF5ZXJzIiwibGF0TG5nIiwibGVhZmxldFBpcCIsInBvaW50SW5MYXllciIsImVhY2hMYXllciIsIl9yZXNldExheWVyU3R5bGUiLCJfY2hvc2VuU3R5bGUiLCJSZXByZXNlbnRhdGl2ZU1hbmFnZXIiLCJyZXByZXNlbnRhdGl2ZUNvbnRhaW5lciIsIiQiLCJTZWFyY2hNYW5hZ2VyIiwiYWRkcmVzc0Zvcm0iLCJzZWFyY2hTdWdnZXN0aW9uc0NvbnRhaW5lciIsInNlYXJjaFN1Z2dlc3Rpb25zIiwiY2hvc2VuTG9jYXRpb24iLCJ0aW1lb3V0IiwiaGlkZSIsIl9zdGFydExpc3RlbmVyIiwiZXYiLCJhZGRyZXNzIiwidmFsdWUiLCJjbGVhclRpbWVvdXQiLCJzZXRUaW1lb3V0IiwiZ2V0SlNPTiIsImVuY29kZVVSSUNvbXBvbmVudCIsImRhdGEiLCJzaG93IiwiZW1wdHkiLCJhcHBlbmQiLCJzbGljZSIsIml0ZW0iLCJsb24iLCJsYXQiLCJkaXNwbGF5X25hbWUiLCJTdG9yaWVzTGlzdE1hbmFnZXIiLCJzdG9yaWVzIiwic3Rvcmllc0xpc3QiLCJBcHAiLCJNYXAiLCJtYXBGZXRjaCIsInNlbmF0b3JTdGF0dXNGZXRjaCIsInN0YXRlU2VuYXRvcnNJbmZvIiwic3Rvcmllc0luZm8iLCJ3aGVuIiwidGhlbiIsIlN0b3J5TGlzdCIsIlNlYXJjaCIsIlJlcCIsIl9saXN0ZW5Ub1dpbmRvdyIsIndpbmRvdyIsImxvY2F0aW9uIiwiaGFzaCIsImxlbmd0aCIsImRlcGFyYW0iLCJzdWJzdHJpbmciLCJsaXN0TmVhcmJ5U3RvcmllcyIsInNob3dSZXByZXNlbnRhdGl2ZSIsImZvY3VzT25EaXN0cmljdCIsInRyaWdnZXIiLCJBcHBNYW5hZ2VyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7SUFBTUE7QUFDSixzQkFBWUMsT0FBWixFQUFxQkMsVUFBckIsRUFBaUNDLE9BQWpDLEVBQTBDO0FBQUE7O0FBRXhDO0FBQ0EsU0FBS0MsR0FBTCxHQUFXLElBQUlDLEVBQUVELEdBQU4sQ0FBVSxLQUFWLEVBQWlCRSxPQUFqQixDQUF5QixDQUFDLE1BQUQsRUFBUSxDQUFDLE1BQVQsQ0FBekIsRUFBMkMsSUFBM0MsQ0FBWDtBQUNBRCxNQUFFRSxTQUFGLENBQVksOEVBQVosRUFBNEY7QUFDMUZDLGVBQVMsRUFEaUY7QUFFMUZDLG1CQUFhO0FBRjZF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RXdDLE1BQUYsRUFBVXBFLEVBQVYsQ0FBYSxZQUFiLEVBQTJCLFlBQUk7QUFDN0IsWUFBSW9FLE9BQU9DLFFBQVAsQ0FBZ0JDLElBQWhCLElBQXdCRixPQUFPQyxRQUFQLENBQWdCQyxJQUFoQixDQUFxQkMsTUFBckIsR0FBOEIsQ0FBMUQsRUFDQTtBQUNFLGNBQU1ELE9BQU8xQyxFQUFFNEMsT0FBRixDQUFVSixPQUFPQyxRQUFQLENBQWdCQyxJQUFoQixDQUFxQkcsU0FBckIsQ0FBK0IsQ0FBL0IsQ0FBVixDQUFiOztBQUVBLGNBQU1yRCxTQUFTLElBQUkxRCxFQUFFMEQsTUFBTixDQUFha0QsS0FBS25CLEdBQWxCLEVBQXVCbUIsS0FBS3BCLEdBQTVCLENBQWY7QUFDQTtBQUNBLGdCQUFLYyxTQUFMLENBQWVVLGlCQUFmLENBQWlDdEQsTUFBakM7QUFDQSxnQkFBSzhDLEdBQUwsQ0FBU1Msa0JBQVQsQ0FBNEJ2RCxNQUE1QjtBQUNBLGdCQUFLcUMsR0FBTCxDQUFTbUIsZUFBVCxDQUF5QnhELE1BQXpCO0FBQ0Q7QUFDRixPQVhEO0FBWUFRLFFBQUV3QyxNQUFGLEVBQVVTLE9BQVYsQ0FBa0IsWUFBbEI7QUFDRDs7Ozs7O0FBR0hULE9BQU9VLFVBQVAsR0FBb0IsSUFBSXRCLEdBQUosQ0FBUSxFQUFSLENBQXBCIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIE1hcE1hbmFnZXIge1xuICBjb25zdHJ1Y3RvcihnZW9qc29uLCBzdGF0dXNEYXRhLCBjb250YWN0KSB7XG5cbiAgICAvL0luaXRpYWxpemluZyBNYXBcbiAgICB0aGlzLm1hcCA9IG5ldyBMLm1hcCgnbWFwJykuc2V0VmlldyhbNDIuODYzLC03NC43NTJdLCA2LjU1KTtcbiAgICBMLnRpbGVMYXllcignaHR0cHM6Ly9jYXJ0b2RiLWJhc2VtYXBzLXtzfS5nbG9iYWwuc3NsLmZhc3RseS5uZXQvbGlnaHRfYWxsL3t6fS97eH0ve3l9LnBuZycsIHtcbiAgICAgIG1heFpvb206IDE4LFxuICAgICAgYXR0cmlidXRpb246ICcmY29weTsgPGEgaHJlZj1cImh0dHA6Ly93d3cub3BlbnN0cmVldG1hcC5vcmcvY29weXJpZ2h0XCI+T3BlblN0cmVldE1hcDwvYT4sICZjb3B5OzxhIGhyZWY9XCJodHRwczovL2NhcnRvLmNvbS9hdHRyaWJ1dGlvblwiPkNBUlRPPC9hPi4gSW50ZXJhY3Rpdml0eSBieSA8YSBocmVmPVwiLy9hY3Rpb25ibGl0ei5vcmdcIj5BY3Rpb25CbGl0ejwvYT4nXG4gICAgfSkuYWRkVG8odGhpcy5tYXApO1xuXG5cbiAgICB0aGlzLnN0YXR1c0RhdGEgPSBzdGF0dXNEYXRhO1xuICAgIHRoaXMuZ2VvanNvbiA9IGdlb2pzb247XG4gICAgdGhpcy5jb250YWN0ID0gY29udGFjdDtcblxuICAgIHRoaXMucmVuZGVyKCk7XG4gIH1cblxuICAvKioqXG4gICogcHJpdmF0ZSBtZXRob2QgX3JlbmRlckJ1YmJsZVxuICAqXG4gICovXG4gIF9yZW5kZXJCdWJibGUoZXZlbnQpIHtcblxuICAgIHZhciBwb3B1cDtcbiAgICB2YXIgc2VuYXRvciA9IGV2ZW50LnRhcmdldC5vcHRpb25zLnN0YXR1c0RhdGE7XG4gICAgdmFyIG1vcmVJbmZvID0gZXZlbnQudGFyZ2V0Lm9wdGlvbnMuY29udGFjdDtcblxuICAgIHZhciBjb250ZW50ID0gKFxuICAgICAgYDxkaXY+XG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInNlbmF0b3ItaW1hZ2UtY29udGFpbmVyXCI+XG4gICAgICAgICAgPGltZyBzcmM9XCIke3NlbmF0b3IuaW1hZ2V9XCIgLz5cbiAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJzZW5hdG9yLWluZm9cIj5cbiAgICAgICAgICA8ZGl2PiR7c2VuYXRvci5uYW1lfTwvZGl2PlxuICAgICAgICAgIDxkaXY+UGFydHk6ICR7bW9yZUluZm8ucGFydHl9PC9kaXY+XG4gICAgICAgICAgPGRpdj5TZW5hdGUgRGlzdHJpY3QgJHtzZW5hdG9yLmRpc3RyaWN0fTwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCIkeyhzZW5hdG9yLnN0YXR1cyA9PT0gJ0ZPUicpID8gJ3ZvdGVzLXllcycgOiAndm90ZXMtbm8nfVwiPlxuICAgICAgICAgICAgICAke3NlbmF0b3Iuc3RhdHVzID09PSAnVEFSR0VUJyA/ICdIaWdoIHByaW9yaXR5JyA6IChzZW5hdG9yLnN0YXR1cyA9PT0gJ0ZPUicpID8gJ0NvLVNwb25zb3InIDogJ05vIHN1cHBvcnQnfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L3NlY3Rpb24+XG4gICAgICAgIDxhIGhyZWY9XCIke21vcmVJbmZvLmNvbnRhY3R9XCIgY2xhc3M9XCJjb250YWN0LWxpbmtcIiB0YXJnZXQ9XCJfYmxhbmtcIj5Db250YWN0PC9idXR0b24+XG4gICAgICA8L2Rpdj5gKTtcblxuICAgIHBvcHVwID0gTC5wb3B1cCh7XG4gICAgICBjbG9zZUJ1dHRvbjogdHJ1ZSxcbiAgICAgIGNsYXNzTmFtZTogJ3NlbmF0b3ItcG9wdXAnLFxuICAgICB9KTtcblxuICAgIHBvcHVwLnNldENvbnRlbnQoY29udGVudCk7XG4gICAgZXZlbnQudGFyZ2V0LmJpbmRQb3B1cChwb3B1cCkub3BlblBvcHVwKCk7XG4gIH1cblxuICBfb25FYWNoRmVhdHVyZShmZWF0dXJlLCBsYXllcikge1xuICAgICAgLy9cbiAgICAgIC8vIGNvbnNvbGUubG9nKHNlbmF0b3JzW2ZlYXR1cmUucHJvcGVydGllcy5OQU1FIC0gMV0uc3RhdHVzKVxuICAgICAgY29uc3QgdGhhdCA9IHRoaXM7XG5cbiAgICAgIHZhciBzdGF0dXMgPSB0aGlzLnN0YXR1c0RhdGFbZmVhdHVyZS5wcm9wZXJ0aWVzLk5BTUUgLSAxXS5zdGF0dXM7XG5cbiAgICAgIC8vIENyZWF0ZSBDaXJjbGUgTWFya2VyXG4gICAgICBMLmNpcmNsZU1hcmtlcihsYXllci5nZXRCb3VuZHMoKS5nZXRDZW50ZXIoKSwge1xuICAgICAgICByYWRpdXM6IDcsXG4gICAgICAgIGZpbGxDb2xvcjogdGhpcy5fY29sb3JEaXN0cmljdChmZWF0dXJlKSxcbiAgICAgICAgY29sb3I6ICd3aGl0ZScsXG4gICAgICAgIG9wYWNpdHk6IDEsXG4gICAgICAgIGZpbGxPcGFjaXR5OiAwLjcsXG5cbiAgICAgICAgLy9EYXRhXG4gICAgICAgIHN0YXR1c0RhdGE6IHRoaXMuc3RhdHVzRGF0YVtmZWF0dXJlLnByb3BlcnRpZXMuTkFNRSAtIDFdLFxuICAgICAgICBjb250YWN0OiB0aGlzLmNvbnRhY3RbZmVhdHVyZS5wcm9wZXJ0aWVzLk5BTUUgLSAxXSxcbiAgICAgIH0pXG4gICAgICAub24oe1xuICAgICAgICBjbGljazogdGhpcy5fcmVuZGVyQnViYmxlLmJpbmQodGhpcyksXG4gICAgICB9KS5hZGRUbyh0aGlzLm1hcCk7XG5cblxuICAgICAgbGF5ZXIub24oe1xuICAgICAgICBjbGljazogKGUpPT57XG4gICAgICAgICAgY29uc29sZS5sb2coXCJDTElDS0VEIDo6OiBcIiwgZS50YXJnZXQpO1xuICAgICAgICAgIHRoaXMubWFwLmZpdEJvdW5kcyhsYXllci5nZXRCb3VuZHMoKSk7XG5cbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgbGF5ZXIuX2xlYWZsZXRfaWQgPSBmZWF0dXJlLmlkXG4gICAgICAvLyBsYXllci5vbih7XG4gICAgICAgIC8vIG1vdXNlb3ZlcjogaGFuZGxlTW91c2VPdmVyLFxuICAgICAgICAvLyBtb3VzZW91dDogaGFuZGxlTW91c2VPdXRcbiAgICAgIC8vIH0pO1xuICAgIH1cblxuICBfbGF5ZXJTdHlsZSgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZmlsbENvbG9yOiAnZ3JheScsXG4gICAgICBmaWxsT3BhY2l0eTogMC4wMSxcbiAgICAgIGNvbG9yOiAnZ3JheScsXG4gICAgICBvcGFjaXR5OiAnMScsXG4gICAgICB3ZWlnaHQ6IDFcbiAgICB9O1xuICB9XG4gIF9jaG9zZW5TdHlsZSgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZmlsbENvbG9yOiAnZ3JlZW4nLFxuICAgICAgZmlsbE9wYWNpdHk6IDAuNVxuICAgIH1cbiAgfVxuXG4gIF9yZXNldExheWVyU3R5bGUobGF5ZXIpIHtcbiAgICBsYXllci5zZXRTdHlsZSh0aGlzLl9sYXllclN0eWxlKCkpO1xuICB9XG5cbiAgX2NvbG9yRGlzdHJpY3QoZGlzdHJpY3QpIHtcbiAgICB2YXIgc3RhdHVzID0gdGhpcy5zdGF0dXNEYXRhW2Rpc3RyaWN0LnByb3BlcnRpZXMuTkFNRSAtIDFdLnN0YXR1cztcblxuICAgIHN3aXRjaChzdGF0dXMpIHtcbiAgICAgIGNhc2UgJ0ZPUic6XG4gICAgICAgIHJldHVybiAnIzFlOTBmZic7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnQUdBSU5TVCc6XG4gICAgICAgIHJldHVybiAnI0ZGNEM1MCc7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnVEFSR0VUJzpcbiAgICAgICAgcmV0dXJuICcjQ0MwMDA0JztcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIC8vQ2FsbCBnZW9qc29uXG4gICAgdGhpcy5kaXN0cmljdHMgPSBMLmdlb0pTT04odGhpcy5nZW9qc29uLCB7XG4gICAgICBzdHlsZTogdGhpcy5fbGF5ZXJTdHlsZS5iaW5kKHRoaXMpLFxuICAgICAgb25FYWNoRmVhdHVyZTogdGhpcy5fb25FYWNoRmVhdHVyZS5iaW5kKHRoaXMpXG4gICAgfSlcbiAgICB0aGlzLmRpc3RyaWN0cy5hZGRUbyh0aGlzLm1hcCk7XG4gICAgdGhpcy5kaXN0cmljdHMuYnJpbmdUb0JhY2soKTtcblxuICAgIGNvbnNvbGUubG9nKHRoaXMubGF5ZXJzKTtcbiAgfVxuXG4gIC8vRml0Qm91bmRzIG9uIHRoZSBkaXN0cmljdFxuICBmb2N1c09uRGlzdHJpY3QobGF0TG5nKSB7XG4gICAgY29uc3QgdGFyZ2V0ID0gbGVhZmxldFBpcC5wb2ludEluTGF5ZXIobGF0TG5nLCB0aGlzLmRpc3RyaWN0cywgdHJ1ZSlbMF07XG5cbiAgICBpZiAodGFyZ2V0KSB7XG4gICAgICB0aGlzLm1hcC5maXRCb3VuZHModGFyZ2V0LmdldEJvdW5kcygpKTtcbiAgICAgIHRoaXMuZGlzdHJpY3RzLmVhY2hMYXllcih0aGlzLl9yZXNldExheWVyU3R5bGUuYmluZCh0aGlzKSk7XG4gICAgICB0YXJnZXQuc2V0U3R5bGUodGhpcy5fY2hvc2VuU3R5bGUoKSlcbiAgICAgIC8vUmVmcmVzaCB3aG9sZSBtYXBcbiAgICB9XG5cblxuXG4gIH1cbn1cbiIsIi8qKlxuICogUmVwcmVzZW50YXRpdmVNYW5hZ2VyXG4gKiBGYWNpbGl0YXRlcyB0aGUgcmV0cmlldmFsIG9mIHRoZSB1c2VyJ3MgUmVwcmVzZW50YXRpdmUgYmFzZWQgb24gdGhlaXIgQWRkcmVzc1xuICoqL1xuY2xhc3MgUmVwcmVzZW50YXRpdmVNYW5hZ2VyIHtcblxuICBjb25zdHJ1Y3RvcihtYXAsIHN0YXR1cywgY29udGFjdCkge1xuICAgIHRoaXMubWFwID0gbWFwO1xuICAgIHRoaXMuc3RhdHVzID0gc3RhdHVzO1xuICAgIHRoaXMuY29udGFjdCA9IGNvbnRhY3Q7XG5cbiAgICB0aGlzLnJlcHJlc2VudGF0aXZlQ29udGFpbmVyID0gJChcIiNzZW5hdG9yLWluZm9cIik7XG4gIH1cblxuICBzaG93UmVwcmVzZW50YXRpdmUobGF0TG5nKSB7XG4gICAgY29uc29sZS5sb2coXCJSZXByZXNlbnRhdGl2ZU1hbmFnZXJcIiwgbGF0TG5nKTtcbiAgfVxuXG59XG4iLCIvKipcbiogRmFjaWxpdGF0ZXMgdGhlIHNlYXJjaFxuKi9cblxuY2xhc3MgU2VhcmNoTWFuYWdlciB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy50YXJnZXQgPSAkKFwiI2Zvcm0tYXJlYVwiKTtcbiAgICB0aGlzLmFkZHJlc3NGb3JtID0gJChcIiNmb3JtLWFyZWEgI2FkZHJlc3NcIik7XG5cbiAgICB0aGlzLnNlYXJjaFN1Z2dlc3Rpb25zQ29udGFpbmVyID0gJChcIiNzZWFyY2gtcmVzdWx0c1wiKTtcbiAgICB0aGlzLnNlYXJjaFN1Z2dlc3Rpb25zID0gJChcIiNzZWFyY2gtcmVzdWx0cyB1bFwiKTtcbiAgICB0aGlzLmNob3NlbkxvY2F0aW9uID0gbnVsbDtcblxuICAgIHRoaXMudGltZW91dCA9IG51bGw7XG5cbiAgICB0aGlzLnNlYXJjaFN1Z2dlc3Rpb25zQ29udGFpbmVyLmhpZGUoKTtcbiAgICB0aGlzLl9zdGFydExpc3RlbmVyKCk7XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgfVxuXG4gIF9zdGFydExpc3RlbmVyKCkge1xuICAgIGNvbnN0IHRoYXQgPSB0aGlzO1xuXG4gICAgLy8gTGlzdGVuIHRvIGFkZHJlc3MgY2hhbmdlc1xuICAgIHRoaXMuYWRkcmVzc0Zvcm0uYmluZCgna2V5dXAnLCAoZXYpPT57XG4gICAgICBjb25zdCBhZGRyZXNzID0gZXYudGFyZ2V0LnZhbHVlO1xuXG4gICAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KTtcbiAgICAgIHRoaXMudGltZW91dCA9IHNldFRpbWVvdXQoKCk9PntcbiAgICAgICAgLy9GaWx0ZXIgdGhlIGFkZHJlc3Nlc1xuICAgICAgICAkLmdldEpTT04oJ2h0dHBzOi8vbm9taW5hdGltLm9wZW5zdHJlZXRtYXAub3JnL3NlYXJjaC8nICsgZW5jb2RlVVJJQ29tcG9uZW50KGFkZHJlc3MpICsgJz9mb3JtYXQ9anNvbicsXG4gICAgICAgIChkYXRhKSA9PiB7XG4gICAgICAgICAgdGhhdC5zZWFyY2hTdWdnZXN0aW9uc0NvbnRhaW5lci5zaG93KCk7XG4gICAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgICAgICAgICB0aGF0LnJlbmRlcigpO1xuICAgICAgICB9KTtcbiAgICAgIH0sIDUwMCk7XG4gICAgfSlcblxuICAgIC8vTGlzdGVuIHRvIGNsaWNraW5nIG9mIHN1Z2dlc3Rpb25zXG4gICAgdGhhdC5zZWFyY2hTdWdnZXN0aW9uc0NvbnRhaW5lci5vbihcImNsaWNrXCIsIFwiYVwiLCAoZXYpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwiVGVzdFwiKTtcbiAgICAgIHRoYXQuc2VhcmNoU3VnZ2VzdGlvbnNDb250YWluZXIuaGlkZSgpO1xuICAgIH0pXG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgdGhpcy5zZWFyY2hTdWdnZXN0aW9ucy5lbXB0eSgpO1xuICAgIGlmICh0aGlzLmRhdGEpIHtcbiAgICAgIHRoaXMuc2VhcmNoU3VnZ2VzdGlvbnMuYXBwZW5kKFxuICAgICAgICB0aGlzLmRhdGEuc2xpY2UoMCw1KS5tYXAoKGl0ZW0pPT5gXG4gICAgICAgIDxsaT5cbiAgICAgICAgICA8ZGl2IGNsYXNzPSdzdWdnZXN0aW9uJyBsb249XCIke2l0ZW0ubG9ufVwiIGxhdD1cIiR7aXRlbS5sYXR9XCI+XG4gICAgICAgICAgICA8YSBocmVmPScjbG9uPSR7aXRlbS5sb259JmxhdD0ke2l0ZW0ubGF0fSc+JHtpdGVtLmRpc3BsYXlfbmFtZX08L2E+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvbGk+YClcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbn1cbiIsImNsYXNzIFN0b3JpZXNMaXN0TWFuYWdlciB7XG4gIGNvbnN0cnVjdG9yKGdlb2pzb24sIHN0YXR1c0RhdGEsIGNvbnRhY3QsIHN0b3JpZXMpIHtcbiAgICB0aGlzLmdlb2pzb24gPSBnZW9qc29uO1xuICAgIHRoaXMuc3RhdHVzRGF0YSA9IHN0YXR1c0RhdGE7XG4gICAgdGhpcy5jb250YWN0ID0gY29udGFjdDtcbiAgICB0aGlzLnN0b3JpZXMgPSBzdG9yaWVzO1xuXG4gICAgdGhpcy5zdG9yaWVzTGlzdCA9ICQoXCIjc3Rvcmllc1wiKTtcbiAgfVxuXG4gIGxpc3ROZWFyYnlTdG9yaWVzKGxhdExuZykge1xuICAgIGNvbnNvbGUubG9nKFwiU3Rvcmllc0xpc3RNYW5hZ2VyXCIsIGxhdExuZyk7XG4gIH1cbn1cbiIsIlxuY2xhc3MgQXBwIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIHRoaXMuTWFwID0gbnVsbDtcbiAgICB0aGlzLnJlbmRlcigpO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIC8vTG9hZGluZyBkYXRhLi4uXG4gICAgdmFyIG1hcEZldGNoID0gJC5nZXRKU09OKCcvZGF0YS9ueXMtc2VuYXRlbWFwLmpzb24nKTtcbiAgICB2YXIgc2VuYXRvclN0YXR1c0ZldGNoID0gJC5nZXRKU09OKCcvZGF0YS9zdGF0dXMuanNvbicpO1xuICAgIHZhciBzdGF0ZVNlbmF0b3JzSW5mbyA9ICQuZ2V0SlNPTignL2RhdGEvc3RhdGUtc2VuYXRvcnMuanNvbicpO1xuICAgIHZhciBzdG9yaWVzSW5mbyA9ICQuZ2V0SlNPTignL2RhdGEvc3Rvcmllcy5qc29uJyk7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICQud2hlbihtYXBGZXRjaCwgc2VuYXRvclN0YXR1c0ZldGNoLCBzdGF0ZVNlbmF0b3JzSW5mbywgc3Rvcmllc0luZm8pLnRoZW4oXG4gICAgICAoZ2VvanNvbiwgc3RhdHVzRGF0YSwgY29udGFjdCwgc3Rvcmllcyk9PntcbiAgICAgIHRoYXQuTWFwID0gbmV3IE1hcE1hbmFnZXIoZ2VvanNvblswXSwgc3RhdHVzRGF0YVswXSwgY29udGFjdFswXSwgc3Rvcmllc1swXSk7XG4gICAgICB0aGF0LlN0b3J5TGlzdCA9IG5ldyBTdG9yaWVzTGlzdE1hbmFnZXIoZ2VvanNvblswXSwgc3RhdHVzRGF0YVswXSwgY29udGFjdFswXSwgc3Rvcmllc1swXSk7XG4gICAgICB0aGF0LlNlYXJjaCA9IG5ldyBTZWFyY2hNYW5hZ2VyKCk7XG4gICAgICB0aGF0LlJlcCA9IG5ldyBSZXByZXNlbnRhdGl2ZU1hbmFnZXIodGhhdC5NYXAsIHN0YXR1c0RhdGFbMF0sIGNvbnRhY3RbMF0pO1xuICAgICAgdGhhdC5fbGlzdGVuVG9XaW5kb3coKTtcbiAgICB9KTtcbiAgfVxuXG4gIF9saXN0ZW5Ub1dpbmRvdygpIHtcblxuICAgICQod2luZG93KS5vbignaGFzaGNoYW5nZScsICgpPT57XG4gICAgICBpZiAod2luZG93LmxvY2F0aW9uLmhhc2ggJiYgd2luZG93LmxvY2F0aW9uLmhhc2gubGVuZ3RoID4gMClcbiAgICAgIHtcbiAgICAgICAgY29uc3QgaGFzaCA9ICQuZGVwYXJhbSh3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHJpbmcoMSkpO1xuXG4gICAgICAgIGNvbnN0IGxhdExuZyA9IG5ldyBMLmxhdExuZyhoYXNoLmxhdCwgaGFzaC5sb24pO1xuICAgICAgICAvLyBUcmlnZ2VyIHZhcmlvdXMgbWFuYWdlcnNcbiAgICAgICAgdGhpcy5TdG9yeUxpc3QubGlzdE5lYXJieVN0b3JpZXMobGF0TG5nKTtcbiAgICAgICAgdGhpcy5SZXAuc2hvd1JlcHJlc2VudGF0aXZlKGxhdExuZyk7XG4gICAgICAgIHRoaXMuTWFwLmZvY3VzT25EaXN0cmljdChsYXRMbmcpXG4gICAgICB9XG4gICAgfSk7XG4gICAgJCh3aW5kb3cpLnRyaWdnZXIoXCJoYXNoY2hhbmdlXCIpO1xuICB9XG59XG5cbndpbmRvdy5BcHBNYW5hZ2VyID0gbmV3IEFwcCh7fSk7XG4iXX0=
