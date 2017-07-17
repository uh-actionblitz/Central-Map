/**
* Facilitates the search
*/

class SearchManager {

  constructor() {
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

  _startListener() {
    const that = this;

    // Listen to address changes
    this.addressForm.bind('keyup', (ev)=>{
      const address = ev.target.value;

      clearTimeout(this.timeout);
      this.timeout = setTimeout(()=>{
        //Filter the addresses
        $.getJSON('https://nominatim.openstreetmap.org/search/' + encodeURIComponent(address) + '?format=json',
        (data) => {
          that.searchSuggestionsContainer.show();
          this.data = data;
          that.render();
        });
      }, 500);
    })

    //Listen to clicking of suggestions
    that.searchSuggestionsContainer.on("click", "a", (ev) => {
      console.log("Test");
      that.searchSuggestionsContainer.hide();
    })
  }

  render() {
    this.searchSuggestions.empty();
    if (this.data) {
      this.searchSuggestions.append(
        this.data.slice(0,5).map((item)=>`
        <li>
          <div class='suggestion' lon="${item.lon}" lat="${item.lat}">
            <a href='#lon=${item.lon}&lat=${item.lat}'>${item.display_name}</a>
          </div>
        </li>`)
      );
    }
  }

}
