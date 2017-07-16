"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ListManager = function ListManager(geojson, statusData, contact, stories) {
  _classCallCheck(this, ListManager);

  this.geojson = geojson;
  this.statusData = statusData;
  this.contact = contact;
  this.stories = stories;

  this.senatorInfo = $("#senator-info");
  this.storiesList = $("#stories");
};
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
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy;<a href="https://carto.com/attribution">CARTO</a>'
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

      // layer.on({
      // mouseover: handleMouseOver,
      // mouseout: handleMouseOut
      // });
    }
  }, {
    key: '_layerStyle',
    value: function _layerStyle() {
      return {
        fillColor: 'none',
        color: 'gray',
        opacity: '1'
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
      L.geoJSON(this.geojson, {
        style: this._layerStyle.bind(this),
        onEachFeature: this._onEachFeature.bind(this)
      });
    }
  }]);

  return MapManager;
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
      this.searchSuggestions.append(this.data.slice(0, 5).map(function (item) {
        return "\n      <li>\n        <div class='suggestion' lon=\"" + item.lon + "\" lat=\"" + item.lat + "\">\n          <a href='#lon=" + item.lon + "&lat=" + item.lat + "'>" + item.display_name + "</a>\n        </div>\n      </li>";
      }));
    }
  }]);

  return SearchManager;
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
      var _this = this;

      //Loading data...
      var mapFetch = $.getJSON('/data/nys-senatemap.json');
      var senatorStatusFetch = $.getJSON('/data/status.json');
      var stateSenatorsInfo = $.getJSON('/data/state-senators.json');
      var storiesInfo = $.getJSON('/data/stories.json');

      $.when(mapFetch, senatorStatusFetch, stateSenatorsInfo, storiesInfo).then(function (geojson, statusData, contact, stories) {
        _this.Map = new MapManager(geojson[0], statusData[0], contact[0], stories[0]);
        _this.List = new ListManager(geojson[0], statusData[0], contact[0], stories[0]);
        _this.Search = new SearchManager();
      });
    }
  }]);

  return App;
}();

new App({});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvbGlzdC5qcyIsImNsYXNzZXMvbWFwLmpzIiwiY2xhc3Nlcy9zZWFyY2guanMiLCJhcHAuanMiXSwibmFtZXMiOlsiTGlzdE1hbmFnZXIiLCJnZW9qc29uIiwic3RhdHVzRGF0YSIsImNvbnRhY3QiLCJzdG9yaWVzIiwic2VuYXRvckluZm8iLCIkIiwic3Rvcmllc0xpc3QiLCJNYXBNYW5hZ2VyIiwibWFwIiwiTCIsInNldFZpZXciLCJ0aWxlTGF5ZXIiLCJtYXhab29tIiwiYXR0cmlidXRpb24iLCJhZGRUbyIsInJlbmRlciIsImV2ZW50IiwicG9wdXAiLCJzZW5hdG9yIiwidGFyZ2V0Iiwib3B0aW9ucyIsIm1vcmVJbmZvIiwiY29udGVudCIsImltYWdlIiwibmFtZSIsInBhcnR5IiwiZGlzdHJpY3QiLCJzdGF0dXMiLCJjbG9zZUJ1dHRvbiIsImNsYXNzTmFtZSIsInNldENvbnRlbnQiLCJiaW5kUG9wdXAiLCJvcGVuUG9wdXAiLCJmZWF0dXJlIiwibGF5ZXIiLCJ0aGF0IiwicHJvcGVydGllcyIsIk5BTUUiLCJjaXJjbGVNYXJrZXIiLCJnZXRCb3VuZHMiLCJnZXRDZW50ZXIiLCJyYWRpdXMiLCJmaWxsQ29sb3IiLCJfY29sb3JEaXN0cmljdCIsImNvbG9yIiwib3BhY2l0eSIsImZpbGxPcGFjaXR5Iiwib24iLCJjbGljayIsIl9yZW5kZXJCdWJibGUiLCJiaW5kIiwiZ2VvSlNPTiIsInN0eWxlIiwiX2xheWVyU3R5bGUiLCJvbkVhY2hGZWF0dXJlIiwiX29uRWFjaEZlYXR1cmUiLCJTZWFyY2hNYW5hZ2VyIiwiYWRkcmVzc0Zvcm0iLCJzZWFyY2hTdWdnZXN0aW9uc0NvbnRhaW5lciIsInNlYXJjaFN1Z2dlc3Rpb25zIiwiY2hvc2VuTG9jYXRpb24iLCJ0aW1lb3V0IiwiaGlkZSIsIl9zdGFydExpc3RlbmVyIiwiZXYiLCJhZGRyZXNzIiwidmFsdWUiLCJjbGVhclRpbWVvdXQiLCJzZXRUaW1lb3V0IiwiZ2V0SlNPTiIsImVuY29kZVVSSUNvbXBvbmVudCIsImRhdGEiLCJzaG93IiwiY29uc29sZSIsImxvZyIsImVtcHR5IiwiYXBwZW5kIiwic2xpY2UiLCJpdGVtIiwibG9uIiwibGF0IiwiZGlzcGxheV9uYW1lIiwiQXBwIiwiTWFwIiwibWFwRmV0Y2giLCJzZW5hdG9yU3RhdHVzRmV0Y2giLCJzdGF0ZVNlbmF0b3JzSW5mbyIsInN0b3JpZXNJbmZvIiwid2hlbiIsInRoZW4iLCJMaXN0IiwiU2VhcmNoIl0sIm1hcHBpbmdzIjoiOzs7O0lBQU1BLGNBQ0oscUJBQVlDLE9BQVosRUFBcUJDLFVBQXJCLEVBQWlDQyxPQUFqQyxFQUEwQ0MsT0FBMUMsRUFBbUQ7QUFBQTs7QUFDakQsT0FBS0gsT0FBTCxHQUFlQSxPQUFmO0FBQ0EsT0FBS0MsVUFBTCxHQUFrQkEsVUFBbEI7QUFDQSxPQUFLQyxPQUFMLEdBQWVBLE9BQWY7QUFDQSxPQUFLQyxPQUFMLEdBQWVBLE9BQWY7O0FBRUEsT0FBS0MsV0FBTCxHQUFtQkMsRUFBRSxlQUFGLENBQW5CO0FBQ0EsT0FBS0MsV0FBTCxHQUFtQkQsRUFBRSxVQUFGLENBQW5CO0FBRUQ7Ozs7Ozs7SUNWR0U7QUFDSixzQkFBWVAsT0FBWixFQUFxQkMsVUFBckIsRUFBaUNDLE9BQWpDLEVBQTBDO0FBQUE7O0FBRXhDO0FBQ0EsU0FBS00sR0FBTCxHQUFXLElBQUlDLEVBQUVELEdBQU4sQ0FBVSxLQUFWLEVBQWlCRSxPQUFqQixDQUF5QixDQUFDLE1BQUQsRUFBUSxDQUFDLE1BQVQsQ0FBekIsRUFBMkMsSUFBM0MsQ0FBWDtBQUNBRCxNQUFFRSxTQUFGLENBQVksOEVBQVosRUFBNEY7QUFDMUZDLGVBQVMsRUFEaUY7QUFFMUZDLG1CQUFhO0FBRjZFLEtBQTVGLEVBR0dDLEtBSEgsQ0FHUyxLQUFLTixHQUhkOztBQU1BLFNBQUtQLFVBQUwsR0FBa0JBLFVBQWxCO0FBQ0EsU0FBS0QsT0FBTCxHQUFlQSxPQUFmO0FBQ0EsU0FBS0UsT0FBTCxHQUFlQSxPQUFmOztBQUVBLFNBQUthLE1BQUw7QUFDRDs7QUFFRDs7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TUFBTCxHQUFjLElBQUluQyxhQUFKLEVBQWQ7QUFDRCxPQUxEO0FBUUQ7Ozs7OztBQUdILElBQUkwQixHQUFKLENBQVEsRUFBUiIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBMaXN0TWFuYWdlciB7XG4gIGNvbnN0cnVjdG9yKGdlb2pzb24sIHN0YXR1c0RhdGEsIGNvbnRhY3QsIHN0b3JpZXMpIHtcbiAgICB0aGlzLmdlb2pzb24gPSBnZW9qc29uO1xuICAgIHRoaXMuc3RhdHVzRGF0YSA9IHN0YXR1c0RhdGE7XG4gICAgdGhpcy5jb250YWN0ID0gY29udGFjdDtcbiAgICB0aGlzLnN0b3JpZXMgPSBzdG9yaWVzO1xuXG4gICAgdGhpcy5zZW5hdG9ySW5mbyA9ICQoXCIjc2VuYXRvci1pbmZvXCIpO1xuICAgIHRoaXMuc3Rvcmllc0xpc3QgPSAkKFwiI3N0b3JpZXNcIik7XG5cbiAgfVxufVxuIiwiY2xhc3MgTWFwTWFuYWdlciB7XG4gIGNvbnN0cnVjdG9yKGdlb2pzb24sIHN0YXR1c0RhdGEsIGNvbnRhY3QpIHtcblxuICAgIC8vSW5pdGlhbGl6aW5nIE1hcFxuICAgIHRoaXMubWFwID0gbmV3IEwubWFwKCdtYXAnKS5zZXRWaWV3KFs0Mi44NjMsLTc0Ljc1Ml0sIDYuNTUpO1xuICAgIEwudGlsZUxheWVyKCdodHRwczovL2NhcnRvZGItYmFzZW1hcHMte3N9Lmdsb2JhbC5zc2wuZmFzdGx5Lm5ldC9saWdodF9hbGwve3p9L3t4fS97eX0ucG5nJywge1xuICAgICAgbWF4Wm9vbTogMTgsXG4gICAgICBhdHRyaWJ1dGlvbjogJyZjb3B5OyA8YSBocmVmPVwiaHR0cDovL3d3dy5vcGVuc3RyZWV0bWFwLm9yZy9jb3B5cmlnaHRcIj5PcGVuU3RyZWV0TWFwPC9hPiwgJmNvcHk7PGEgaHJlZj1cImh0dHBzOi8vY2FydG8uY29tL2F0dHJpYnV0aW9uXCI+Q0FSVE88L2E+J1xuICAgIH0pLmFkZFRvKHRoaXMubWFwKTtcblxuXG4gICAgdGhpcy5zdGF0dXNEYXRhID0gc3RhdHVzRGF0YTtcbiAgICB0aGlzLmdlb2pzb24gPSBnZW9qc29uO1xuICAgIHRoaXMuY29udGFjdCA9IGNvbnRhY3Q7XG5cbiAgICB0aGlzLnJlbmRlcigpO1xuICB9XG5cbiAgLyoqKlxuICAqIHByaXZhdGUgbWV0aG9kIF9yZW5kZXJCdWJibGVcbiAgKlxuICAqL1xuICBfcmVuZGVyQnViYmxlKGV2ZW50KSB7XG5cbiAgICB2YXIgcG9wdXA7XG4gICAgdmFyIHNlbmF0b3IgPSBldmVudC50YXJnZXQub3B0aW9ucy5zdGF0dXNEYXRhO1xuICAgIHZhciBtb3JlSW5mbyA9IGV2ZW50LnRhcmdldC5vcHRpb25zLmNvbnRhY3Q7XG5cbiAgICB2YXIgY29udGVudCA9IChcbiAgICAgIGA8ZGl2PlxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJzZW5hdG9yLWltYWdlLWNvbnRhaW5lclwiPlxuICAgICAgICAgIDxpbWcgc3JjPVwiJHtzZW5hdG9yLmltYWdlfVwiIC8+XG4gICAgICAgIDwvc2VjdGlvbj5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwic2VuYXRvci1pbmZvXCI+XG4gICAgICAgICAgPGRpdj4ke3NlbmF0b3IubmFtZX08L2Rpdj5cbiAgICAgICAgICA8ZGl2PlBhcnR5OiAke21vcmVJbmZvLnBhcnR5fTwvZGl2PlxuICAgICAgICAgIDxkaXY+U2VuYXRlIERpc3RyaWN0ICR7c2VuYXRvci5kaXN0cmljdH08L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiJHsoc2VuYXRvci5zdGF0dXMgPT09ICdGT1InKSA/ICd2b3Rlcy15ZXMnIDogJ3ZvdGVzLW5vJ31cIj5cbiAgICAgICAgICAgICAgJHtzZW5hdG9yLnN0YXR1cyA9PT0gJ1RBUkdFVCcgPyAnSGlnaCBwcmlvcml0eScgOiAoc2VuYXRvci5zdGF0dXMgPT09ICdGT1InKSA/ICdDby1TcG9uc29yJyA6ICdObyBzdXBwb3J0J31cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgICA8YSBocmVmPVwiJHttb3JlSW5mby5jb250YWN0fVwiIGNsYXNzPVwiY29udGFjdC1saW5rXCIgdGFyZ2V0PVwiX2JsYW5rXCI+Q29udGFjdDwvYnV0dG9uPlxuICAgICAgPC9kaXY+YCk7XG5cbiAgICBwb3B1cCA9IEwucG9wdXAoe1xuICAgICAgY2xvc2VCdXR0b246IHRydWUsXG4gICAgICBjbGFzc05hbWU6ICdzZW5hdG9yLXBvcHVwJyxcbiAgICAgfSk7XG5cbiAgICBwb3B1cC5zZXRDb250ZW50KGNvbnRlbnQpO1xuICAgIGV2ZW50LnRhcmdldC5iaW5kUG9wdXAocG9wdXApLm9wZW5Qb3B1cCgpO1xuICB9XG5cbiAgX29uRWFjaEZlYXR1cmUoZmVhdHVyZSwgbGF5ZXIpIHtcbiAgICAgIC8vXG4gICAgICAvLyBjb25zb2xlLmxvZyhzZW5hdG9yc1tmZWF0dXJlLnByb3BlcnRpZXMuTkFNRSAtIDFdLnN0YXR1cylcbiAgICAgIGNvbnN0IHRoYXQgPSB0aGlzO1xuXG4gICAgICB2YXIgc3RhdHVzID0gdGhpcy5zdGF0dXNEYXRhW2ZlYXR1cmUucHJvcGVydGllcy5OQU1FIC0gMV0uc3RhdHVzO1xuXG4gICAgICAvLyBDcmVhdGUgQ2lyY2xlIE1hcmtlclxuICAgICAgTC5jaXJjbGVNYXJrZXIobGF5ZXIuZ2V0Qm91bmRzKCkuZ2V0Q2VudGVyKCksIHtcbiAgICAgICAgcmFkaXVzOiA3LFxuICAgICAgICBmaWxsQ29sb3I6IHRoaXMuX2NvbG9yRGlzdHJpY3QoZmVhdHVyZSksXG4gICAgICAgIGNvbG9yOiAnd2hpdGUnLFxuICAgICAgICBvcGFjaXR5OiAxLFxuICAgICAgICBmaWxsT3BhY2l0eTogMC43LFxuXG4gICAgICAgIC8vRGF0YVxuICAgICAgICBzdGF0dXNEYXRhOiB0aGlzLnN0YXR1c0RhdGFbZmVhdHVyZS5wcm9wZXJ0aWVzLk5BTUUgLSAxXSxcbiAgICAgICAgY29udGFjdDogdGhpcy5jb250YWN0W2ZlYXR1cmUucHJvcGVydGllcy5OQU1FIC0gMV0sXG4gICAgICB9KVxuICAgICAgLm9uKHtcbiAgICAgICAgY2xpY2s6IHRoaXMuX3JlbmRlckJ1YmJsZS5iaW5kKHRoaXMpLFxuICAgICAgfSkuYWRkVG8odGhpcy5tYXApO1xuXG5cbiAgICAgIC8vIGxheWVyLm9uKHtcbiAgICAgICAgLy8gbW91c2VvdmVyOiBoYW5kbGVNb3VzZU92ZXIsXG4gICAgICAgIC8vIG1vdXNlb3V0OiBoYW5kbGVNb3VzZU91dFxuICAgICAgLy8gfSk7XG4gICAgfVxuXG4gIF9sYXllclN0eWxlKCkge1xuICAgIHJldHVybiB7XG4gICAgICBmaWxsQ29sb3I6ICdub25lJyxcbiAgICAgIGNvbG9yOiAnZ3JheScsXG4gICAgICBvcGFjaXR5OiAnMSdcbiAgICB9O1xuICB9XG5cbiAgX2NvbG9yRGlzdHJpY3QoZGlzdHJpY3QpIHtcbiAgICB2YXIgc3RhdHVzID0gdGhpcy5zdGF0dXNEYXRhW2Rpc3RyaWN0LnByb3BlcnRpZXMuTkFNRSAtIDFdLnN0YXR1cztcblxuICAgIHN3aXRjaChzdGF0dXMpIHtcbiAgICAgIGNhc2UgJ0ZPUic6XG4gICAgICAgIHJldHVybiAnIzFlOTBmZic7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnQUdBSU5TVCc6XG4gICAgICAgIHJldHVybiAnI0ZGNEM1MCc7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnVEFSR0VUJzpcbiAgICAgICAgcmV0dXJuICcjQ0MwMDA0JztcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIC8vQ2FsbCBnZW9qc29uXG4gICAgTC5nZW9KU09OKHRoaXMuZ2VvanNvbiwge1xuICAgICAgc3R5bGU6IHRoaXMuX2xheWVyU3R5bGUuYmluZCh0aGlzKSxcbiAgICAgIG9uRWFjaEZlYXR1cmU6IHRoaXMuX29uRWFjaEZlYXR1cmUuYmluZCh0aGlzKVxuICAgIH0pO1xuICB9XG59XG4iLCIvKipcbiogRmFjaWxpdGF0ZXMgdGhlIHNlYXJjaFxuKi9cblxuY2xhc3MgU2VhcmNoTWFuYWdlciB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy50YXJnZXQgPSAkKFwiI2Zvcm0tYXJlYVwiKTtcbiAgICB0aGlzLmFkZHJlc3NGb3JtID0gJChcIiNmb3JtLWFyZWEgI2FkZHJlc3NcIik7XG5cbiAgICB0aGlzLnNlYXJjaFN1Z2dlc3Rpb25zQ29udGFpbmVyID0gJChcIiNzZWFyY2gtcmVzdWx0c1wiKTtcbiAgICB0aGlzLnNlYXJjaFN1Z2dlc3Rpb25zID0gJChcIiNzZWFyY2gtcmVzdWx0cyB1bFwiKTtcbiAgICB0aGlzLmNob3NlbkxvY2F0aW9uID0gbnVsbDtcblxuICAgIHRoaXMudGltZW91dCA9IG51bGw7XG5cbiAgICB0aGlzLnNlYXJjaFN1Z2dlc3Rpb25zQ29udGFpbmVyLmhpZGUoKTtcbiAgICB0aGlzLl9zdGFydExpc3RlbmVyKCk7XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgfVxuXG4gIF9zdGFydExpc3RlbmVyKCkge1xuICAgIGNvbnN0IHRoYXQgPSB0aGlzO1xuXG4gICAgLy8gTGlzdGVuIHRvIGFkZHJlc3MgY2hhbmdlc1xuICAgIHRoaXMuYWRkcmVzc0Zvcm0uYmluZCgna2V5dXAnLCAoZXYpPT57XG4gICAgICBjb25zdCBhZGRyZXNzID0gZXYudGFyZ2V0LnZhbHVlO1xuXG4gICAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KTtcbiAgICAgIHRoaXMudGltZW91dCA9IHNldFRpbWVvdXQoKCk9PntcbiAgICAgICAgLy9GaWx0ZXIgdGhlIGFkZHJlc3Nlc1xuICAgICAgICAkLmdldEpTT04oJ2h0dHBzOi8vbm9taW5hdGltLm9wZW5zdHJlZXRtYXAub3JnL3NlYXJjaC8nICsgZW5jb2RlVVJJQ29tcG9uZW50KGFkZHJlc3MpICsgJz9mb3JtYXQ9anNvbicsXG4gICAgICAgIChkYXRhKSA9PiB7XG4gICAgICAgICAgdGhhdC5zZWFyY2hTdWdnZXN0aW9uc0NvbnRhaW5lci5zaG93KCk7XG4gICAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgICAgICAgICB0aGF0LnJlbmRlcigpO1xuICAgICAgICB9KTtcbiAgICAgIH0sIDUwMCk7XG4gICAgfSlcblxuICAgIC8vTGlzdGVuIHRvIGNsaWNraW5nIG9mIHN1Z2dlc3Rpb25zXG4gICAgdGhhdC5zZWFyY2hTdWdnZXN0aW9uc0NvbnRhaW5lci5vbihcImNsaWNrXCIsIFwiYVwiLCAoZXYpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwiVGVzdFwiKTtcbiAgICAgIHRoYXQuc2VhcmNoU3VnZ2VzdGlvbnNDb250YWluZXIuaGlkZSgpO1xuICAgIH0pXG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgdGhpcy5zZWFyY2hTdWdnZXN0aW9ucy5lbXB0eSgpO1xuICAgIHRoaXMuc2VhcmNoU3VnZ2VzdGlvbnMuYXBwZW5kKFxuICAgICAgdGhpcy5kYXRhLnNsaWNlKDAsNSkubWFwKChpdGVtKT0+YFxuICAgICAgPGxpPlxuICAgICAgICA8ZGl2IGNsYXNzPSdzdWdnZXN0aW9uJyBsb249XCIke2l0ZW0ubG9ufVwiIGxhdD1cIiR7aXRlbS5sYXR9XCI+XG4gICAgICAgICAgPGEgaHJlZj0nI2xvbj0ke2l0ZW0ubG9ufSZsYXQ9JHtpdGVtLmxhdH0nPiR7aXRlbS5kaXNwbGF5X25hbWV9PC9hPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvbGk+YClcbiAgICApO1xuICB9XG5cbn1cbiIsIlxuY2xhc3MgQXBwIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIHRoaXMuTWFwID0gbnVsbDtcbiAgICB0aGlzLnJlbmRlcigpO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIC8vTG9hZGluZyBkYXRhLi4uXG4gICAgdmFyIG1hcEZldGNoID0gJC5nZXRKU09OKCcvZGF0YS9ueXMtc2VuYXRlbWFwLmpzb24nKTtcbiAgICB2YXIgc2VuYXRvclN0YXR1c0ZldGNoID0gJC5nZXRKU09OKCcvZGF0YS9zdGF0dXMuanNvbicpO1xuICAgIHZhciBzdGF0ZVNlbmF0b3JzSW5mbyA9ICQuZ2V0SlNPTignL2RhdGEvc3RhdGUtc2VuYXRvcnMuanNvbicpO1xuICAgIHZhciBzdG9yaWVzSW5mbyA9ICQuZ2V0SlNPTignL2RhdGEvc3Rvcmllcy5qc29uJyk7XG5cbiAgICAkLndoZW4obWFwRmV0Y2gsIHNlbmF0b3JTdGF0dXNGZXRjaCwgc3RhdGVTZW5hdG9yc0luZm8sIHN0b3JpZXNJbmZvKS50aGVuKFxuICAgICAgKGdlb2pzb24sIHN0YXR1c0RhdGEsIGNvbnRhY3QsIHN0b3JpZXMpPT57XG4gICAgICB0aGlzLk1hcCA9IG5ldyBNYXBNYW5hZ2VyKGdlb2pzb25bMF0sIHN0YXR1c0RhdGFbMF0sIGNvbnRhY3RbMF0sIHN0b3JpZXNbMF0pO1xuICAgICAgdGhpcy5MaXN0ID0gbmV3IExpc3RNYW5hZ2VyKGdlb2pzb25bMF0sIHN0YXR1c0RhdGFbMF0sIGNvbnRhY3RbMF0sIHN0b3JpZXNbMF0pO1xuICAgICAgdGhpcy5TZWFyY2ggPSBuZXcgU2VhcmNoTWFuYWdlcigpO1xuICAgIH0pO1xuXG5cbiAgfVxufVxuXG5uZXcgQXBwKHt9KTtcbiJdfQ==
