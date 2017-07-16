
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

    $.when(mapFetch, senatorStatusFetch, stateSenatorsInfo, storiesInfo).then(
      (geojson, statusData, contact, stories)=>{
      this.Map = new MapManager(geojson[0], statusData[0], contact[0], stories[0]);
      this.List = new ListManager(geojson[0], statusData[0], contact[0], stories[0]);
      this.Search = new SearchManager();
    });


  }
}

new App({});
