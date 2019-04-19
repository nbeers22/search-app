class Search {
  constructor(searchStr,type = '',url = ''){
    this.searchStr     = searchStr;
    this.type          = type;
    this.url           = url;
    this.dictionaryURL = `https://api.pearson.com/v2/dictionaries/ldoce5/entries?limit=2&headword=${this.searchStr}&apikey=vd6eycmGfc37Gl40gxgZTvIjMVrZ5P33`;
  }
  
  decideType(){
    let results;
    switch (this.type) {
      case 'page':
      case '':
        this.url = `https://www.googleapis.com/customsearch/v1?cx=008446815321438153834:5okybrne5hw&q=${this.searchStr}&key=AIzaSyAUcuxSCoEbnPZ5POSgdpXuwDztOnd1qUM`;
        break;

      case 'image':
        // FlICKER API URL GOES HERE
        this.url = ``;
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
            this.url = ``;
            const image = new Image(data.items);
            break;

          case 'video':
            // YOUTUBE API URL GOES HERE
            this.url = ``;
            const video = new Video(data.items);
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
    const keyword    = document.getElementById('keyword');
    const dictionary = document.getElementById('dictionary-result');
    const search     = document.getElementById('search-results');
    const numResults = document.getElementById('num-results');

    dictionary.innerHTML = "";
    search.innerHTML = "";
    numResults.innerHTML = "";

    keyword.innerText = this.searchStr;

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
  }
  
}

class Image extends Search {

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

const init = () => {
  searchHandler();
}

init();