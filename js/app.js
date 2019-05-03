class Search {
  constructor(searchStr,type = '',url = ''){
    this.searchStr     = searchStr;
    this.type          = type;
    this.url           = url;
    this.dictionaryURL = `https://googledictionaryapi.eu-gb.mybluemix.net/?define=${this.searchStr}&lang=en`;
  }
  
  decideType(){
    let results;
    switch (this.type) {
      case 'page':
      case '':
        this.url = `https://www.googleapis.com/customsearch/v1?cx=008446815321438153834:5okybrne5hw&q=${this.searchStr}&start=1&key=${config.GOOGLE_SEARCH_KEY}`;
        break;

      case 'image':
        this.url = `https://api.unsplash.com/search/photos?page=1&query=${this.searchStr}&per_page=20&client_id=${config.UNSPLASH_KEY}`
        break;

      case 'video':
        this.url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${this.searchStr}&key=${config.YOUTUBE_KEY}`;
        break;
    }
    if(this.url) this.getResults(this.url);
  }

  getResults(url) {
    fetch(url)
      .then( response => response.json() )
      .then( data => {
        // Show nagivation right before results are shown
        document.getElementById('module-nav').style.display = 'block';
        switch (this.type) {
          case 'page':
          case '':
            const page = new Page(data,this.dictionaryURL,this.searchStr,this.url);
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

    hideLoadingImg(){
    // Show loading icon inside search bar/Hide search icon
    document.getElementById('search-icon').classList.remove('hide');
    document.getElementById('loading-icon').classList.add('hide');
  }

  hideDictionary(){
    document.getElementById('dictionary-result').classList.remove('show');
  }
}

class Page extends Search{

  constructor(results,dictionaryURL,searchStr,url){
    super();
    this.results       = results;
    this.dictionaryURL = dictionaryURL;
    this.searchStr     = searchStr;
    this.searchURL     = url;
    this.soundURL      = '';
    this.previousURL   = '';

    this.currentStart = +this.searchURL.split('start=')[1].charAt(0);

    if(this.currentStart !== 1){
      this.previousURL = `https://www.googleapis.com/customsearch/v1?cx=008446815321438153834:5okybrne5hw&q=${this.searchStr}&start=${this.currentStart - 10}&key=${config.GOOGLE_SEARCH_KEY}`;
    }
    this.nextURL = `https://www.googleapis.com/customsearch/v1?cx=008446815321438153834:5okybrne5hw&q=${this.searchStr}&start=${this.currentStart + 10}&key=${config.GOOGLE_SEARCH_KEY}`;
  }

  getDictionaryResults() {
    fetch(this.dictionaryURL)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        return false;
      })
      .then( data => this.showResults(data) );
  }

  showResults(dictionaryResults){
    let searchHTML = '';
    document.getElementById('dictionary-result').classList.remove('show');
    const dictionary = document.getElementById('dictionary-result');
    const search     = document.getElementById('search-results');
    const numResults = document.getElementById('num-results');
    
    // clear results
    dictionary.innerHTML = "";
    search.innerHTML     = "";
    numResults.innerHTML = "";

    if(dictionaryResults){
      if (dictionaryResults.length > 0) {
        document.getElementById('dictionary-result').classList.add('show');
        let allMeanings = '';
        let soundImage  = '';
        let phonetic    = '';
        let meanings    = dictionaryResults[0].meaning;

        if (dictionaryResults[0].pronunciation){
          this.soundURL = dictionaryResults[0].pronunciation;
          soundImage = `<a href="" id="sound-link"><img class="play-sound" data-url="${this.soundURL}" src="images/sound-button.png" alt="Play Sound"></a>`;
        }
        
        if (dictionaryResults[0].phonetic){
          phonetic = `<p class="phonetic"><small>${dictionaryResults[0].phonetic}</small></p>`;
        }

        // Get all meanings of word and store in allMeanings
        Object.keys(meanings).forEach( ele => {
          let meaning = '';
          
          meanings[ele].forEach( result => {
            meaning += `<li>${result.definition}</li>`;
          });

          allMeanings += `
          <div class="meaning">
            <p><strong>${ele}</strong></p>
            <ol>
              ${meaning}
            </ol>
          </div>
          `

        });

        dictionary.insertAdjacentHTML('beforeend',
          `
        <div class="dict-flex">
          ${soundImage}
          <h2>${this.searchStr}</h2>
        </div>
        ${phonetic}
        <div class="meanings">${allMeanings}</div>
        <p></p>
        `
        )
      }
    }

    // Hide loading gif right before results are populated
    document.getElementsByClassName('loading')[0].classList.toggle('hide');

    // Show total results returned
    // numResults.innerHTML = `Total results: ${this.results.searchInformation.formattedTotalResults}`;
    // Display each search result
    this.results.items.forEach( (element,i) => {
      let img = '';
      if(element.pagemap){
        if (element.pagemap.cse_thumbnail){
          img = `<div class="img-result" style="background-image: url(${element.pagemap.cse_thumbnail[0].src})"></div>`;
        }
      }
      searchHTML += `
        <div class="search-item">
          <a href="${element.link}" class="search-title" target="_blank">${element.htmlTitle}</a>
          <article class="search-meta">
            ${img}
            <div class="text-result">
              <p class="search-snippet">${element.snippet}</p>
              <p class="search-url">${element.displayLink}</p>
            </div>
          </div>
        </div>
      `;
    });

    search.insertAdjacentHTML('beforeend',searchHTML);

    document.getElementById('results').classList.add('show');
    this.hideLoadingImg();
    scrollToResults();
  }

  static playSound(url) {
    var audio = new Audio(url);
    audio.play();
  }
}

class Image extends Search {
  constructor(results) {
    super();
    this.results = results;
  }

  showResults(){
    this.hideDictionary();
    let imagesHTML   = '';
    const search     = document.getElementById('search-results');
    const numResults = document.getElementById('num-results');
    const dictionary = document.getElementById('dictionary-result');

    search.innerHTML     = '';
    dictionary.innerHTML = '';

    this.results.results.forEach((element, i) => {
      let description;
      if(element.description){
        description = element.description.substr(0,75);
      }else if(element.alt_description){
        description = element.alt_description.substr(0, 75);
      }else{
        description = "Untitled Image"
      }
      imagesHTML += `
        <figure class="image-block">
          <div tabindex="0" class="image-item image-result" style="background-image: url(${element.urls.regular})" data-full="${element.urls.full}" data-modal="image-modal" data-title="${description}" title="View full size"></div>
          <figcaption class="image-title">${description}</figcaption>
        </figure>
      `
    });

    this.hideLoadingImg();
    search.insertAdjacentHTML('beforeend', imagesHTML);
  }
}

class Video extends Search {
  constructor(results) {
    super();
    this.results = results;
  }

  showResults(){
    this.hideDictionary();
    let videosHTML   = '';
    const search     = document.getElementById('search-results');
    const numResults = document.getElementById('num-results');
    const dictionary = document.getElementById('dictionary-result');

    search.innerHTML     = '';
    dictionary.innerHTML = '';

    this.results.items.forEach((element, i) => {
      videosHTML += `
        <figure class="image-block video-block">
          <div tabindex="0" class="image-item video-item" data-modal="video-modal" data-embed="https://www.youtube.com/embed/${element.id.videoId}" data-title="${element.snippet.title}" style="background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)),url(${element.snippet.thumbnails.high.url});">
            <svg data-modal="video-modal" data-embed="https://www.youtube.com/embed/${element.id.videoId}" data-title="${element.snippet.title}" class="video-overlay-play-button" viewBox="0 0 200 200" alt="Play video" id="play-video">
              <circle cx="100" cy="100" r="90" fill="none" stroke-width="15" stroke="#FFF"/>
              <polygon points="70, 55 70, 145 145, 100" fill="#FFF"/>
            </svg>
          </div>
          <figcaption class="image-title">${element.snippet.title}</figcaption>
        </figure>
      `
    });

    this.hideLoadingImg();
    search.insertAdjacentHTML('beforeend', videosHTML);
  }
}

function typedText(){
  let options = {
    strings: ["Web Pages", "Images", "Videos", "Weather", "Definitions", "And More!"],
    typeSpeed: 40,
    loop: true
  }

  let typed = new Typed("#typed", options);
}

function eventListeners(){

    document.addEventListener('click', event => {
      event.preventDefault();

      if (event.target.matches('.menu-item')) {
        // switch active nav item
        document.querySelector('nav').querySelectorAll('li').forEach(element => {
          element.classList.remove('active');
        });
        event.target.parentElement.classList.add('active');
        navHandler(event.target.dataset.type);
      } else if (event.target.matches('.video-item') || event.target.matches('.video-overlay-play-button')) {
        // Open video modal
        openVideoModal(event.target.dataset.title, event.target.dataset.embed);
      } else if (event.target.matches('.image-result')) {
        // Open image modal
        openImageModal(event.target.dataset.title, event.target.dataset.full);
      } else if (event.target.matches('.play-sound')) {
        // play word defintion sound
        let url = document.getElementsByClassName('play-sound')[0].dataset.url;
        Page.playSound(url);
      }

    }, false);

    // For keyboard users who use keyboard instead of click
    document.addEventListener('keyup', event => {
      if(event.keyCode === 13) {
        if(event.target.matches('.image-result')){
          openImageModal(event.target.dataset.title, event.target.dataset.full);
        } else if (event.target.matches('.video-item') || event.target.matches('.video-overlay-play-button')) {
          openVideoModal(event.target.dataset.title, event.target.dataset.embed);
        } else if (event.target.matches('#sound-link')) {
          // play word defintion sound
          let url = document.getElementsByClassName('play-sound')[0].dataset.url;
          Page.playSound(url);
        }
      } else if(event.key === "Escape"){
        closeVideoModal();
        closeImageModal();
      }
    })
  }

function searchHandler(){
    const btn = document.getElementById('submit');
    const topnavBtn = document.getElementById('topnav-submit');

    btn.addEventListener('click', event => {
      let searchStr = document.getElementById('search').value;
      document.getElementsByClassName('loading')[0].classList.toggle('hide');
      document.getElementById('topnav-search').value = searchStr;
      event.preventDefault();

      if (!searchStr) return false;

      const search = new Search(searchStr);
      search.decideType();
    });
    
    topnavBtn.addEventListener('click', event => {
      let searchStr = document.getElementById('topnav-search').value;
      event.preventDefault();

      if (!searchStr) return false;

      // Show loading icon inside search bar/Hide search icon
      document.getElementById('search-icon').classList.add('hide');
      document.getElementById('loading-icon').classList.remove('hide');

      // Scroll to top of results before showing new results
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      const search = new Search(searchStr);
      search.decideType();

      // switch active nav item
      document.querySelector('#module-nav').querySelectorAll('li').forEach( (element,i) => {
        element.classList.remove('active');
        if(i === 0) element.classList.add('active');
      });
    });
  }

function showFixedNav(){
  let topNav = document.getElementById('top-nav');
  topNav.classList.add('open');
}

function hideHeader(){
  let header = document.getElementsByClassName('banner')[0];
  header.style.display = 'none';
}

function openVideoModal(title, embedURL){
  document.querySelector('body').classList.add('video-modal-open');
  document.getElementById('modal-title').innerText = title;
  document.getElementById('video-iframe').src = embedURL;
  document.getElementById('video-modal').style.height = "auto";
}

function closeVideoModal(){
  document.querySelector('body').classList.remove('video-modal-open');
  document.getElementById('video-iframe').src = "";
  document.getElementById('video-modal').style.height = 0;
}

function openImageModal(title, imageURL){
  document.querySelector('body').classList.add('image-modal-open');
  document.getElementById('image-title').innerText = title;
  document.getElementById('image-full').style.backgroundImage = 'url(' + imageURL + ')';
  document.getElementById('image-modal').style.height = "auto";
}

function closeImageModal(){
  document.querySelector('body').classList.remove('image-modal-open');
  document.getElementById('image-full').style.backgroundImage = '';
  document.getElementById('image-modal').style.height = 0;
}

function navHandler(type){
  let searchStr = document.getElementById('topnav-search').value;
  const search = new Search(searchStr, type);
  search.decideType();
}

function scrollToResults(){
  hideHeader();
  showFixedNav();
}

(function init(){
  searchHandler();
  eventListeners();
  typedText();
})();