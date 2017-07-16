class ListManager {
  constructor(geojson, statusData, contact, stories) {
    this.geojson = geojson;
    this.statusData = statusData;
    this.contact = contact;
    this.stories = stories;

    this.senatorInfo = $("#senator-info");
    this.storiesList = $("#stories");

  }
}
