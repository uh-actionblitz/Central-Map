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

      $.when(mapFetch, senatorStatusFetch, stateSenatorsInfo).then(function (geojson, statusData, contact) {
        _this.Map = new MapManager(geojson[0], statusData[0], contact[0]);
      });
    }
  }]);

  return App;
}();

new App({});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvbWFwLmpzIiwiYXBwLmpzIl0sIm5hbWVzIjpbIk1hcE1hbmFnZXIiLCJnZW9qc29uIiwic3RhdHVzRGF0YSIsImNvbnRhY3QiLCJtYXAiLCJMIiwic2V0VmlldyIsInRpbGVMYXllciIsIm1heFpvb20iLCJhdHRyaWJ1dGlvbiIsImFkZFRvIiwicmVuZGVyIiwiZXZlbnQiLCJwb3B1cCIsInNlbmF0b3IiLCJ0YXJnZXQiLCJvcHRpb25zIiwibW9yZUluZm8iLCJjb250ZW50IiwiaW1hZ2UiLCJuYW1lIiwicGFydHkiLCJkaXN0cmljdCIsInN0YXR1cyIsImNsb3NlQnV0dG9uIiwiY2xhc3NOYW1lIiwic2V0Q29udGVudCIsImJpbmRQb3B1cCIsIm9wZW5Qb3B1cCIsImZlYXR1cmUiLCJsYXllciIsInRoYXQiLCJwcm9wZXJ0aWVzIiwiTkFNRSIsImNpcmNsZU1hcmtlciIsImdldEJvdW5kcyIsImdldENlbnRlciIsInJhZGl1cyIsImZpbGxDb2xvciIsIl9jb2xvckRpc3RyaWN0IiwiY29sb3IiLCJvcGFjaXR5IiwiZmlsbE9wYWNpdHkiLCJvbiIsImNsaWNrIiwiX3JlbmRlckJ1YmJsZSIsImJpbmQiLCJnZW9KU09OIiwic3R5bGUiLCJfbGF5ZXJTdHlsZSIsIm9uRWFjaEZlYXR1cmUiLCJfb25FYWNoRmVhdHVyZSIsIkFwcCIsIk1hcCIsIm1hcEZldGNoIiwiJCIsImdldEpTT04iLCJzZW5hdG9yU3RhdHVzRmV0Y2giLCJzdGF0ZVNlbmF0b3JzSW5mbyIsIndoZW4iLCJ0aGVuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7SUFBTUE7QUFDSixzQkFBWUMsT0FBWixFQUFxQkMsVUFBckIsRUFBaUNDLE9BQWpDLEVBQTBDO0FBQUE7O0FBRXhDO0FBQ0EsU0FBS0MsR0FBTCxHQUFXLElBQUlDLEVBQUVELEdBQU4sQ0FBVSxLQUFWLEVBQWlCRSxPQUFqQixDQUF5QixDQUFDLE1BQUQsRUFBUSxDQUFDLE1BQVQsQ0FBekIsRUFBMkMsSUFBM0MsQ0FBWDtB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QWpCLENBQXNCLElBQXRCLENBRGU7QUFFdEJJLHVCQUFlLEtBQUtDLGNBQUwsQ0FBb0JMLElBQXBCLENBQXlCLElBQXpCO0FBRk8sT0FBeEI7QUFJRDs7Ozs7Ozs7Ozs7SUNoSEdNO0FBQ0osZUFBWXBDLE9BQVosRUFBcUI7QUFBQTs7QUFDbkIsU0FBS3FDLEdBQUwsR0FBVyxJQUFYO0FBQ0EsU0FBSzFDLE1BQUw7QUFDRDs7Ozs2QkFFUTtBQUFBOztBQUNQO0FBQ0EsVUFBSTJDLFdBQVdDLEVBQUVDLE9BQUYsQ0FBVSwwQkFBVixDQUFmO0FBQ0EsVUFBSUMscUJBQXFCRixFQUFFQyxPQUFGLENBQVUsbUJBQVYsQ0FBekI7QUFDQSxVQUFJRSxvQkFBb0JILEVBQUVDLE9BQUYsQ0FBVSwyQkFBVixDQUF4Qjs7QUFFQUQsUUFBRUksSUFBRixDQUFPTCxRQUFQLEVBQWlCRyxrQkFBakIsRUFBcUNDLGlCQUFyQyxFQUF3REUsSUFBeEQsQ0FBNkQsVUFBQzNELE9BQUQsRUFBVUMsVUFBVixFQUFzQkMsT0FBdEIsRUFBZ0M7QUFDM0YsY0FBS2tELEdBQUwsR0FBVyxJQUFJckQsVUFBSixDQUFlQyxRQUFRLENBQVIsQ0FBZixFQUEyQkMsV0FBVyxDQUFYLENBQTNCLEVBQTBDQyxRQUFRLENBQVIsQ0FBMUMsQ0FBWDtBQUNELE9BRkQ7QUFLRDs7Ozs7O0FBR0gsSUFBSWlELEdBQUosQ0FBUSxFQUFSIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIE1hcE1hbmFnZXIge1xuICBjb25zdHJ1Y3RvcihnZW9qc29uLCBzdGF0dXNEYXRhLCBjb250YWN0KSB7XG5cbiAgICAvL0luaXRpYWxpemluZyBNYXBcbiAgICB0aGlzLm1hcCA9IG5ldyBMLm1hcCgnbWFwJykuc2V0VmlldyhbNDIuODYzLC03NC43NTJdLCA2LjU1KTtcbiAgICBMLnRpbGVMYXllcignaHR0cHM6Ly9jYXJ0b2RiLWJhc2VtYXBzLXtzfS5nbG9iYWwuc3NsLmZhc3RseS5uZXQvbGlnaHRfYWxsL3t6fS97eH0ve3l9LnBuZycsIHtcbiAgICAgIG1heFpvb206IDE4LFxuICAgICAgYXR0cmlidXRpb246ICcmY29weTsgPGEgaHJlZj1cImh0dHA6Ly93d3cub3BlbnN0cmVldG1hcC5vcmcvY29weXJpZ2h0XCI+T3BlblN0cmVldE1hcDwvYT4sICZjb3B5OzxhIGhyZWY9XCJodHRwczovL2NhcnRvLmNvbS9hdHRyaWJ1dGlvblwiPkNBUlRPPC9hPidcbiAgICB9KS5hZGRUbyh0aGlzLm1hcCk7XG5cblxuICAgIHRoaXMuc3RhdHVzRGF0YSA9IHN0YXR1c0RhdGE7XG4gICAgdGhpcy5nZW9qc29uID0gZ2VvanNvbjtcbiAgICB0aGlzLmNvbnRhY3QgPSBjb250YWN0O1xuXG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgfVxuXG4gIC8qKipcbiAgKiBwcml2YXRlIG1ldGhvZCBfcmVuZGVyQnViYmxlXG4gICpcbiAgKi9cbiAgX3JlbmRlckJ1YmJsZShldmVudCkge1xuXG4gICAgdmFyIHBvcHVwO1xuICAgIHZhciBzZW5hdG9yID0gZXZlbnQudGFyZ2V0Lm9wdGlvbnMuc3RhdHVzRGF0YTtcbiAgICB2YXIgbW9yZUluZm8gPSBldmVudC50YXJnZXQub3B0aW9ucy5jb250YWN0O1xuXG4gICAgdmFyIGNvbnRlbnQgPSAoXG4gICAgICBgPGRpdj5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwic2VuYXRvci1pbWFnZS1jb250YWluZXJcIj5cbiAgICAgICAgICA8aW1nIHNyYz1cIiR7c2VuYXRvci5pbWFnZX1cIiAvPlxuICAgICAgICA8L3NlY3Rpb24+XG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInNlbmF0b3ItaW5mb1wiPlxuICAgICAgICAgIDxkaXY+JHtzZW5hdG9yLm5hbWV9PC9kaXY+XG4gICAgICAgICAgPGRpdj5QYXJ0eTogJHttb3JlSW5mby5wYXJ0eX08L2Rpdj5cbiAgICAgICAgICA8ZGl2PlNlbmF0ZSBEaXN0cmljdCAke3NlbmF0b3IuZGlzdHJpY3R9PC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cIiR7KHNlbmF0b3Iuc3RhdHVzID09PSAnRk9SJykgPyAndm90ZXMteWVzJyA6ICd2b3Rlcy1ubyd9XCI+XG4gICAgICAgICAgICAgICR7c2VuYXRvci5zdGF0dXMgPT09ICdUQVJHRVQnID8gJ0hpZ2ggcHJpb3JpdHknIDogKHNlbmF0b3Iuc3RhdHVzID09PSAnRk9SJykgPyAnQ28tU3BvbnNvcicgOiAnTm8gc3VwcG9ydCd9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvc2VjdGlvbj5cbiAgICAgICAgPGEgaHJlZj1cIiR7bW9yZUluZm8uY29udGFjdH1cIiBjbGFzcz1cImNvbnRhY3QtbGlua1wiIHRhcmdldD1cIl9ibGFua1wiPkNvbnRhY3Q8L2J1dHRvbj5cbiAgICAgIDwvZGl2PmApO1xuXG4gICAgcG9wdXAgPSBMLnBvcHVwKHtcbiAgICAgIGNsb3NlQnV0dG9uOiB0cnVlLFxuICAgICAgY2xhc3NOYW1lOiAnc2VuYXRvci1wb3B1cCcsXG4gICAgIH0pO1xuXG4gICAgcG9wdXAuc2V0Q29udGVudChjb250ZW50KTtcbiAgICBldmVudC50YXJnZXQuYmluZFBvcHVwKHBvcHVwKS5vcGVuUG9wdXAoKTtcbiAgfVxuXG4gIF9vbkVhY2hGZWF0dXJlKGZlYXR1cmUsIGxheWVyKSB7XG4gICAgICAvL1xuICAgICAgLy8gY29uc29sZS5sb2coc2VuYXRvcnNbZmVhdHVyZS5wcm9wZXJ0aWVzLk5BTUUgLSAxXS5zdGF0dXMpXG4gICAgICBjb25zdCB0aGF0ID0gdGhpcztcblxuICAgICAgdmFyIHN0YXR1cyA9IHRoaXMuc3RhdHVzRGF0YVtmZWF0dXJlLnByb3BlcnRpZXMuTkFNRSAtIDFdLnN0YXR1cztcblxuICAgICAgLy8gQ3JlYXRlIENpcmNsZSBNYXJrZXJcbiAgICAgIEwuY2lyY2xlTWFya2VyKGxheWVyLmdldEJvdW5kcygpLmdldENlbnRlcigpLCB7XG4gICAgICAgIHJhZGl1czogNyxcbiAgICAgICAgZmlsbENvbG9yOiB0aGlzLl9jb2xvckRpc3RyaWN0KGZlYXR1cmUpLFxuICAgICAgICBjb2xvcjogJ3doaXRlJyxcbiAgICAgICAgb3BhY2l0eTogMSxcbiAgICAgICAgZmlsbE9wYWNpdHk6IDAuNyxcblxuICAgICAgICAvL0RhdGFcbiAgICAgICAgc3RhdHVzRGF0YTogdGhpcy5zdGF0dXNEYXRhW2ZlYXR1cmUucHJvcGVydGllcy5OQU1FIC0gMV0sXG4gICAgICAgIGNvbnRhY3Q6IHRoaXMuY29udGFjdFtmZWF0dXJlLnByb3BlcnRpZXMuTkFNRSAtIDFdLFxuICAgICAgfSlcbiAgICAgIC5vbih7XG4gICAgICAgIGNsaWNrOiB0aGlzLl9yZW5kZXJCdWJibGUuYmluZCh0aGlzKSxcbiAgICAgIH0pLmFkZFRvKHRoaXMubWFwKTtcblxuXG4gICAgICAvLyBsYXllci5vbih7XG4gICAgICAgIC8vIG1vdXNlb3ZlcjogaGFuZGxlTW91c2VPdmVyLFxuICAgICAgICAvLyBtb3VzZW91dDogaGFuZGxlTW91c2VPdXRcbiAgICAgIC8vIH0pO1xuICAgIH1cblxuICBfbGF5ZXJTdHlsZSgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZmlsbENvbG9yOiAnbm9uZScsXG4gICAgICBjb2xvcjogJ2dyYXknLFxuICAgICAgb3BhY2l0eTogJzEnXG4gICAgfTtcbiAgfVxuXG4gIF9jb2xvckRpc3RyaWN0KGRpc3RyaWN0KSB7XG4gICAgdmFyIHN0YXR1cyA9IHRoaXMuc3RhdHVzRGF0YVtkaXN0cmljdC5wcm9wZXJ0aWVzLk5BTUUgLSAxXS5zdGF0dXM7XG5cbiAgICBzd2l0Y2goc3RhdHVzKSB7XG4gICAgICBjYXNlICdGT1InOlxuICAgICAgICByZXR1cm4gJyMxZTkwZmYnO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ0FHQUlOU1QnOlxuICAgICAgICByZXR1cm4gJyNGRjRDNTAnO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ1RBUkdFVCc6XG4gICAgICAgIHJldHVybiAnI0NDMDAwNCc7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICAvL0NhbGwgZ2VvanNvblxuICAgIEwuZ2VvSlNPTih0aGlzLmdlb2pzb24sIHtcbiAgICAgIHN0eWxlOiB0aGlzLl9sYXllclN0eWxlLmJpbmQodGhpcyksXG4gICAgICBvbkVhY2hGZWF0dXJlOiB0aGlzLl9vbkVhY2hGZWF0dXJlLmJpbmQodGhpcylcbiAgICB9KTtcbiAgfVxufVxuIiwiXG5jbGFzcyBBcHAge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgdGhpcy5NYXAgPSBudWxsO1xuICAgIHRoaXMucmVuZGVyKCk7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgLy9Mb2FkaW5nIGRhdGEuLi5cbiAgICB2YXIgbWFwRmV0Y2ggPSAkLmdldEpTT04oJy9kYXRhL255cy1zZW5hdGVtYXAuanNvbicpO1xuICAgIHZhciBzZW5hdG9yU3RhdHVzRmV0Y2ggPSAkLmdldEpTT04oJy9kYXRhL3N0YXR1cy5qc29uJyk7XG4gICAgdmFyIHN0YXRlU2VuYXRvcnNJbmZvID0gJC5nZXRKU09OKCcvZGF0YS9zdGF0ZS1zZW5hdG9ycy5qc29uJyk7XG5cbiAgICAkLndoZW4obWFwRmV0Y2gsIHNlbmF0b3JTdGF0dXNGZXRjaCwgc3RhdGVTZW5hdG9yc0luZm8pLnRoZW4oKGdlb2pzb24sIHN0YXR1c0RhdGEsIGNvbnRhY3QpPT57XG4gICAgICB0aGlzLk1hcCA9IG5ldyBNYXBNYW5hZ2VyKGdlb2pzb25bMF0sIHN0YXR1c0RhdGFbMF0sIGNvbnRhY3RbMF0pO1xuICAgIH0pO1xuXG5cbiAgfVxufVxuXG5uZXcgQXBwKHt9KTtcbiJdfQ==
