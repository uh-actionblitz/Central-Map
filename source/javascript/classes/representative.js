/**
 * RepresentativeManager
 * Facilitates the retrieval of the user's Representative based on their Address
 **/
class RepresentativeManager {

  constructor(map, status, contact) {
    this.map = map;
    this.status = status;
    this.contact = contact;

    this.representativeContainer = $("#senator-info");
  }

  onHashchange(options) {
    console.log("RepresentativeManager", options);
  }

}
