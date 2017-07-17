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

  showRepresentative(latLng) {
    this.target = leafletPip.pointInLayer(latLng, this.map.districts, true)[0];
    console.log("RepresentativeManager", this.target);

    this.render();
  }

  renderParties(parties) {
    const partyList = parties.split(',');

    const toString = partyList.map(i=>`<li class='party ${i}'><span>${i}</span></li>`).join('');

    return `<ul class='parties'>${toString}</ul>`;
  }

  renderThanks(repToRender) {
    return `
      <div>
        <p class='status'>
          ${repToRender.status === "FOR" ? `Sen. ${repToRender.name} is <strong>supportive</strong> of the New York Health Act (S4840). Call the senator to thank them!`
            : `Sen. ${repToRender.name} is not yet supportive of the New York Health Act  (S4840). Call them to encourage and urge them to give their support to this important bill.`}
        </p>
        <h4>Here's How</h4>
        <h5>1. Call the senator at <i class="fa fa-phone" aria-hidden="true"></i> ${repToRender.phone}</h5>
        <h5>2. Thank them through their staff!</h5>
        <p>The staffer will make sure that your message is sent to the senator.</p>
        <sub>Sample Message</sub>
        <blockquote>
          Hi! My name is ______. I am a constituent of Sen. ${repToRender.name} at zipcode _____. I am sending my thanks to the senator for supporting and co-sponsoring the New York Health Act (S4840).
          Health care is a very important issue for me, and the senator's support means a lot. Thank you!
        </blockquote>
        <h5>3. Tell your friends to call!</h5>
        <p>Share this page with your friends and urge them to call your senator!</p>
      </div>
    `
  }

  renderUrge(repToRender) {
    return `
    <div>
      <p class='status'>
        ${repToRender.status === "FOR" ? `Sen. ${repToRender.name} is <strong>supportive</strong> of the New York Health Act (S4840). Call the senator to thank them!`
          : `Sen. ${repToRender.name} is <strong class='not'>not yet supportive</strong> of the New York Health Act  (S4840). Call them to encourage and urge them to give their support to this important bill.`}
      </p>
      <h4>Here's How</h4>
      <h5>1. Call the senator at <i class="fa fa-phone" aria-hidden="true"></i> ${repToRender.phone}</h5>
      <h5>2. Talk to them about your support!</h5>
      <p>You will most likely talk with a staffer. Tell them about your story. The staffer will make sure that your message is sent to the senator.</p>
      <sub>Sample Message</sub>
      <blockquote>
        Hi! My name is ______. I am a constituent of Sen. ${repToRender.name} at zipcode _____.
        I am strongly urging the senator to support and co-sponsor the New York Health Act (S4840).
        Health care is a very important issue for me, and the senator's support means a lot. Thank you!
      </blockquote>
      <h5>3. Tell your friends to call!</h5>
      <p>Share this page with your friends and urge them to call your senator!</p>
    </div>
    `
  }
  render() {
    if (!this.target) return null;

    const districtNumber = parseInt(this.target.feature.properties.NAME);
    const repToRender = this.status.filter(i=>i.district == districtNumber)[0];
    const contactOfRep = this.contact.filter(i=>i.district == districtNumber)[0];

    console.log(repToRender, contactOfRep);
    this.representativeContainer.html(
      `<div>
        <h5 class='your-senator'>Your State Senator</h5>
        <div class='basic-info'>
          <img src='${contactOfRep.image}' class='rep-pic' />
          <h5>NY District ${repToRender.district}</h5>
          <h3>${repToRender.name}</h3>
          <p>${this.renderParties(contactOfRep.party)}</p>
        </div>
        <div class='action-area'>
          ${repToRender.status === "FOR" ? this.renderThanks(repToRender) : this.renderUrge(repToRender) }
        </div>
        <div class='website'>
          <a href='${repToRender.contact}' target='_blank'>More ways to contact <strong>Sen. ${repToRender.name}</strong></a>
        <div>
       </div>`
    );
  }

}
