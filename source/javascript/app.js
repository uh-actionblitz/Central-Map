
class App {
  constructor(options) {
    this.Map = null;
    this.render();
  }

  render() {
    //Loading data...
    var mapFetch = $.getJSON('/data/nys-senatemap.json');
    var senatorStatusFetch = $.getJSON('/data/status.json');
    var stateSenatorsInfo = $.getJSON('/data/state-senators.json');
    var storiesInfo = $.getJSON('/data/stories.json');
    var that = this;
    $.when(mapFetch, senatorStatusFetch, stateSenatorsInfo, storiesInfo).then(
      (geojson, statusData, contact, stories)=>{
      that.Map = new MapManager(geojson[0], statusData[0], contact[0], stories[0]);
      that.StoryList = new StoriesListManager(geojson[0], statusData[0], contact[0], stories[0]);
      that.Search = new SearchManager();
      that.Rep = new RepresentativeManager(that.Map, statusData[0], contact[0]);
      that._listenToWindow();
    });
  }

  _listenToWindow() {

    $(window).on('hashchange', ()=>{
      if (window.location.hash && window.location.hash.length > 0)
      {
        const hash = $.deparam(window.location.hash.substring(1));

        const latLng = new L.latLng(hash.lat, hash.lon);
        // Trigger various managers
        this.StoryList.listNearbyStories(latLng);
        this.Rep.showRepresentative(latLng);
        this.Map.focusOnDistrict(latLng)
      }
    });
    $(window).trigger("hashchange");
  }
}

window.AppManager = new App({});
