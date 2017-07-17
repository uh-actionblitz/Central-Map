class StoriesListManager {
  constructor(geojson, statusData, contact, stories) {
    this.geojson = geojson;
    this.statusData = statusData;
    this.contact = contact;
    this.stories = stories;

    this.storiesList = $("#stories");
  }

  onHashchange(options) {
    console.log("StoriesListManager", options);
  }
}
