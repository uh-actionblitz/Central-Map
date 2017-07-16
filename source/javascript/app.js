
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

    $.when(mapFetch, senatorStatusFetch, stateSenatorsInfo).then((geojson, statusData, contact)=>{
      this.Map = new MapManager(geojson[0], statusData[0], contact[0]);
    });


  }
}

new App({});
