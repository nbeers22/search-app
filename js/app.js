class Search {
  constructor(searchStr,type = '',url = ''){
    this.searchStr     = searchStr;
    this.type          = type;
    this.url           = url;
    this.dictionaryURL = `https://api.pearson.com/v2/dictionaries/ldoce5/entries?limit=2&headword=${this.searchStr}&apikey=${config.DICTIONARY_KEY}`;
  }
  
  decideType(){
    let results;
    switch (this.type) {
      case 'page':
      case '':
        this.url = `https://www.googleapis.com/customsearch/v1?cx=008446815321438153834:5okybrne5hw&q=${this.searchStr}&key=${config.GOOGLE_SEARCH_KEY}`;
        break;

      case 'image':
        // FlICKER API URL GOES HERE
        this.url = `https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=${config.FLICKER_KEY}&text=${this.searchStr}&per_page=24&page=1&format=json&nojsoncallback=1&extras=url_o`;
        break;

      case 'video':
        // YOUTUBE API URL GOES HERE
        this.url = ``;
        break;
    }
    this.getResults(this.url);
  }

  getResults(url) {
    fetch(url)
      .then( response => response.json() )
      .then( data => {
        switch (this.type) {
          case 'page':
          case '':
            const page = new Page(data,this.dictionaryURL,this.searchStr);
            page.getDictionaryResults();
            break;

          case 'image':
            // FlICKER API URL GOES HERE
            const image = new Image(data,this.searchStr);
            image.showResults();
            break;

          case 'video':
            // YOUTUBE API URL GOES HERE
            this.url = ``;
            // const video = new Video(data.items);
            break;
        }
      });
  }
}

class Page extends Search{
  constructor(results,dictionaryURL,searchStr){
    super();
    this.results       = results;
    this.dictionaryURL = dictionaryURL;
    this.searchStr     = searchStr;
  }

  getDictionaryResults() {
    fetch(this.dictionaryURL)
      .then(response => response.json())
      .then(data => {
        this.showResults(data.results);
      });
  }

  showResults(dictionaryResults){
    let searchHTML = '';
    const dictionary = document.getElementById('dictionary-result');
    const search     = document.getElementById('search-results');
    const numResults = document.getElementById('num-results');
    
    // clear results
    dictionary.innerHTML = "";
    search.innerHTML     = "";
    numResults.innerHTML = "";

    // console.log(dictionaryResults)
    if (dictionaryResults.length > 0) {
      dictionary.insertAdjacentHTML('beforeend',
        `
      <h4>${this.searchStr}</h4>
      <p><strong>Part of Speech: </strong>${dictionaryResults[0].part_of_speech}</p>
      <p><strong>Definition: </strong>${dictionaryResults[0].senses[0].definition}</p>
      <p></p>
      `
      )
    }

    numResults.innerHTML = `Total results: ${this.results.searchInformation.formattedTotalResults}`;

    this.results.items.forEach( (element,i) => {
      searchHTML += `
        <div class="search-item">
          <a href="${element.link}"><h3 class="search-title">${element.htmlTitle}</h3></a>
          <p class="search-snippet">${element.snippet}</p>
          <p class="search-url">${element.displayLink}</p>
        </div>
      `
    });

    search.insertAdjacentHTML('beforeend',searchHTML)

    document.getElementById('results').classList.add('show');
  }
  
}

class Image extends Search {
  constructor(results, searchStr) {
    super();
    this.results = results;
    this.searchStr = searchStr;
  }

  showResults(){
    let imagesHTML   = '';
    const search     = document.getElementById('search-results');
    const numResults = document.getElementById('num-results');
    const dictionary = document.getElementById('dictionary-result');

    search.innerHTML     = '';
    numResults.innerHTML = '';
    dictionary.innerHTML = '';

    numResults.innerHTML = `Total results: ${+this.results.photos.total}`;

    this.results.photos.photo.forEach((element, i) => {
      imagesHTML += `
        <figure class="image-block">
          <div class="image-item" style="background-image: url(${element.url_o})"></div>
          <p class="image-title">${element.title}</p>
        </figure>
      `
    });

    search.insertAdjacentHTML('beforeend', imagesHTML)
  }
}

class Video extends Search {

}

const searchHandler = () => {
  const btn = document.getElementById('submit');

  btn.addEventListener('click', event => {
    let searchStr = document.getElementById('search').value;
    // let type      = document.getElementById('type').value;
    event.preventDefault();
    
    if(!searchStr) return false;

    const search = new Search(searchStr);
    search.decideType();
  });
}

const navHandler = (type) => {
  let searchStr = document.getElementById('search').value;
  const search = new Search(searchStr,type);
  search.decideType();
}

const navListener = () => {
  document.addEventListener('click', function (event) {
    if (event.target.matches('.menu-item')) {
      event.preventDefault();
      navHandler(event.target.dataset.type);
    }
  }, false);
}

const init = () => {
  searchHandler();
  navListener();
}

init();