class MapManager {
  constructor(geojson, statusData, contact, stories) {

    //Initializing Map
    this.map = new L.map('map').setView([42.863,-74.752], 6.55);
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
  _renderBubble(event) {

    var popup;
    var senator = event.target.options.statusData;
    var moreInfo = event.target.options.contact;

    var content = (
      `<div class='senator-popup-content'>
        <section class="senator-image-container">
          <img src="${senator.image}" />
        </section>
        <section class="senator-info">
          <h4>${senator.name}</h4>
          <div>Party: ${moreInfo.party}</div>
          <div>Senate District ${senator.district}</div>
          <div class="${(senator.status === 'FOR') ? 'votes-yes' : 'votes-no'}">
              ${senator.status === 'TARGET' ? 'High priority' : (senator.status === 'FOR') ? 'Co-Sponsor' : 'Not Yet Supportive'}
          </div>
        </section>
        <a href="${moreInfo.contact}" class="contact-link" target="_blank">Contact</button>
      </div>`);

    popup = L.popup({
      closeButton: true,
      className: 'senator-popup',
     });

    popup.setContent(content);
    event.target.bindPopup(popup).openPopup();
  }

  _onEachFeature(feature, layer) {
      //
      //
      const that = this;

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
        contact: this.contact[feature.properties.NAME - 1],
      })
      .on({
        click: this._renderBubble.bind(this),
      }).addTo(this.map);


      layer.on({
        click: (e)=>{

          // this.map.fitBounds(layer.getBounds());
          window.location.hash = `#lat=${e.latlng.lat}&lon=${e.latlng.lng}`
        }
      })

      layer._leaflet_id = feature.id
      // layer.on({
        // mouseover: handleMouseOver,
        // mouseout: handleMouseOut
      // });
    }

  _layerStyle() {
    return {
      fillColor: 'gray',
      fillOpacity: 0.01,
      color: 'gray',
      opacity: '1',
      weight: 1
    };
  }
  _chosenStyle() {
    return {
      fillColor: 'yellow',
      fillOpacity: 0.1
    }
  }

  _resetLayerStyle(layer) {
    layer.setStyle(this._layerStyle());
  }

  _colorDistrict(district) {
    var status = this.statusData[district.properties.NAME - 1].status;

    switch(status) {
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

  render() {
    //Call geojson
    this.districts = L.geoJSON(this.geojson, {
      style: this._layerStyle.bind(this),
      onEachFeature: this._onEachFeature.bind(this)
    })
    this.districts.addTo(this.map);
    this.districts.bringToBack();


  }

  //FitBounds on the district
  focusOnDistrict(latLng) {
    const target = leafletPip.pointInLayer(latLng, this.districts, true)[0];

    if (target) {
      this.map.fitBounds(target.getBounds(), { animate: false });
      this.districts.eachLayer(this._resetLayerStyle.bind(this));
      target.setStyle(this._chosenStyle())
      //Refresh whole map
    }



  }
}
