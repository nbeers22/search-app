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
        // this.url = `https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=${config.FLICKER_KEY}&text=${this.searchStr}&per_page=24&page=1&format=json&nojsoncallback=1&extras=url_o`;
        this.url = `https://api.unsplash.com/search/photos?page=1&query=${this.searchStr}&per_page=20&client_id=${config.UNSPLASH_KEY}`
        break;

      case 'video':
        // YOUTUBE API URL GOES HERE
        this.url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${this.searchStr}&key=${config.YOUTUBE_KEY}`;
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
            const image = new Image(data);
            image.showResults();
            break;

          case 'video':
            const video = new Video(data);
            video.showResults();
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
  constructor(results) {
    super();
    this.results = results;
  }

  showResults(){
    let imagesHTML   = '';
    const search     = document.getElementById('search-results');
    const numResults = document.getElementById('num-results');
    const dictionary = document.getElementById('dictionary-result');

    search.innerHTML     = '';
    numResults.innerHTML = '';
    dictionary.innerHTML = '';

    numResults.innerHTML = `Total results: ${this.results.total}`;
    
    this.results.results.forEach((element, i) => {
      imagesHTML += `
        <figure class="image-block">
          <div class="image-item" style="background-image: url(${element.urls.regular})"></div>
          <p class="image-title">${element.description}</p>
        </figure>
      `
    });

    search.insertAdjacentHTML('beforeend', imagesHTML)
  }
}

class Video extends Search {
  constructor(results) {
    super();
    this.results = results;
  }

  showResults(){
    let videosHTML   = '';
    const search     = document.getElementById('search-results');
    const numResults = document.getElementById('num-results');
    const dictionary = document.getElementById('dictionary-result');

    search.innerHTML     = '';
    numResults.innerHTML = '';
    dictionary.innerHTML = '';

    numResults.innerHTML = `Total results: ${this.results.pageInfo.totalResults}`;
    
    this.results.items.forEach((element, i) => {
      videosHTML += `
        <figure class="image-block video-block">
          <div class="image-item video-item" data-modal="video-modal" data-embed="https://www.youtube.com/embed/${element.id.videoId}" data-title="${element.snippet.title}" style="background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)),url(${element.snippet.thumbnails.high.url});">
            <svg class="video-overlay-play-button" viewBox="0 0 200 200" alt="Play video" id="play-video">
              <circle cx="100" cy="100" r="90" fill="none" stroke-width="15" stroke="#FFF"/>
              <polygon points="70, 55 70, 145 145, 100" fill="#FFF"/>
            </svg>
          </div>
          <p class="image-title">${element.snippet.title}</p>
        </figure>
      `
    });

    search.insertAdjacentHTML('beforeend', videosHTML)
  }
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

const openModal = (title,embedURL) => {
  console.log('open modal')
  document.querySelector('body').classList.add('modal-open');
  document.getElementById('modal-title').innerText = title;
  document.getElementById('video-iframe').src = embedURL;
  document.getElementById('video-modal').style.height = "auto";
}

const closeModal = () => {
  console.log('closing')
  document.querySelector('body').classList.remove('modal-open');
  document.getElementById('video-iframe').src = "";
  document.getElementById('video-modal').style.height = 0;
}

const navHandler = (type) => {
  let searchStr = document.getElementById('search').value;
  const search = new Search(searchStr,type);
  search.decideType();
}

const eventListener = () => {
  document.addEventListener('click', function (event) {
    event.preventDefault();

    // switch active nav item
    if (event.target.matches('.menu-item')) {
      document.querySelector('nav').querySelectorAll('li').forEach(element => {
        element.classList.remove('active');
      });
      event.target.parentElement.classList.add('active');
      navHandler(event.target.dataset.type);
    // Open video modal
    } else if (event.target.matches('.video-item')){
      openModal(event.target.dataset.title, event.target.dataset.embed);
    // Closes video modal
    } else if (event.target.matches('#modal-close')){
      closeModal();
    }

  }, false);
}

const init = () => {
  searchHandler();
  eventListener();
}

init();