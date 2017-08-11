'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var STORY_ICON = L.icon({
  iconUrl: '/images/health.png',

  iconSize: [20, 20], // size of the icon
  iconAnchor: [10, 10], // point of the icon which will correspond to marker's location
  popupAnchor: [0, -10] // point from which the popup should open relative to the iconAnchor
});

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
    key: '_renderStory',
    value: function _renderStory(event) {
      var popup;
      var story = event.target.options.story;

      var content = '<div class=\'user-popup-content\'>\n        <div class=\'user-info\'>\n          <img src=\'/images/health.png\' class=\'health-icon\'/>\n          <h4>\n            ' + story.Name + '\n          </h4>\n          <h5>' + story.Address + '</h5>\n        </div>\n        <hr />\n        <div class=\'user-feature\'>\n          <section class="user-image-container ' + (story.Image === '' ? 'no-image' : '') + '">\n            <div style="background-image: url(' + story.Image + ')"/>\n          </section>\n          <section class=\'user-video-container ' + (story.Video === '' ? 'no-video' : '') + '\'>\n            <iframe src="' + story.Video + '" width="320" height="215" scrolling="no" frameborder="0" allowfullscreen></iframe>\n          </section>\n          <section class="user-story-text ' + (story.Text === '' ? 'no-text' : '') + '">\n            <p>' + story.Text + '</p>\n          </section>\n        </div>\n      </div>';

      popup = L.popup({
        closeButton: true,
        className: 'user-popup-item'
      });

      popup.setContent(content);
      setTimeout(function () {
        event.target.bindPopup(popup).openPopup();
      }, 100);
    }
  }, {
    key: 'render',
    value: function render() {
      var _this = this;

      //Call geojson
      this.districts = L.geoJSON(this.geojson, {
        style: this._layerStyle.bind(this),
        onEachFeature: this._onEachFeature.bind(this)
      });
      this.districts.addTo(this.map);
      this.districts.bringToBack();

      //Add the stories


      this.stories.forEach(function (item) {
        // console.log(item, [item.Lat, item.Lon]);
        L.marker(L.latLng(item.Lat, item.Lon), { icon: STORY_ICON, story: item }).on({
          click: _this._renderStory.bind(_this)
        }).addTo(_this.map);
      });
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvbWFwLmpzIiwiY2xhc3Nlcy9yZXByZXNlbnRhdGl2ZS5qcyIsImNsYXNzZXMvc2VhcmNoLmpzIiwiY2xhc3Nlcy9zdG9yaWVzbGlzdC5qcyIsImFwcC5qcyJdLCJuYW1lcyI6WyJTVE9SWV9JQ09OIiwiTCIsImljb24iLCJpY29uVXJsIiwiaWNvblNpemUiLCJpY29uQW5jaG9yIiwicG9wdXBBbmNob3IiLCJNYXBNYW5hZ2VyIiwiZ2VvanNvbiIsInN0YXR1c0RhdGEiLCJjb250YWN0Iiwic3RvcmllcyIsIm1hcCIsInNldFZpZXciLCJ0aWxlTGF5ZXIiLCJtYXhab29tIiwiYXR0cmlidXRpb24iLCJhZGRUbyIsInJlbmRlciIsImV2ZW50IiwicG9wdXAiLCJzZW5hdG9yIiwidGFyZ2V0Iiwib3B0aW9ucyIsIm1vcmVJbmZvIiwiY29udGVudCIsImltYWdlIiwibmFtZSIsInBhcnR5IiwiZGlzdHJpY3QiLCJzdGF0dXMiLCJjbG9zZUJ1dHRvbiIsImNsYXNzTmFtZSIsInNldENvbnRlbnQiLCJiaW5kUG9wdXAiLCJvcGVuUG9wdXAiLCJmZWF0dXJlIiwibGF5ZXIiLCJ0aGF0IiwicHJvcGVydGllcyIsIk5BTUUiLCJjaXJjbGVNYXJrZXIiLCJnZXRCb3VuZHMiLCJnZXRDZW50ZXIiLCJyYWRpdXMiLCJmaWxsQ29sb3IiLCJfY29sb3JEaXN0cmljdCIsImNvbG9yIiwib3BhY2l0eSIsImZpbGxPcGFjaXR5Iiwib24iLCJjbGljayIsIl9yZW5kZXJCdWJibGUiLCJiaW5kIiwiZSIsIndpbmRvdyIsImxvY2F0aW9uIiwiaGFzaCIsImxhdGxuZyIsImxhdCIsImxuZyIsIl9sZWFmbGV0X2lkIiwiaWQiLCJ3ZWlnaHQiLCJzZXRTdHlsZSIsIl9sYXllclN0eWxlIiwic3RvcnkiLCJOYW1lIiwiQWRkcmVzcyIsIkltYWdlIiwiVmlkZW8iLCJUZXh0Iiwic2V0VGltZW91dCIsImRpc3RyaWN0cyIsImdlb0pTT04iLCJzdHlsZSIsIm9uRWFjaEZlYXR1cmUiLCJfb25FYWNoRmVhdHVyZSIsImJyaW5nVG9CYWNrIiwiZm9yRWFjaCIsIm1hcmtlciIsImxhdExuZyIsIml0ZW0iLCJMYXQiLCJMb24iLCJfcmVuZGVyU3RvcnkiLCJsZWFmbGV0UGlwIiwicG9pbnRJbkxheWVyIiwiZml0Qm91bmRzIiwiYW5pbWF0ZSIsImVhY2hMYXllciIsIl9yZXNldExheWVyU3R5bGUiLCJfY2hvc2VuU3R5bGUiLCJSZXByZXNlbnRhdGl2ZU1hbmFnZXIiLCJyZXByZXNlbnRhdGl2ZUNvbnRhaW5lciIsIiQiLCJhZGRFdmVudHMiLCJlbXB0eSIsInBhcnRpZXMiLCJwYXJ0eUxpc3QiLCJzcGxpdCIsInRvU3RyaW5nIiwiaSIsImpvaW4iLCJyZXBUb1JlbmRlciIsInBob25lIiwiZGlzdHJpY3ROdW1iZXIiLCJwYXJzZUludCIsImZpbHRlciIsImNvbnRhY3RPZlJlcCIsImh0bWwiLCJyZW5kZXJQYXJ0aWVzIiwicmVuZGVyVGhhbmtzIiwicmVuZGVyVXJnZSIsIlNlYXJjaE1hbmFnZXIiLCJhZGRyZXNzRm9ybSIsInNlYXJjaFN1Z2dlc3Rpb25zQ29udGFpbmVyIiwic2VhcmNoU3VnZ2VzdGlvbnMiLCJjaG9zZW5Mb2NhdGlvbiIsInRpbWVvdXQiLCJoaWRlIiwiX3N0YXJ0TGlzdGVuZXIiLCJldiIsImFkZHJlc3MiLCJ2YWx1ZSIsImNsZWFyVGltZW91dCIsImdldEpTT04iLCJlbmNvZGVVUklDb21wb25lbnQiLCJkYXRhIiwic2hvdyIsImZpbmQiLCJhcHBlbmQiLCJzbGljZSIsImxvbiIsImRpc3BsYXlfbmFtZSIsIlN0b3JpZXNMaXN0TWFuYWdlciIsInN0b3JpZXNMaXN0IiwiQXBwIiwiTWFwIiwibWFwRmV0Y2giLCJzZW5hdG9yU3RhdHVzRmV0Y2giLCJzdGF0ZVNlbmF0b3JzSW5mbyIsInN0b3JpZXNJbmZvIiwid2hlbiIsInRoZW4iLCJTdG9yeUxpc3QiLCJTZWFyY2giLCJSZXAiLCJfbGlzdGVuVG9XaW5kb3ciLCJsZW5ndGgiLCJkZXBhcmFtIiwic3Vic3RyaW5nIiwibGlzdE5lYXJieVN0b3JpZXMiLCJzaG93UmVwcmVzZW50YXRpdmUiLCJmb2N1c09uRGlzdHJpY3QiLCJ0cmlnZ2VyIiwiQXBwTWFuYWdlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsSUFBTUEsYUFBYUMsRUFBRUMsSUFBRixDQUFPO0FBQ3RCQyxXQUFTLG9CQURhOztBQUd0QkMsWUFBYyxDQUFDLEVBQUQsRUFBSyxFQUFMLENBSFEsRUFHRTtBQUN4QkMsY0FBYyxDQUFDLEVBQUQsRUFBSyxFQUFMLENBSlEsRUFJRTtBQUN4QkMsZUFBYyxDQUFDLENBQUQsRUFBSSxDQUFDLEVBQUwsQ0FMUSxDQUtDO0FBTEQsQ0FBUCxDQUFuQjs7SUFRTUM7QUFDSixzQkFBWUMsT0FBWixFQUFxQkMsVUFBckIsRUFBaUNDLE9BQWpDLEVBQTBDQyxPQUExQyxFQUFtRDtBQUFBOztBQUVqRDtBQUNBLFNBQUtDLEdBQUwsR0FBVyxJQUFJWCxFQUFFVyxHQUFOLENBQVUsS0FBVixFQUFpQkMsT0FBakIsQ0FBeUIsQ0FBQyxNQUFELEVBQVEsQ0FBQyxNQUFULENBQXpCLEVBQTJDLElBQTNDLENBQVg7QUFDQVosTUFBRWEsU0FBRixDQUFZLDhFQUFaLEVBQTRGO0FBQzFGQyxlQUFTLEVBRGlGO0FBRTFGQyxtQkFBYTtBQUY2RSxLQUE1RixFQUdHQyxLQUhILENBR1MsS0FBS0wsR0FIZDs7QUFNQSxTQUFLSCxVQUFMLEdBQWtCQSxVQUFsQjtBQUNBLFNBQUtELE9BQUwsR0FBZUEsT0FBZjtBQUNBLFNBQUtFLE9BQUwsR0FBZUEsT0FBZjtBQUNBLFNBQUtDLE9BQUwsR0FBZUEsT0FBZjs7QUFFQSxTQUFLTyxNQUFMO0FBQ0Q7O0FBRUQ7Ozs7Ozs7O2tDQUljQyxPQUFPOztBQUVuQixVQUFJQyxLQUFKO0FBQ0EsVUFBSUMsVUFBVUYsTUFBTUcsTUFBTixDQUFhQyxPQUFiLENBQXFCZCxVQUFuQztBQUNBLFVBQUllLFdBQVdMLE1BQU1HLE1BQU4sQ0FBYUMsT0FBYixDQUFxQmIsT0FBcEM7O0FBRUEsVUFBSWUsNkhB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YyxJQUFJaEMsYUFBSixFQUFkO0FBQ0E1RSxhQUFLNkcsR0FBTCxHQUFXLElBQUl0RCxxQkFBSixDQUEwQnZELEtBQUtvRyxHQUEvQixFQUFvQ2pJLFdBQVcsQ0FBWCxDQUFwQyxFQUFtREMsUUFBUSxDQUFSLENBQW5ELENBQVg7QUFDQTRCLGFBQUs4RyxlQUFMO0FBQ0QsT0FQRDtBQVFEOzs7c0NBRWlCO0FBQUE7O0FBRWhCckQsUUFBRXhDLE1BQUYsRUFBVUwsRUFBVixDQUFhLFlBQWIsRUFBMkIsWUFBSTtBQUM3QixZQUFJSyxPQUFPQyxRQUFQLENBQWdCQyxJQUFoQixJQUF3QkYsT0FBT0MsUUFBUCxDQUFnQkMsSUFBaEIsQ0FBcUI0RixNQUFyQixHQUE4QixDQUExRCxFQUNBO0FBQ0UsY0FBTTVGLE9BQU9zQyxFQUFFdUQsT0FBRixDQUFVL0YsT0FBT0MsUUFBUCxDQUFnQkMsSUFBaEIsQ0FBcUI4RixTQUFyQixDQUErQixDQUEvQixDQUFWLENBQWI7O0FBRUEsY0FBTXRFLFNBQVMsSUFBSWhGLEVBQUVnRixNQUFOLENBQWF4QixLQUFLRSxHQUFsQixFQUF1QkYsS0FBSzRFLEdBQTVCLENBQWY7QUFDQTtBQUNBLGdCQUFLWSxTQUFMLENBQWVPLGlCQUFmLENBQWlDdkUsTUFBakM7QUFDQSxnQkFBS2tFLEdBQUwsQ0FBU00sa0JBQVQsQ0FBNEJ4RSxNQUE1QjtBQUNBLGdCQUFLeUQsR0FBTCxDQUFTZ0IsZUFBVCxDQUF5QnpFLE1BQXpCO0FBQ0Q7QUFDRixPQVhEO0FBWUFjLFFBQUV4QyxNQUFGLEVBQVVvRyxPQUFWLENBQWtCLFlBQWxCO0FBQ0Q7Ozs7OztBQUdIcEcsT0FBT3FHLFVBQVAsR0FBb0IsSUFBSW5CLEdBQUosQ0FBUSxFQUFSLENBQXBCIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IFNUT1JZX0lDT04gPSBMLmljb24oe1xuICAgIGljb25Vcmw6ICcvaW1hZ2VzL2hlYWx0aC5wbmcnLFxuXG4gICAgaWNvblNpemU6ICAgICBbMjAsIDIwXSwgLy8gc2l6ZSBvZiB0aGUgaWNvblxuICAgIGljb25BbmNob3I6ICAgWzEwLCAxMF0sIC8vIHBvaW50IG9mIHRoZSBpY29uIHdoaWNoIHdpbGwgY29ycmVzcG9uZCB0byBtYXJrZXIncyBsb2NhdGlvblxuICAgIHBvcHVwQW5jaG9yOiAgWzAsIC0xMF0gLy8gcG9pbnQgZnJvbSB3aGljaCB0aGUgcG9wdXAgc2hvdWxkIG9wZW4gcmVsYXRpdmUgdG8gdGhlIGljb25BbmNob3Jcbn0pO1xuXG5jbGFzcyBNYXBNYW5hZ2VyIHtcbiAgY29uc3RydWN0b3IoZ2VvanNvbiwgc3RhdHVzRGF0YSwgY29udGFjdCwgc3Rvcmllcykge1xuXG4gICAgLy9Jbml0aWFsaXppbmcgTWFwXG4gICAgdGhpcy5tYXAgPSBuZXcgTC5tYXAoJ21hcCcpLnNldFZpZXcoWzQyLjg2MywtNzQuNzUyXSwgNi41NSk7XG4gICAgTC50aWxlTGF5ZXIoJ2h0dHBzOi8vY2FydG9kYi1iYXNlbWFwcy17c30uZ2xvYmFsLnNzbC5mYXN0bHkubmV0L2xpZ2h0X2FsbC97en0ve3h9L3t5fS5wbmcnLCB7XG4gICAgICBtYXhab29tOiAxOCxcbiAgICAgIGF0dHJpYnV0aW9uOiAnJmNvcHk7IDxhIGhyZWY9XCJodHRwOi8vd3d3Lm9wZW5zdHJlZXRtYXAub3JnL2NvcHlyaWdodFwiPk9wZW5TdHJlZXRNYXA8L2E+LCAmY29weTs8YSBocmVmPVwiaHR0cHM6Ly9jYXJ0by5jb20vYXR0cmlidXRpb25cIj5DQVJUTzwvYT4uIEludGVyYWN0aXZpdHkgYnkgPGEgaHJlZj1cIi8vYWN0aW9uYmxpdHoub3JnXCI+QWN0aW9uQmxpdHo8L2E+J1xuICAgIH0pLmFkZFRvKHRoaXMubWFwKTtcblxuXG4gICAgdGhpcy5zdGF0dXNEYXRhID0gc3RhdHVzRGF0YTtcbiAgICB0aGlzLmdlb2pzb24gPSBnZW9qc29uO1xuICAgIHRoaXMuY29udGFjdCA9IGNvbnRhY3Q7XG4gICAgdGhpcy5zdG9yaWVzID0gc3RvcmllcztcblxuICAgIHRoaXMucmVuZGVyKCk7XG4gIH1cblxuICAvKioqXG4gICogcHJpdmF0ZSBtZXRob2QgX3JlbmRlckJ1YmJsZVxuICAqXG4gICovXG4gIF9yZW5kZXJCdWJibGUoZXZlbnQpIHtcblxuICAgIHZhciBwb3B1cDtcbiAgICB2YXIgc2VuYXRvciA9IGV2ZW50LnRhcmdldC5vcHRpb25zLnN0YXR1c0RhdGE7XG4gICAgdmFyIG1vcmVJbmZvID0gZXZlbnQudGFyZ2V0Lm9wdGlvbnMuY29udGFjdDtcblxuICAgIHZhciBjb250ZW50ID0gKFxuICAgICAgYDxkaXYgY2xhc3M9J3NlbmF0b3ItcG9wdXAtY29udGVudCc+XG4gICAgICAgIDxzZWN0aW9uIGNsYXNzPVwic2VuYXRvci1pbWFnZS1jb250YWluZXJcIj5cbiAgICAgICAgICA8aW1nIHNyYz1cIiR7c2VuYXRvci5pbWFnZX1cIiAvPlxuICAgICAgICA8L3NlY3Rpb24+XG4gICAgICAgIDxzZWN0aW9uIGNsYXNzPVwic2VuYXRvci1pbmZvXCI+XG4gICAgICAgICAgPGg0PiR7c2VuYXRvci5uYW1lfTwvaDQ+XG4gICAgICAgICAgPGRpdj5QYXJ0eTogJHttb3JlSW5mby5wYXJ0eX08L2Rpdj5cbiAgICAgICAgICA8ZGl2PlNlbmF0ZSBEaXN0cmljdCAke3NlbmF0b3IuZGlzdHJpY3R9PC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cIiR7KHNlbmF0b3Iuc3RhdHVzID09PSAnRk9SJykgPyAndm90ZXMteWVzJyA6ICd2b3Rlcy1ubyd9XCI+XG4gICAgICAgICAgICAgICR7c2VuYXRvci5zdGF0dXMgPT09ICdUQVJHRVQnID8gJ0hpZ2ggcHJpb3JpdHknIDogKHNlbmF0b3Iuc3RhdHVzID09PSAnRk9SJykgPyAnQ28tU3BvbnNvcicgOiAnTm90IFlldCBTdXBwb3J0aXZlJ31cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgICA8YSBocmVmPVwiJHttb3JlSW5mby5jb250YWN0fVwiIGNsYXNzPVwiY29udGFjdC1saW5rXCIgdGFyZ2V0PVwiX2JsYW5rXCI+Q29udGFjdDwvYnV0dG9uPlxuICAgICAgPC9kaXY+YCk7XG5cbiAgICBwb3B1cCA9IEwucG9wdXAoe1xuICAgICAgY2xvc2VCdXR0b246IHRydWUsXG4gICAgICBjbGFzc05hbWU6ICdzZW5hdG9yLXBvcHVwJyxcbiAgICAgfSk7XG5cbiAgICBwb3B1cC5zZXRDb250ZW50KGNvbnRlbnQpO1xuICAgIGV2ZW50LnRhcmdldC5iaW5kUG9wdXAocG9wdXApLm9wZW5Qb3B1cCgpO1xuICB9XG5cbiAgX29uRWFjaEZlYXR1cmUoZmVhdHVyZSwgbGF5ZXIpIHtcbiAgICAgIC8vXG4gICAgICAvL1xuICAgICAgY29uc3QgdGhhdCA9IHRoaXM7XG5cbiAgICAgIHZhciBzdGF0dXMgPSB0aGlzLnN0YXR1c0RhdGFbZmVhdHVyZS5wcm9wZXJ0aWVzLk5BTUUgLSAxXS5zdGF0dXM7XG5cbiAgICAgIC8vIENyZWF0ZSBDaXJjbGUgTWFya2VyXG4gICAgICBMLmNpcmNsZU1hcmtlcihsYXllci5nZXRCb3VuZHMoKS5nZXRDZW50ZXIoKSwge1xuICAgICAgICByYWRpdXM6IDcsXG4gICAgICAgIGZpbGxDb2xvcjogdGhpcy5fY29sb3JEaXN0cmljdChmZWF0dXJlKSxcbiAgICAgICAgY29sb3I6ICd3aGl0ZScsXG4gICAgICAgIG9wYWNpdHk6IDEsXG4gICAgICAgIGZpbGxPcGFjaXR5OiAwLjcsXG5cbiAgICAgICAgLy9EYXRhXG4gICAgICAgIHN0YXR1c0RhdGE6IHRoaXMuc3RhdHVzRGF0YVtmZWF0dXJlLnByb3BlcnRpZXMuTkFNRSAtIDFdLFxuICAgICAgICBjb250YWN0OiB0aGlzLmNvbnRhY3RbZmVhdHVyZS5wcm9wZXJ0aWVzLk5BTUUgLSAxXSxcbiAgICAgIH0pXG4gICAgICAub24oe1xuICAgICAgICBjbGljazogdGhpcy5fcmVuZGVyQnViYmxlLmJpbmQodGhpcyksXG4gICAgICB9KS5hZGRUbyh0aGlzLm1hcCk7XG5cblxuICAgICAgbGF5ZXIub24oe1xuICAgICAgICBjbGljazogKGUpPT57XG5cbiAgICAgICAgICAvLyB0aGlzLm1hcC5maXRCb3VuZHMobGF5ZXIuZ2V0Qm91bmRzKCkpO1xuICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gYCNsYXQ9JHtlLmxhdGxuZy5sYXR9Jmxvbj0ke2UubGF0bG5nLmxuZ31gXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIGxheWVyLl9sZWFmbGV0X2lkID0gZmVhdHVyZS5pZFxuICAgICAgLy8gbGF5ZXIub24oe1xuICAgICAgICAvLyBtb3VzZW92ZXI6IGhhbmRsZU1vdXNlT3ZlcixcbiAgICAgICAgLy8gbW91c2VvdXQ6IGhhbmRsZU1vdXNlT3V0XG4gICAgICAvLyB9KTtcbiAgICB9XG5cbiAgX2xheWVyU3R5bGUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGZpbGxDb2xvcjogJ2dyYXknLFxuICAgICAgZmlsbE9wYWNpdHk6IDAuMDEsXG4gICAgICBjb2xvcjogJ2dyYXknLFxuICAgICAgb3BhY2l0eTogJzEnLFxuICAgICAgd2VpZ2h0OiAxXG4gICAgfTtcbiAgfVxuICBfY2hvc2VuU3R5bGUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGZpbGxDb2xvcjogJ3llbGxvdycsXG4gICAgICBmaWxsT3BhY2l0eTogMC4xXG4gICAgfVxuICB9XG5cbiAgX3Jlc2V0TGF5ZXJTdHlsZShsYXllcikge1xuICAgIGxheWVyLnNldFN0eWxlKHRoaXMuX2xheWVyU3R5bGUoKSk7XG4gIH1cblxuICBfY29sb3JEaXN0cmljdChkaXN0cmljdCkge1xuICAgIHZhciBzdGF0dXMgPSB0aGlzLnN0YXR1c0RhdGFbZGlzdHJpY3QucHJvcGVydGllcy5OQU1FIC0gMV0uc3RhdHVzO1xuXG4gICAgc3dpdGNoKHN0YXR1cykge1xuICAgICAgY2FzZSAnRk9SJzpcbiAgICAgICAgcmV0dXJuICdsaWdodGdyZWVuJztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdBR0FJTlNUJzpcbiAgICAgICAgcmV0dXJuICcjRkY0QzUwJztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdUQVJHRVQnOlxuICAgICAgICByZXR1cm4gJyNDQzAwMDQnO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBfcmVuZGVyU3RvcnkoZXZlbnQpIHtcbiAgICB2YXIgcG9wdXA7XG4gICAgdmFyIHN0b3J5ID0gZXZlbnQudGFyZ2V0Lm9wdGlvbnMuc3Rvcnk7XG5cbiAgICB2YXIgY29udGVudCA9IChcbiAgICAgIGA8ZGl2IGNsYXNzPSd1c2VyLXBvcHVwLWNvbnRlbnQnPlxuICAgICAgICA8ZGl2IGNsYXNzPSd1c2VyLWluZm8nPlxuICAgICAgICAgIDxpbWcgc3JjPScvaW1hZ2VzL2hlYWx0aC5wbmcnIGNsYXNzPSdoZWFsdGgtaWNvbicvPlxuICAgICAgICAgIDxoND5cbiAgICAgICAgICAgICR7c3RvcnkuTmFtZX1cbiAgICAgICAgICA8L2g0PlxuICAgICAgICAgIDxoNT4ke3N0b3J5LkFkZHJlc3N9PC9oNT5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxociAvPlxuICAgICAgICA8ZGl2IGNsYXNzPSd1c2VyLWZlYXR1cmUnPlxuICAgICAgICAgIDxzZWN0aW9uIGNsYXNzPVwidXNlci1pbWFnZS1jb250YWluZXIgJHtzdG9yeS5JbWFnZT09PScnPyduby1pbWFnZSc6Jyd9XCI+XG4gICAgICAgICAgICA8ZGl2IHN0eWxlPVwiYmFja2dyb3VuZC1pbWFnZTogdXJsKCR7c3RvcnkuSW1hZ2V9KVwiLz5cbiAgICAgICAgICA8L3NlY3Rpb24+XG4gICAgICAgICAgPHNlY3Rpb24gY2xhc3M9J3VzZXItdmlkZW8tY29udGFpbmVyICR7c3RvcnkuVmlkZW89PT0nJz8nbm8tdmlkZW8nOicnfSc+XG4gICAgICAgICAgICA8aWZyYW1lIHNyYz1cIiR7c3RvcnkuVmlkZW99XCIgd2lkdGg9XCIzMjBcIiBoZWlnaHQ9XCIyMTVcIiBzY3JvbGxpbmc9XCJub1wiIGZyYW1lYm9yZGVyPVwiMFwiIGFsbG93ZnVsbHNjcmVlbj48L2lmcmFtZT5cbiAgICAgICAgICA8L3NlY3Rpb24+XG4gICAgICAgICAgPHNlY3Rpb24gY2xhc3M9XCJ1c2VyLXN0b3J5LXRleHQgJHtzdG9yeS5UZXh0ID09PSAnJyA/ICduby10ZXh0JyA6ICcnfVwiPlxuICAgICAgICAgICAgPHA+JHtzdG9yeS5UZXh0fTwvcD5cbiAgICAgICAgICA8L3NlY3Rpb24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+YCk7XG5cbiAgICBwb3B1cCA9IEwucG9wdXAoe1xuICAgICAgY2xvc2VCdXR0b246IHRydWUsXG4gICAgICBjbGFzc05hbWU6ICd1c2VyLXBvcHVwLWl0ZW0nLFxuICAgICB9KTtcblxuICAgIHBvcHVwLnNldENvbnRlbnQoY29udGVudCk7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBldmVudC50YXJnZXQuYmluZFBvcHVwKHBvcHVwKS5vcGVuUG9wdXAoKTtcbiAgICB9LCAxMDApXG5cbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICAvL0NhbGwgZ2VvanNvblxuICAgIHRoaXMuZGlzdHJpY3RzID0gTC5nZW9KU09OKHRoaXMuZ2VvanNvbiwge1xuICAgICAgc3R5bGU6IHRoaXMuX2xheWVyU3R5bGUuYmluZCh0aGlzKSxcbiAgICAgIG9uRWFjaEZlYXR1cmU6IHRoaXMuX29uRWFjaEZlYXR1cmUuYmluZCh0aGlzKVxuICAgIH0pXG4gICAgdGhpcy5kaXN0cmljdHMuYWRkVG8odGhpcy5tYXApO1xuICAgIHRoaXMuZGlzdHJpY3RzLmJyaW5nVG9CYWNrKCk7XG5cbiAgICAvL0FkZCB0aGUgc3Rvcmllc1xuXG5cblxuICAgIHRoaXMuc3Rvcmllcy5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgLy8gY29uc29sZS5sb2coaXRlbSwgW2l0ZW0uTGF0LCBpdGVtLkxvbl0pO1xuICAgICAgTC5tYXJrZXIoTC5sYXRMbmcoaXRlbS5MYXQsIGl0ZW0uTG9uKSwge2ljb246IFNUT1JZX0lDT04sIHN0b3J5OiBpdGVtfSlcbiAgICAgICAgLm9uKHtcbiAgICAgICAgICBjbGljazogdGhpcy5fcmVuZGVyU3RvcnkuYmluZCh0aGlzKSxcbiAgICAgICAgfSlcbiAgICAgICAgLmFkZFRvKHRoaXMubWFwKTtcbiAgICB9KVxuXG4gIH1cblxuICAvL0ZpdEJvdW5kcyBvbiB0aGUgZGlzdHJpY3RcbiAgZm9jdXNPbkRpc3RyaWN0KGxhdExuZykge1xuICAgIGNvbnN0IHRhcmdldCA9IGxlYWZsZXRQaXAucG9pbnRJbkxheWVyKGxhdExuZywgdGhpcy5kaXN0cmljdHMsIHRydWUpWzBdO1xuXG4gICAgaWYgKHRhcmdldCkge1xuICAgICAgdGhpcy5tYXAuZml0Qm91bmRzKHRhcmdldC5nZXRCb3VuZHMoKSwgeyBhbmltYXRlOiBmYWxzZSB9KTtcbiAgICAgIHRoaXMuZGlzdHJpY3RzLmVhY2hMYXllcih0aGlzLl9yZXNldExheWVyU3R5bGUuYmluZCh0aGlzKSk7XG4gICAgICB0YXJnZXQuc2V0U3R5bGUodGhpcy5fY2hvc2VuU3R5bGUoKSlcbiAgICAgIC8vUmVmcmVzaCB3aG9sZSBtYXBcbiAgICB9XG5cblxuXG4gIH1cbn1cbiIsIi8qKlxuICogUmVwcmVzZW50YXRpdmVNYW5hZ2VyXG4gKiBGYWNpbGl0YXRlcyB0aGUgcmV0cmlldmFsIG9mIHRoZSB1c2VyJ3MgUmVwcmVzZW50YXRpdmUgYmFzZWQgb24gdGhlaXIgQWRkcmVzc1xuICoqL1xuY2xhc3MgUmVwcmVzZW50YXRpdmVNYW5hZ2VyIHtcblxuICBjb25zdHJ1Y3RvcihtYXAsIHN0YXR1cywgY29udGFjdCkge1xuICAgIHRoaXMubWFwID0gbWFwO1xuICAgIHRoaXMuc3RhdHVzID0gc3RhdHVzO1xuICAgIHRoaXMuY29udGFjdCA9IGNvbnRhY3Q7XG5cbiAgICB0aGlzLnJlcHJlc2VudGF0aXZlQ29udGFpbmVyID0gJChcIiNzZW5hdG9yLWluZm9cIik7XG5cbiAgICAvL2NyZWF0ZSBsaXN0ZW5lcnNcbiAgICB0aGlzLmFkZEV2ZW50cygpO1xuICB9XG5cbiAgYWRkRXZlbnRzKCkge1xuICAgIC8vQ2xvc2VcbiAgICB0aGlzLnJlcHJlc2VudGF0aXZlQ29udGFpbmVyLm9uKCdjbGljaycsIFwiYS5jbG9zZVwiLCAoKSA9PiB0aGlzLnJlcHJlc2VudGF0aXZlQ29udGFpbmVyLmVtcHR5KCkpO1xuICB9XG5cbiAgc2hvd1JlcHJlc2VudGF0aXZlKGxhdExuZykge1xuICAgIHRoaXMudGFyZ2V0ID0gbGVhZmxldFBpcC5wb2ludEluTGF5ZXIobGF0TG5nLCB0aGlzLm1hcC5kaXN0cmljdHMsIHRydWUpWzBdO1xuXG5cbiAgICB0aGlzLnJlbmRlcigpO1xuICB9XG5cbiAgcmVuZGVyUGFydGllcyhwYXJ0aWVzKSB7XG4gICAgY29uc3QgcGFydHlMaXN0ID0gcGFydGllcy5zcGxpdCgnLCcpO1xuICAgIGNvbnN0IHRvU3RyaW5nID0gcGFydHlMaXN0Lm1hcChpPT5gPGxpIGNsYXNzPSdwYXJ0eSAke2l9Jz48c3Bhbj4ke2l9PC9zcGFuPjwvbGk+YCkuam9pbignJyk7XG4gICAgcmV0dXJuIGA8dWwgY2xhc3M9J3BhcnRpZXMnPiR7dG9TdHJpbmd9PC91bD5gO1xuICB9XG5cbiAgcmVuZGVyVGhhbmtzKHJlcFRvUmVuZGVyKSB7XG4gICAgcmV0dXJuIGBcbiAgICAgIDxkaXY+XG4gICAgICAgIDxwIGNsYXNzPSdzdGF0dXMnPlxuICAgICAgICAgICR7cmVwVG9SZW5kZXIuc3RhdHVzID09PSBcIkZPUlwiID8gYFNlbi4gJHtyZXBUb1JlbmRlci5uYW1lfSBpcyA8c3Ryb25nPnN1cHBvcnRpdmU8L3N0cm9uZz4gb2YgdGhlIE5ldyBZb3JrIEhlYWx0aCBBY3QgKFM0ODQwKS4gQ2FsbCB0aGUgc2VuYXRvciB0byB0aGFuayB0aGVtIWBcbiAgICAgICAgICAgIDogYFNlbi4gJHtyZXBUb1JlbmRlci5uYW1lfSBpcyBub3QgeWV0IHN1cHBvcnRpdmUgb2YgdGhlIE5ldyBZb3JrIEhlYWx0aCBBY3QgIChTNDg0MCkuIENhbGwgdGhlbSB0byBlbmNvdXJhZ2UgYW5kIHVyZ2UgdGhlbSB0byBnaXZlIHRoZWlyIHN1cHBvcnQgdG8gdGhpcyBpbXBvcnRhbnQgYmlsbC5gfVxuICAgICAgICA8L3A+XG4gICAgICAgIDxoND5IZXJlJ3MgSG93PC9oND5cbiAgICAgICAgPGg1PjEuIENhbGwgdGhlIHNlbmF0b3IgYXQgPGkgY2xhc3M9XCJmYSBmYS1waG9uZVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvaT4gJHtyZXBUb1JlbmRlci5waG9uZX08L2g1PlxuICAgICAgICA8aDU+Mi4gVGhhbmsgdGhlbSB0aHJvdWdoIHRoZWlyIHN0YWZmITwvaDU+XG4gICAgICAgIDxwPlRoZSBzdGFmZmVyIHdpbGwgbWFrZSBzdXJlIHRoYXQgeW91ciBtZXNzYWdlIGlzIHNlbnQgdG8gdGhlIHNlbmF0b3IuPC9wPlxuICAgICAgICA8c3ViPlNhbXBsZSBNZXNzYWdlPC9zdWI+XG4gICAgICAgIDxibG9ja3F1b3RlPlxuICAgICAgICAgIEhpISBNeSBuYW1lIGlzIF9fX19fXy4gSSBhbSBhIGNvbnN0aXR1ZW50IG9mIFNlbi4gJHtyZXBUb1JlbmRlci5uYW1lfSBhdCB6aXBjb2RlIF9fX19fLiBJIGFtIHNlbmRpbmcgbXkgdGhhbmtzIHRvIHRoZSBzZW5hdG9yIGZvciBzdXBwb3J0aW5nIGFuZCBjby1zcG9uc29yaW5nIHRoZSBOZXcgWW9yayBIZWFsdGggQWN0IChTNDg0MCkuXG4gICAgICAgICAgSGVhbHRoIGNhcmUgaXMgYSB2ZXJ5IGltcG9ydGFudCBpc3N1ZSBmb3IgbWUsIGFuZCB0aGUgc2VuYXRvcidzIHN1cHBvcnQgbWVhbnMgYSBsb3QuIFRoYW5rIHlvdSFcbiAgICAgICAgPC9ibG9ja3F1b3RlPlxuICAgICAgICA8aDU+My4gVGVsbCB5b3VyIGZyaWVuZHMgdG8gY2FsbCE8L2g1PlxuICAgICAgICA8cD5TaGFyZSB0aGlzIHBhZ2Ugd2l0aCB5b3VyIGZyaWVuZHMgYW5kIHVyZ2UgdGhlbSB0byBjYWxsIHlvdXIgc2VuYXRvciE8L3A+XG4gICAgICA8L2Rpdj5cbiAgICBgXG4gIH1cblxuICByZW5kZXJVcmdlKHJlcFRvUmVuZGVyKSB7XG4gICAgcmV0dXJuIGBcbiAgICA8ZGl2PlxuICAgICAgPHAgY2xhc3M9J3N0YXR1cyc+XG4gICAgICAgICR7cmVwVG9SZW5kZXIuc3RhdHVzID09PSBcIkZPUlwiID8gYFNlbi4gJHtyZXBUb1JlbmRlci5uYW1lfSBpcyA8c3Ryb25nPnN1cHBvcnRpdmU8L3N0cm9uZz4gb2YgdGhlIE5ldyBZb3JrIEhlYWx0aCBBY3QgKFM0ODQwKS4gQ2FsbCB0aGUgc2VuYXRvciB0byB0aGFuayB0aGVtIWBcbiAgICAgICAgICA6IGBTZW4uICR7cmVwVG9SZW5kZXIubmFtZX0gaXMgPHN0cm9uZyBjbGFzcz0nbm90Jz5ub3QgeWV0IHN1cHBvcnRpdmU8L3N0cm9uZz4gb2YgdGhlIE5ldyBZb3JrIEhlYWx0aCBBY3QgIChTNDg0MCkuIENhbGwgdGhlbSB0byBlbmNvdXJhZ2UgYW5kIHVyZ2UgdGhlbSB0byBnaXZlIHRoZWlyIHN1cHBvcnQgdG8gdGhpcyBpbXBvcnRhbnQgYmlsbC5gfVxuICAgICAgPC9wPlxuICAgICAgPGg0PkhlcmUncyBIb3c8L2g0PlxuICAgICAgPGg1PjEuIENhbGwgdGhlIHNlbmF0b3IgYXQgPGkgY2xhc3M9XCJmYSBmYS1waG9uZVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvaT4gJHtyZXBUb1JlbmRlci5waG9uZX08L2g1PlxuICAgICAgPGg1PjIuIFRhbGsgdG8gdGhlbSBhYm91dCB5b3VyIHN1cHBvcnQhPC9oNT5cbiAgICAgIDxwPllvdSB3aWxsIG1vc3QgbGlrZWx5IHRhbGsgd2l0aCBhIHN0YWZmZXIuIFRlbGwgdGhlbSBhYm91dCB5b3VyIHN0b3J5LiBUaGUgc3RhZmZlciB3aWxsIG1ha2Ugc3VyZSB0aGF0IHlvdXIgbWVzc2FnZSBpcyBzZW50IHRvIHRoZSBzZW5hdG9yLjwvcD5cbiAgICAgIDxzdWI+U2FtcGxlIE1lc3NhZ2U8L3N1Yj5cbiAgICAgIDxibG9ja3F1b3RlPlxuICAgICAgICBIaSEgTXkgbmFtZSBpcyBfX19fX18uIEkgYW0gYSBjb25zdGl0dWVudCBvZiBTZW4uICR7cmVwVG9SZW5kZXIubmFtZX0gYXQgemlwY29kZSBfX19fXy5cbiAgICAgICAgSSBhbSBzdHJvbmdseSB1cmdpbmcgdGhlIHNlbmF0b3IgdG8gc3VwcG9ydCBhbmQgY28tc3BvbnNvciB0aGUgTmV3IFlvcmsgSGVhbHRoIEFjdCAoUzQ4NDApLlxuICAgICAgICBIZWFsdGggY2FyZSBpcyBhIHZlcnkgaW1wb3J0YW50IGlzc3VlIGZvciBtZSwgYW5kIHRoZSBzZW5hdG9yJ3Mgc3VwcG9ydCBtZWFucyBhIGxvdC4gVGhhbmsgeW91IVxuICAgICAgPC9ibG9ja3F1b3RlPlxuICAgICAgPGg1PjMuIFRlbGwgeW91ciBmcmllbmRzIHRvIGNhbGwhPC9oNT5cbiAgICAgIDxwPlNoYXJlIHRoaXMgcGFnZSB3aXRoIHlvdXIgZnJpZW5kcyBhbmQgdXJnZSB0aGVtIHRvIGNhbGwgeW91ciBzZW5hdG9yITwvcD5cbiAgICA8L2Rpdj5cbiAgICBgXG4gIH1cbiAgcmVuZGVyKCkge1xuICAgIGlmICghdGhpcy50YXJnZXQpIHJldHVybiBudWxsO1xuXG4gICAgY29uc3QgZGlzdHJpY3ROdW1iZXIgPSBwYXJzZUludCh0aGlzLnRhcmdldC5mZWF0dXJlLnByb3BlcnRpZXMuTkFNRSk7XG4gICAgY29uc3QgcmVwVG9SZW5kZXIgPSB0aGlzLnN0YXR1cy5maWx0ZXIoaT0+aS5kaXN0cmljdCA9PSBkaXN0cmljdE51bWJlcilbMF07XG4gICAgY29uc3QgY29udGFjdE9mUmVwID0gdGhpcy5jb250YWN0LmZpbHRlcihpPT5pLmRpc3RyaWN0ID09IGRpc3RyaWN0TnVtYmVyKVswXTtcblxuXG4gICAgdGhpcy5yZXByZXNlbnRhdGl2ZUNvbnRhaW5lci5odG1sKFxuICAgICAgYDxkaXY+XG4gICAgICAgIDxhIGhyZWY9XCJqYXZhc2NyaXB0OiB2b2lkKG51bGwpXCIgY2xhc3M9J2Nsb3NlJz48aSBjbGFzcz1cImZhIGZhLXRpbWVzLWNpcmNsZS1vXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC9pPjwvYT5cbiAgICAgICAgPGg1IGNsYXNzPSd5b3VyLXNlbmF0b3InPllvdXIgU3RhdGUgU2VuYXRvcjwvaDU+XG4gICAgICAgIDxkaXYgY2xhc3M9J2Jhc2ljLWluZm8nPlxuICAgICAgICAgIDxpbWcgc3JjPScke2NvbnRhY3RPZlJlcC5pbWFnZX0nIGNsYXNzPSdyZXAtcGljJyAvPlxuICAgICAgICAgIDxoNT5OWSBEaXN0cmljdCAke3JlcFRvUmVuZGVyLmRpc3RyaWN0fTwvaDU+XG4gICAgICAgICAgPGg0PiR7cmVwVG9SZW5kZXIubmFtZX08L2g0PlxuICAgICAgICAgIDxwPiR7dGhpcy5yZW5kZXJQYXJ0aWVzKGNvbnRhY3RPZlJlcC5wYXJ0eSl9PC9wPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz0nYWN0aW9uLWFyZWEnPlxuICAgICAgICAgICR7cmVwVG9SZW5kZXIuc3RhdHVzID09PSBcIkZPUlwiID8gdGhpcy5yZW5kZXJUaGFua3MocmVwVG9SZW5kZXIpIDogdGhpcy5yZW5kZXJVcmdlKHJlcFRvUmVuZGVyKSB9XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPSd3ZWJzaXRlJz5cbiAgICAgICAgICA8YSBocmVmPScke3JlcFRvUmVuZGVyLmNvbnRhY3R9JyB0YXJnZXQ9J19ibGFuayc+TW9yZSB3YXlzIHRvIGNvbnRhY3QgPHN0cm9uZz5TZW4uICR7cmVwVG9SZW5kZXIubmFtZX08L3N0cm9uZz48L2E+XG4gICAgICAgIDxkaXY+XG4gICAgICAgPC9kaXY+YFxuICAgICk7XG4gIH1cblxufVxuIiwiLyoqXG4qIEZhY2lsaXRhdGVzIHRoZSBzZWFyY2hcbiovXG5cbmNsYXNzIFNlYXJjaE1hbmFnZXIge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMudGFyZ2V0ID0gJChcIiNmb3JtLWFyZWFcIik7XG4gICAgdGhpcy5hZGRyZXNzRm9ybSA9ICQoXCIjZm9ybS1hcmVhICNhZGRyZXNzXCIpO1xuXG4gICAgdGhpcy5zZWFyY2hTdWdnZXN0aW9uc0NvbnRhaW5lciA9ICQoXCIjc2VhcmNoLXJlc3VsdHNcIik7XG4gICAgdGhpcy5zZWFyY2hTdWdnZXN0aW9ucyA9ICQoXCIjc2VhcmNoLXJlc3VsdHMgdWxcIik7XG4gICAgdGhpcy5jaG9zZW5Mb2NhdGlvbiA9IG51bGw7XG5cbiAgICB0aGlzLnRpbWVvdXQgPSBudWxsO1xuXG4gICAgdGhpcy5zZWFyY2hTdWdnZXN0aW9uc0NvbnRhaW5lci5oaWRlKCk7XG4gICAgdGhpcy5fc3RhcnRMaXN0ZW5lcigpO1xuICAgIHRoaXMucmVuZGVyKCk7XG4gIH1cblxuICBfc3RhcnRMaXN0ZW5lcigpIHtcbiAgICBjb25zdCB0aGF0ID0gdGhpcztcblxuICAgIC8vIExpc3RlbiB0byBhZGRyZXNzIGNoYW5nZXNcbiAgICB0aGlzLmFkZHJlc3NGb3JtLmJpbmQoJ2tleXVwJywgKGV2KT0+e1xuICAgICAgY29uc3QgYWRkcmVzcyA9IGV2LnRhcmdldC52YWx1ZTtcblxuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dCk7XG4gICAgICB0aGlzLnRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpPT57XG4gICAgICAgIC8vRmlsdGVyIHRoZSBhZGRyZXNzZXNcbiAgICAgICAgJC5nZXRKU09OKCdodHRwczovL25vbWluYXRpbS5vcGVuc3RyZWV0bWFwLm9yZy9zZWFyY2gvJyArIGVuY29kZVVSSUNvbXBvbmVudChhZGRyZXNzKSArICc/Zm9ybWF0PWpzb24nLFxuICAgICAgICAoZGF0YSkgPT4ge1xuICAgICAgICAgIHRoYXQuc2VhcmNoU3VnZ2VzdGlvbnNDb250YWluZXIuc2hvdygpO1xuICAgICAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XG4gICAgICAgICAgdGhhdC5yZW5kZXIoKTtcbiAgICAgICAgfSk7XG4gICAgICB9LCA1MDApO1xuICAgIH0pXG5cbiAgICB0aGlzLnRhcmdldC5maW5kKFwiZm9ybVwiKS5vbihcInN1Ym1pdFwiLCAoKSA9PnsgcmV0dXJuIGZhbHNlOyB9KTtcblxuICAgIC8vTGlzdGVuIHRvIGNsaWNraW5nIG9mIHN1Z2dlc3Rpb25zXG4gICAgdGhhdC5zZWFyY2hTdWdnZXN0aW9uc0NvbnRhaW5lci5vbihcImNsaWNrXCIsIFwiYVwiLCAoZXYpID0+IHtcblxuICAgICAgdGhhdC5zZWFyY2hTdWdnZXN0aW9uc0NvbnRhaW5lci5oaWRlKCk7XG4gICAgfSlcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICB0aGlzLnNlYXJjaFN1Z2dlc3Rpb25zLmVtcHR5KCk7XG4gICAgaWYgKHRoaXMuZGF0YSkge1xuICAgICAgdGhpcy5zZWFyY2hTdWdnZXN0aW9ucy5hcHBlbmQoXG4gICAgICAgIHRoaXMuZGF0YS5zbGljZSgwLDEwKS5tYXAoKGl0ZW0pPT5gXG4gICAgICAgIDxsaT5cbiAgICAgICAgICA8ZGl2IGNsYXNzPSdzdWdnZXN0aW9uJyBsb249XCIke2l0ZW0ubG9ufVwiIGxhdD1cIiR7aXRlbS5sYXR9XCI+XG4gICAgICAgICAgICA8YSBocmVmPScjbG9uPSR7aXRlbS5sb259JmxhdD0ke2l0ZW0ubGF0fSc+JHtpdGVtLmRpc3BsYXlfbmFtZX08L2E+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvbGk+YClcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbn1cbiIsImNsYXNzIFN0b3JpZXNMaXN0TWFuYWdlciB7XG4gIGNvbnN0cnVjdG9yKGdlb2pzb24sIHN0YXR1c0RhdGEsIGNvbnRhY3QsIHN0b3JpZXMpIHtcbiAgICB0aGlzLmdlb2pzb24gPSBnZW9qc29uO1xuICAgIHRoaXMuc3RhdHVzRGF0YSA9IHN0YXR1c0RhdGE7XG4gICAgdGhpcy5jb250YWN0ID0gY29udGFjdDtcbiAgICB0aGlzLnN0b3JpZXMgPSBzdG9yaWVzO1xuXG4gICAgdGhpcy5zdG9yaWVzTGlzdCA9ICQoXCIjc3Rvcmllc1wiKTtcbiAgfVxuXG4gIGxpc3ROZWFyYnlTdG9yaWVzKGxhdExuZykge1xuICAgIFxuICB9XG59XG4iLCJcbmNsYXNzIEFwcCB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICB0aGlzLk1hcCA9IG51bGw7XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICAvL0xvYWRpbmcgZGF0YS4uLlxuICAgIHZhciBtYXBGZXRjaCA9ICQuZ2V0SlNPTignL2RhdGEvbnlzLXNlbmF0ZW1hcC5qc29uJyk7XG4gICAgdmFyIHNlbmF0b3JTdGF0dXNGZXRjaCA9ICQuZ2V0SlNPTignL2RhdGEvc3RhdHVzLmpzb24nKTtcbiAgICB2YXIgc3RhdGVTZW5hdG9yc0luZm8gPSAkLmdldEpTT04oJy9kYXRhL3N0YXRlLXNlbmF0b3JzLmpzb24nKTtcbiAgICB2YXIgc3Rvcmllc0luZm8gPSAkLmdldEpTT04oJy9kYXRhL3N0b3JpZXMuanNvbicpO1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAkLndoZW4obWFwRmV0Y2gsIHNlbmF0b3JTdGF0dXNGZXRjaCwgc3RhdGVTZW5hdG9yc0luZm8sIHN0b3JpZXNJbmZvKS50aGVuKFxuICAgICAgKGdlb2pzb24sIHN0YXR1c0RhdGEsIGNvbnRhY3QsIHN0b3JpZXMpPT57XG4gICAgICB0aGF0Lk1hcCA9IG5ldyBNYXBNYW5hZ2VyKGdlb2pzb25bMF0sIHN0YXR1c0RhdGFbMF0sIGNvbnRhY3RbMF0sIHN0b3JpZXNbMF0pO1xuICAgICAgdGhhdC5TdG9yeUxpc3QgPSBuZXcgU3Rvcmllc0xpc3RNYW5hZ2VyKGdlb2pzb25bMF0sIHN0YXR1c0RhdGFbMF0sIGNvbnRhY3RbMF0sIHN0b3JpZXNbMF0pO1xuICAgICAgdGhhdC5TZWFyY2ggPSBuZXcgU2VhcmNoTWFuYWdlcigpO1xuICAgICAgdGhhdC5SZXAgPSBuZXcgUmVwcmVzZW50YXRpdmVNYW5hZ2VyKHRoYXQuTWFwLCBzdGF0dXNEYXRhWzBdLCBjb250YWN0WzBdKTtcbiAgICAgIHRoYXQuX2xpc3RlblRvV2luZG93KCk7XG4gICAgfSk7XG4gIH1cblxuICBfbGlzdGVuVG9XaW5kb3coKSB7XG5cbiAgICAkKHdpbmRvdykub24oJ2hhc2hjaGFuZ2UnLCAoKT0+e1xuICAgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5oYXNoICYmIHdpbmRvdy5sb2NhdGlvbi5oYXNoLmxlbmd0aCA+IDApXG4gICAgICB7XG4gICAgICAgIGNvbnN0IGhhc2ggPSAkLmRlcGFyYW0od2luZG93LmxvY2F0aW9uLmhhc2guc3Vic3RyaW5nKDEpKTtcblxuICAgICAgICBjb25zdCBsYXRMbmcgPSBuZXcgTC5sYXRMbmcoaGFzaC5sYXQsIGhhc2gubG9uKTtcbiAgICAgICAgLy8gVHJpZ2dlciB2YXJpb3VzIG1hbmFnZXJzXG4gICAgICAgIHRoaXMuU3RvcnlMaXN0Lmxpc3ROZWFyYnlTdG9yaWVzKGxhdExuZyk7XG4gICAgICAgIHRoaXMuUmVwLnNob3dSZXByZXNlbnRhdGl2ZShsYXRMbmcpO1xuICAgICAgICB0aGlzLk1hcC5mb2N1c09uRGlzdHJpY3QobGF0TG5nKVxuICAgICAgfVxuICAgIH0pO1xuICAgICQod2luZG93KS50cmlnZ2VyKFwiaGFzaGNoYW5nZVwiKTtcbiAgfVxufVxuXG53aW5kb3cuQXBwTWFuYWdlciA9IG5ldyBBcHAoe30pO1xuIl19
