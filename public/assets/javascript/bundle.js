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
        fillOpacity: 0.2,
        color: 'gray',
        opacity: '1',
        weight: 1
      };
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
    key: "onHashchange",
    value: function onHashchange(options) {
      console.log("RepresentativeManager", options);
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
    key: "onHashchange",
    value: function onHashchange(options) {
      console.log("StoriesListManager", options);
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

          // Trigger various managers
          _this.StoryList.onHashchange(hash);
          _this.Rep.onHashchange(hash);
        }
      });
    }
  }]);

  return App;
}();

window.AppManager = new App({});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvbWFwLmpzIiwiY2xhc3Nlcy9yZXByZXNlbnRhdGl2ZS5qcyIsImNsYXNzZXMvc2VhcmNoLmpzIiwiY2xhc3Nlcy9zdG9yaWVzbGlzdC5qcyIsImFwcC5qcyJdLCJuYW1lcyI6WyJNYXBNYW5hZ2VyIiwiZ2VvanNvbiIsInN0YXR1c0RhdGEiLCJjb250YWN0IiwibWFwIiwiTCIsInNldFZpZXciLCJ0aWxlTGF5ZXIiLCJtYXhab29tIiwiYXR0cmlidXRpb24iLCJhZGRUbyIsInJlbmRlciIsImV2ZW50IiwicG9wdXAiLCJzZW5hdG9yIiwidGFyZ2V0Iiwib3B0aW9ucyIsIm1vcmVJbmZvIiwiY29udGVudCIsImltYWdlIiwibmFtZSIsInBhcnR5IiwiZGlzdHJpY3QiLCJzdGF0dXMiLCJjbG9zZUJ1dHRvbiIsImNsYXNzTmFtZSIsInNldENvbnRlbnQiLCJiaW5kUG9wdXAiLCJvcGVuUG9wdXAiLCJmZWF0dXJlIiwibGF5ZXIiLCJ0aGF0IiwicHJvcGVydGllcyIsIk5BTUUiLCJjaXJjbGVNYXJrZXIiLCJnZXRCb3VuZHMiLCJnZXRDZW50ZXIiLCJyYWRpdXMiLCJmaWxsQ29sb3IiLCJfY29sb3JEaXN0cmljdCIsImNvbG9yIiwib3BhY2l0eSIsImZpbGxPcGFjaXR5Iiwib24iLCJjbGljayIsIl9yZW5kZXJCdWJibGUiLCJiaW5kIiwiZSIsImNvbnNvbGUiLCJsb2ciLCJmaXRCb3VuZHMiLCJfbGVhZmxldF9pZCIsImlkIiwid2VpZ2h0IiwiZGlzdHJpY3RzIiwiZ2VvSlNPTiIsInN0eWxlIiwiX2xheWVyU3R5bGUiLCJvbkVhY2hGZWF0dXJlIiwiX29uRWFjaEZlYXR1cmUiLCJicmluZ1RvQmFjayIsImxheWVycyIsIlJlcHJlc2VudGF0aXZlTWFuYWdlciIsInJlcHJlc2VudGF0aXZlQ29udGFpbmVyIiwiJCIsIlNlYXJjaE1hbmFnZXIiLCJhZGRyZXNzRm9ybSIsInNlYXJjaFN1Z2dlc3Rpb25zQ29udGFpbmVyIiwic2VhcmNoU3VnZ2VzdGlvbnMiLCJjaG9zZW5Mb2NhdGlvbiIsInRpbWVvdXQiLCJoaWRlIiwiX3N0YXJ0TGlzdGVuZXIiLCJldiIsImFkZHJlc3MiLCJ2YWx1ZSIsImNsZWFyVGltZW91dCIsInNldFRpbWVvdXQiLCJnZXRKU09OIiwiZW5jb2RlVVJJQ29tcG9uZW50IiwiZGF0YSIsInNob3ciLCJlbXB0eSIsImFwcGVuZCIsInNsaWNlIiwiaXRlbSIsImxvbiIsImxhdCIsImRpc3BsYXlfbmFtZSIsIlN0b3JpZXNMaXN0TWFuYWdlciIsInN0b3JpZXMiLCJzdG9yaWVzTGlzdCIsIkFwcCIsIk1hcCIsIm1hcEZldGNoIiwic2VuYXRvclN0YXR1c0ZldGNoIiwic3RhdGVTZW5hdG9yc0luZm8iLCJzdG9yaWVzSW5mbyIsIndoZW4iLCJ0aGVuIiwiU3RvcnlMaXN0IiwiU2VhcmNoIiwiUmVwIiwiX2xpc3RlblRvV2luZG93Iiwid2luZG93IiwibG9jYXRpb24iLCJoYXNoIiwibGVuZ3RoIiwiZGVwYXJhbSIsInN1YnN0cmluZyIsIm9uSGFzaGNoYW5nZSIsIkFwcE1hbmFnZXIiXSwibWFwcGluZ3MiOiI7Ozs7OztJQUFNQTtBQUNKLHNCQUFZQyxPQUFaLEVBQXFCQyxVQUFyQixFQUFpQ0MsT0FBakMsRUFBMEM7QUFBQTs7QUFFeEM7QUFDQSxTQUFLQyxHQUFMLEdBQVcsSUFBSUMsRUFBRUQsR0FBTixDQUFVLEtBQVYsRUFBaUJFLE9BQWpCLENBQXlCLENBQUMsTUFBRCxFQUFRLENBQUMsTUFBVCxDQUF6QixFQUEyQyxJQUEzQyxDQUFYO0FBQ0FELE1BQUVFLFNBQUYsQ0FBWSw4RUFBWixFQUE0RjtBQUMxRkMsZUFBUyxFQURpRjtBQUUxRkMsbUJBQWE7QUFGNkUsS0FBNUYsRUFHR0MsS0FISCxDQUdTLEtBQUtOLEdBSGQ7O0FBTUEsU0FBS0YsVUFBTCxHQUFrQkEsVUFBbEI7QUFDQSxTQUFLRCxPQUFMLEdBQWVBLE9BQWY7QUFDQSxTQUFLRSxPQUFMLEdBQWVBLE9BQWY7O0FBRUEsU0FBS1EsTUFBTDtBQUNEOztBQUVEOzs7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QUF1QnhGLFFBQVEsQ0FBUixDQUF2QixFQUFtQ0MsV0FBVyxDQUFYLENBQW5DLEVBQWtEQyxRQUFRLENBQVIsQ0FBbEQsRUFBOER1RixRQUFRLENBQVIsQ0FBOUQsQ0FBakI7QUFDQTNELGFBQUtzRSxNQUFMLEdBQWMsSUFBSXBDLGFBQUosRUFBZDtBQUNBbEMsYUFBS3VFLEdBQUwsR0FBVyxJQUFJeEMscUJBQUosQ0FBMEIvQixLQUFLOEQsR0FBL0IsRUFBb0MzRixXQUFXLENBQVgsQ0FBcEMsRUFBbURDLFFBQVEsQ0FBUixDQUFuRCxDQUFYO0FBQ0E0QixhQUFLd0UsZUFBTDtBQUNELE9BUEQ7QUFRRDs7O3NDQUVpQjtBQUFBOztBQUVoQnZDLFFBQUV3QyxNQUFGLEVBQVU3RCxFQUFWLENBQWEsWUFBYixFQUEyQixZQUFJO0FBQzdCLFlBQUk2RCxPQUFPQyxRQUFQLENBQWdCQyxJQUFoQixJQUF3QkYsT0FBT0MsUUFBUCxDQUFnQkMsSUFBaEIsQ0FBcUJDLE1BQXJCLEdBQThCLENBQTFELEVBQ0E7QUFDRSxjQUFNRCxPQUFPMUMsRUFBRTRDLE9BQUYsQ0FBVUosT0FBT0MsUUFBUCxDQUFnQkMsSUFBaEIsQ0FBcUJHLFNBQXJCLENBQStCLENBQS9CLENBQVYsQ0FBYjs7QUFFQTtBQUNBLGdCQUFLVCxTQUFMLENBQWVVLFlBQWYsQ0FBNEJKLElBQTVCO0FBQ0EsZ0JBQUtKLEdBQUwsQ0FBU1EsWUFBVCxDQUFzQkosSUFBdEI7QUFFRDtBQUNGLE9BVkQ7QUFXRDs7Ozs7O0FBR0hGLE9BQU9PLFVBQVAsR0FBb0IsSUFBSW5CLEdBQUosQ0FBUSxFQUFSLENBQXBCIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIE1hcE1hbmFnZXIge1xuICBjb25zdHJ1Y3RvcihnZW9qc29uLCBzdGF0dXNEYXRhLCBjb250YWN0KSB7XG5cbiAgICAvL0luaXRpYWxpemluZyBNYXBcbiAgICB0aGlzLm1hcCA9IG5ldyBMLm1hcCgnbWFwJykuc2V0VmlldyhbNDIuODYzLC03NC43NTJdLCA2LjU1KTtcbiAgICBMLnRpbGVMYXllcignaHR0cHM6Ly9jYXJ0b2RiLWJhc2VtYXBzLXtzfS5nbG9iYWwuc3NsLmZhc3RseS5uZXQvbGlnaHRfYWxsL3t6fS97eH0ve3l9LnBuZycsIHtcbiAgICAgIG1heFpvb206IDE4LFxuICAgICAgYXR0cmlidXRpb246ICcmY29weTsgPGEgaHJlZj1cImh0dHA6Ly93d3cub3BlbnN0cmVldG1hcC5vcmcvY29weXJpZ2h0XCI+T3BlblN0cmVldE1hcDwvYT4sICZjb3B5OzxhIGhyZWY9XCJodHRwczovL2NhcnRvLmNvbS9hdHRyaWJ1dGlvblwiPkNBUlRPPC9hPi4gSW50ZXJhY3Rpdml0eSBieSA8YSBocmVmPVwiLy9hY3Rpb25ibGl0ei5vcmdcIj5BY3Rpb25CbGl0ejwvYT4nXG4gICAgfSkuYWRkVG8odGhpcy5tYXApO1xuXG5cbiAgICB0aGlzLnN0YXR1c0RhdGEgPSBzdGF0dXNEYXRhO1xuICAgIHRoaXMuZ2VvanNvbiA9IGdlb2pzb247XG4gICAgdGhpcy5jb250YWN0ID0gY29udGFjdDtcblxuICAgIHRoaXMucmVuZGVyKCk7XG4gIH1cblxuICAvKioqXG4gICogcHJpdmF0ZSBtZXRob2QgX3JlbmRlckJ1YmJsZVxuICAqXG4gICovXG4gIF9yZW5kZXJCdWJibGUoZXZlbnQpIHtcblxuICAgIHZhciBwb3B1cDtcbiAgICB2YXIgc2VuYXRvciA9IGV2ZW50LnRhcmdldC5vcHRpb25zLnN0YXR1c0RhdGE7XG4gICAgdmFyIG1vcmVJbmZvID0gZXZlbnQudGFyZ2V0Lm9wdGlvbnMuY29udGFjdDtcblxuICAgIHZhciBjb250ZW50ID0gKFxuICAgICAgYDxkaXY+XG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInNlbmF0b3ItaW1hZ2UtY29udGFpbmVyXCI+XG4gICAgICAgICAgPGltZyBzcmM9XCIke3NlbmF0b3IuaW1hZ2V9XCIgLz5cbiAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJzZW5hdG9yLWluZm9cIj5cbiAgICAgICAgICA8ZGl2PiR7c2VuYXRvci5uYW1lfTwvZGl2PlxuICAgICAgICAgIDxkaXY+UGFydHk6ICR7bW9yZUluZm8ucGFydHl9PC9kaXY+XG4gICAgICAgICAgPGRpdj5TZW5hdGUgRGlzdHJpY3QgJHtzZW5hdG9yLmRpc3RyaWN0fTwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCIkeyhzZW5hdG9yLnN0YXR1cyA9PT0gJ0ZPUicpID8gJ3ZvdGVzLXllcycgOiAndm90ZXMtbm8nfVwiPlxuICAgICAgICAgICAgICAke3NlbmF0b3Iuc3RhdHVzID09PSAnVEFSR0VUJyA/ICdIaWdoIHByaW9yaXR5JyA6IChzZW5hdG9yLnN0YXR1cyA9PT0gJ0ZPUicpID8gJ0NvLVNwb25zb3InIDogJ05vIHN1cHBvcnQnfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L3NlY3Rpb24+XG4gICAgICAgIDxhIGhyZWY9XCIke21vcmVJbmZvLmNvbnRhY3R9XCIgY2xhc3M9XCJjb250YWN0LWxpbmtcIiB0YXJnZXQ9XCJfYmxhbmtcIj5Db250YWN0PC9idXR0b24+XG4gICAgICA8L2Rpdj5gKTtcblxuICAgIHBvcHVwID0gTC5wb3B1cCh7XG4gICAgICBjbG9zZUJ1dHRvbjogdHJ1ZSxcbiAgICAgIGNsYXNzTmFtZTogJ3NlbmF0b3ItcG9wdXAnLFxuICAgICB9KTtcblxuICAgIHBvcHVwLnNldENvbnRlbnQoY29udGVudCk7XG4gICAgZXZlbnQudGFyZ2V0LmJpbmRQb3B1cChwb3B1cCkub3BlblBvcHVwKCk7XG4gIH1cblxuICBfb25FYWNoRmVhdHVyZShmZWF0dXJlLCBsYXllcikge1xuICAgICAgLy9cbiAgICAgIC8vIGNvbnNvbGUubG9nKHNlbmF0b3JzW2ZlYXR1cmUucHJvcGVydGllcy5OQU1FIC0gMV0uc3RhdHVzKVxuICAgICAgY29uc3QgdGhhdCA9IHRoaXM7XG5cbiAgICAgIHZhciBzdGF0dXMgPSB0aGlzLnN0YXR1c0RhdGFbZmVhdHVyZS5wcm9wZXJ0aWVzLk5BTUUgLSAxXS5zdGF0dXM7XG5cbiAgICAgIC8vIENyZWF0ZSBDaXJjbGUgTWFya2VyXG4gICAgICBMLmNpcmNsZU1hcmtlcihsYXllci5nZXRCb3VuZHMoKS5nZXRDZW50ZXIoKSwge1xuICAgICAgICByYWRpdXM6IDcsXG4gICAgICAgIGZpbGxDb2xvcjogdGhpcy5fY29sb3JEaXN0cmljdChmZWF0dXJlKSxcbiAgICAgICAgY29sb3I6ICd3aGl0ZScsXG4gICAgICAgIG9wYWNpdHk6IDEsXG4gICAgICAgIGZpbGxPcGFjaXR5OiAwLjcsXG5cbiAgICAgICAgLy9EYXRhXG4gICAgICAgIHN0YXR1c0RhdGE6IHRoaXMuc3RhdHVzRGF0YVtmZWF0dXJlLnByb3BlcnRpZXMuTkFNRSAtIDFdLFxuICAgICAgICBjb250YWN0OiB0aGlzLmNvbnRhY3RbZmVhdHVyZS5wcm9wZXJ0aWVzLk5BTUUgLSAxXSxcbiAgICAgIH0pXG4gICAgICAub24oe1xuICAgICAgICBjbGljazogdGhpcy5fcmVuZGVyQnViYmxlLmJpbmQodGhpcyksXG4gICAgICB9KS5hZGRUbyh0aGlzLm1hcCk7XG5cblxuICAgICAgbGF5ZXIub24oe1xuICAgICAgICBjbGljazogKGUpPT57XG4gICAgICAgICAgY29uc29sZS5sb2coXCJDTElDS0VEIDo6OiBcIiwgZS50YXJnZXQpO1xuICAgICAgICAgIHRoaXMubWFwLmZpdEJvdW5kcyhsYXllci5nZXRCb3VuZHMoKSk7XG5cbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgbGF5ZXIuX2xlYWZsZXRfaWQgPSBmZWF0dXJlLmlkXG4gICAgICAvLyBsYXllci5vbih7XG4gICAgICAgIC8vIG1vdXNlb3ZlcjogaGFuZGxlTW91c2VPdmVyLFxuICAgICAgICAvLyBtb3VzZW91dDogaGFuZGxlTW91c2VPdXRcbiAgICAgIC8vIH0pO1xuICAgIH1cblxuICBfbGF5ZXJTdHlsZSgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZmlsbENvbG9yOiAnZ3JheScsXG4gICAgICBmaWxsT3BhY2l0eTogMC4yLFxuICAgICAgY29sb3I6ICdncmF5JyxcbiAgICAgIG9wYWNpdHk6ICcxJyxcbiAgICAgIHdlaWdodDogMVxuICAgIH07XG4gIH1cblxuICBfY29sb3JEaXN0cmljdChkaXN0cmljdCkge1xuICAgIHZhciBzdGF0dXMgPSB0aGlzLnN0YXR1c0RhdGFbZGlzdHJpY3QucHJvcGVydGllcy5OQU1FIC0gMV0uc3RhdHVzO1xuXG4gICAgc3dpdGNoKHN0YXR1cykge1xuICAgICAgY2FzZSAnRk9SJzpcbiAgICAgICAgcmV0dXJuICcjMWU5MGZmJztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdBR0FJTlNUJzpcbiAgICAgICAgcmV0dXJuICcjRkY0QzUwJztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdUQVJHRVQnOlxuICAgICAgICByZXR1cm4gJyNDQzAwMDQnO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgLy9DYWxsIGdlb2pzb25cbiAgICB0aGlzLmRpc3RyaWN0cyA9IEwuZ2VvSlNPTih0aGlzLmdlb2pzb24sIHtcbiAgICAgIHN0eWxlOiB0aGlzLl9sYXllclN0eWxlLmJpbmQodGhpcyksXG4gICAgICBvbkVhY2hGZWF0dXJlOiB0aGlzLl9vbkVhY2hGZWF0dXJlLmJpbmQodGhpcylcbiAgICB9KVxuICAgIHRoaXMuZGlzdHJpY3RzLmFkZFRvKHRoaXMubWFwKTtcbiAgICB0aGlzLmRpc3RyaWN0cy5icmluZ1RvQmFjaygpO1xuXG4gICAgY29uc29sZS5sb2codGhpcy5sYXllcnMpO1xuICB9XG59XG4iLCIvKipcbiAqIFJlcHJlc2VudGF0aXZlTWFuYWdlclxuICogRmFjaWxpdGF0ZXMgdGhlIHJldHJpZXZhbCBvZiB0aGUgdXNlcidzIFJlcHJlc2VudGF0aXZlIGJhc2VkIG9uIHRoZWlyIEFkZHJlc3NcbiAqKi9cbmNsYXNzIFJlcHJlc2VudGF0aXZlTWFuYWdlciB7XG5cbiAgY29uc3RydWN0b3IobWFwLCBzdGF0dXMsIGNvbnRhY3QpIHtcbiAgICB0aGlzLm1hcCA9IG1hcDtcbiAgICB0aGlzLnN0YXR1cyA9IHN0YXR1cztcbiAgICB0aGlzLmNvbnRhY3QgPSBjb250YWN0O1xuXG4gICAgdGhpcy5yZXByZXNlbnRhdGl2ZUNvbnRhaW5lciA9ICQoXCIjc2VuYXRvci1pbmZvXCIpO1xuICB9XG5cbiAgb25IYXNoY2hhbmdlKG9wdGlvbnMpIHtcbiAgICBjb25zb2xlLmxvZyhcIlJlcHJlc2VudGF0aXZlTWFuYWdlclwiLCBvcHRpb25zKTtcbiAgfVxuXG59XG4iLCIvKipcbiogRmFjaWxpdGF0ZXMgdGhlIHNlYXJjaFxuKi9cblxuY2xhc3MgU2VhcmNoTWFuYWdlciB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy50YXJnZXQgPSAkKFwiI2Zvcm0tYXJlYVwiKTtcbiAgICB0aGlzLmFkZHJlc3NGb3JtID0gJChcIiNmb3JtLWFyZWEgI2FkZHJlc3NcIik7XG5cbiAgICB0aGlzLnNlYXJjaFN1Z2dlc3Rpb25zQ29udGFpbmVyID0gJChcIiNzZWFyY2gtcmVzdWx0c1wiKTtcbiAgICB0aGlzLnNlYXJjaFN1Z2dlc3Rpb25zID0gJChcIiNzZWFyY2gtcmVzdWx0cyB1bFwiKTtcbiAgICB0aGlzLmNob3NlbkxvY2F0aW9uID0gbnVsbDtcblxuICAgIHRoaXMudGltZW91dCA9IG51bGw7XG5cbiAgICB0aGlzLnNlYXJjaFN1Z2dlc3Rpb25zQ29udGFpbmVyLmhpZGUoKTtcbiAgICB0aGlzLl9zdGFydExpc3RlbmVyKCk7XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgfVxuXG4gIF9zdGFydExpc3RlbmVyKCkge1xuICAgIGNvbnN0IHRoYXQgPSB0aGlzO1xuXG4gICAgLy8gTGlzdGVuIHRvIGFkZHJlc3MgY2hhbmdlc1xuICAgIHRoaXMuYWRkcmVzc0Zvcm0uYmluZCgna2V5dXAnLCAoZXYpPT57XG4gICAgICBjb25zdCBhZGRyZXNzID0gZXYudGFyZ2V0LnZhbHVlO1xuXG4gICAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KTtcbiAgICAgIHRoaXMudGltZW91dCA9IHNldFRpbWVvdXQoKCk9PntcbiAgICAgICAgLy9GaWx0ZXIgdGhlIGFkZHJlc3Nlc1xuICAgICAgICAkLmdldEpTT04oJ2h0dHBzOi8vbm9taW5hdGltLm9wZW5zdHJlZXRtYXAub3JnL3NlYXJjaC8nICsgZW5jb2RlVVJJQ29tcG9uZW50KGFkZHJlc3MpICsgJz9mb3JtYXQ9anNvbicsXG4gICAgICAgIChkYXRhKSA9PiB7XG4gICAgICAgICAgdGhhdC5zZWFyY2hTdWdnZXN0aW9uc0NvbnRhaW5lci5zaG93KCk7XG4gICAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgICAgICAgICB0aGF0LnJlbmRlcigpO1xuICAgICAgICB9KTtcbiAgICAgIH0sIDUwMCk7XG4gICAgfSlcblxuICAgIC8vTGlzdGVuIHRvIGNsaWNraW5nIG9mIHN1Z2dlc3Rpb25zXG4gICAgdGhhdC5zZWFyY2hTdWdnZXN0aW9uc0NvbnRhaW5lci5vbihcImNsaWNrXCIsIFwiYVwiLCAoZXYpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwiVGVzdFwiKTtcbiAgICAgIHRoYXQuc2VhcmNoU3VnZ2VzdGlvbnNDb250YWluZXIuaGlkZSgpO1xuICAgIH0pXG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgdGhpcy5zZWFyY2hTdWdnZXN0aW9ucy5lbXB0eSgpO1xuICAgIGlmICh0aGlzLmRhdGEpIHtcbiAgICAgIHRoaXMuc2VhcmNoU3VnZ2VzdGlvbnMuYXBwZW5kKFxuICAgICAgICB0aGlzLmRhdGEuc2xpY2UoMCw1KS5tYXAoKGl0ZW0pPT5gXG4gICAgICAgIDxsaT5cbiAgICAgICAgICA8ZGl2IGNsYXNzPSdzdWdnZXN0aW9uJyBsb249XCIke2l0ZW0ubG9ufVwiIGxhdD1cIiR7aXRlbS5sYXR9XCI+XG4gICAgICAgICAgICA8YSBocmVmPScjbG9uPSR7aXRlbS5sb259JmxhdD0ke2l0ZW0ubGF0fSc+JHtpdGVtLmRpc3BsYXlfbmFtZX08L2E+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvbGk+YClcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbn1cbiIsImNsYXNzIFN0b3JpZXNMaXN0TWFuYWdlciB7XG4gIGNvbnN0cnVjdG9yKGdlb2pzb24sIHN0YXR1c0RhdGEsIGNvbnRhY3QsIHN0b3JpZXMpIHtcbiAgICB0aGlzLmdlb2pzb24gPSBnZW9qc29uO1xuICAgIHRoaXMuc3RhdHVzRGF0YSA9IHN0YXR1c0RhdGE7XG4gICAgdGhpcy5jb250YWN0ID0gY29udGFjdDtcbiAgICB0aGlzLnN0b3JpZXMgPSBzdG9yaWVzO1xuXG4gICAgdGhpcy5zdG9yaWVzTGlzdCA9ICQoXCIjc3Rvcmllc1wiKTtcbiAgfVxuXG4gIG9uSGFzaGNoYW5nZShvcHRpb25zKSB7XG4gICAgY29uc29sZS5sb2coXCJTdG9yaWVzTGlzdE1hbmFnZXJcIiwgb3B0aW9ucyk7XG4gIH1cbn1cbiIsIlxuY2xhc3MgQXBwIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIHRoaXMuTWFwID0gbnVsbDtcbiAgICB0aGlzLnJlbmRlcigpO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIC8vTG9hZGluZyBkYXRhLi4uXG4gICAgdmFyIG1hcEZldGNoID0gJC5nZXRKU09OKCcvZGF0YS9ueXMtc2VuYXRlbWFwLmpzb24nKTtcbiAgICB2YXIgc2VuYXRvclN0YXR1c0ZldGNoID0gJC5nZXRKU09OKCcvZGF0YS9zdGF0dXMuanNvbicpO1xuICAgIHZhciBzdGF0ZVNlbmF0b3JzSW5mbyA9ICQuZ2V0SlNPTignL2RhdGEvc3RhdGUtc2VuYXRvcnMuanNvbicpO1xuICAgIHZhciBzdG9yaWVzSW5mbyA9ICQuZ2V0SlNPTignL2RhdGEvc3Rvcmllcy5qc29uJyk7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICQud2hlbihtYXBGZXRjaCwgc2VuYXRvclN0YXR1c0ZldGNoLCBzdGF0ZVNlbmF0b3JzSW5mbywgc3Rvcmllc0luZm8pLnRoZW4oXG4gICAgICAoZ2VvanNvbiwgc3RhdHVzRGF0YSwgY29udGFjdCwgc3Rvcmllcyk9PntcbiAgICAgIHRoYXQuTWFwID0gbmV3IE1hcE1hbmFnZXIoZ2VvanNvblswXSwgc3RhdHVzRGF0YVswXSwgY29udGFjdFswXSwgc3Rvcmllc1swXSk7XG4gICAgICB0aGF0LlN0b3J5TGlzdCA9IG5ldyBTdG9yaWVzTGlzdE1hbmFnZXIoZ2VvanNvblswXSwgc3RhdHVzRGF0YVswXSwgY29udGFjdFswXSwgc3Rvcmllc1swXSk7XG4gICAgICB0aGF0LlNlYXJjaCA9IG5ldyBTZWFyY2hNYW5hZ2VyKCk7XG4gICAgICB0aGF0LlJlcCA9IG5ldyBSZXByZXNlbnRhdGl2ZU1hbmFnZXIodGhhdC5NYXAsIHN0YXR1c0RhdGFbMF0sIGNvbnRhY3RbMF0pO1xuICAgICAgdGhhdC5fbGlzdGVuVG9XaW5kb3coKTtcbiAgICB9KTtcbiAgfVxuXG4gIF9saXN0ZW5Ub1dpbmRvdygpIHtcblxuICAgICQod2luZG93KS5vbignaGFzaGNoYW5nZScsICgpPT57XG4gICAgICBpZiAod2luZG93LmxvY2F0aW9uLmhhc2ggJiYgd2luZG93LmxvY2F0aW9uLmhhc2gubGVuZ3RoID4gMClcbiAgICAgIHtcbiAgICAgICAgY29uc3QgaGFzaCA9ICQuZGVwYXJhbSh3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHJpbmcoMSkpO1xuXG4gICAgICAgIC8vIFRyaWdnZXIgdmFyaW91cyBtYW5hZ2Vyc1xuICAgICAgICB0aGlzLlN0b3J5TGlzdC5vbkhhc2hjaGFuZ2UoaGFzaCk7XG4gICAgICAgIHRoaXMuUmVwLm9uSGFzaGNoYW5nZShoYXNoKTtcblxuICAgICAgfVxuICAgIH0pXG4gIH1cbn1cblxud2luZG93LkFwcE1hbmFnZXIgPSBuZXcgQXBwKHt9KTtcbiJdfQ==
