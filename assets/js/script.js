
/**
 * Selection of DOMS obcjets
 */
let loadMoreButton = document.getElementById("bottom");
let newsContainer = document.querySelector(".news-container");
let newsCounter = document.querySelector(".news-counter");
let loaderIcon = document.querySelector(".loader");
let loadingScreen = document.querySelector(".loading-screen");
let errorPanel = document.querySelector("#error-panel");

let newsCounterValue = 0;

/* Async function, on window load fetch data from hacker news API, 
 * get 10 ids and call getNewsDetails function*/
let _idsArray;
window.onload = async function() {
  loadMoreButton.style.display = "none"; // Hide the button initially
  try{
    let promise = await fetch("https://hacker-news.firebaseio.com/v0/newstories.json");
    _idsArray = await promise.json();
  }catch(err){
    errorPanel.style.display = "flex";
    errorPanel.innerHTML = `There has been an error while loading the news, please try again later.
    <br> Error details: ${err.name}: ${err.message}`
    console.log(err);
  }
  getNewsDetails();
  setTimeout(()=>{loadingScreen.style.opacity = 0;}, 600); // Hide the loading screen after 2 seconds of loadingScreen.style.opacity = 0;
  setTimeout(()=>{loadingScreen.style.display = "none";}, 1200); // For navigation porpouses, we set the display to none after 1.4 seconds (time taken by the animation to finish)
  loadMoreButton.style.display = "block";

};

/**
 * The function `getNewsDetails` asynchronously fetches news details from Hacker News API using a list
 * of IDs and processes the responses by parsing them as JSON and passing the data to a function called
 * `newsBuilder`.
 */
async function getNewsDetails(){
  loaderIcon.style.display = "block"; // Show the loader animation
  let ids = _idsArray.splice(0, 10);
  if (ids.length == 0) { loadMoreButton.style.display = "none"; }; // If there are no more news, hide the button
  try {
    let request = await ids.map(id=>fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`));
    let responses = await Promise.all(request);  
    for(let res of responses) {
      let data = await res.json(); 
      convalidNewsInfo(data); // Checks if the news info are valid
      newsBuilder(data); //  Creates the news
    }
  } catch(err) {
    console.log("An error has occurred:", err);
  } finally {
    newsCounter.textContent = `Loaded news: ${newsCounterValue}`; // Update the news counter
    loaderIcon.style.display = "none"; //stop the loader animation
  }
}



/**
 * The function `convalidNewsInfo` checks if the provided data has a title and URL, and if not, it
 * fetches news information from Hacker News API or gets the next news item.
 * @param data - The `convalidNewsInfo` function is an asynchronous function that takes in a `data`
 * object as a parameter. The function first checks if the `data` object has `title` and `url`
 * properties. If either of these properties is missing, it tries to fetch news information from the
 * @returns The `convalidNewsInfo` function returns the `data` object after performing some validations
 * and modifications. If the `data` object does not have a `title` or `url` property, it will make a
 * fetch request to get news information from the Hacker News API using an ID from the `_idsArray`. If
 * the fetch request is successful, it will return the retrieved data. If the `data` object does not have
 * a `by` or `time` property, it will add them with default values.
 */
async function convalidNewsInfo(data){
  if (!data) throw Error(`Invalid json Object`);
  if (data.title === undefined || data.url === undefined) {
    try{
      let newID = _idsArray.splice(0, 1)[0];
      let request = await fetch(`https://hacker-news.firebaseio.com/v0/item/${newID}.json`);
      data = await request.json();
      return data;
    } catch {
      return convalidNewsInfo(); //Recall itself if title or url are invalid
    }
  };
  if (data.by == undefined) {data.by = `Error, could get author name`};
  if (data.time == undefined) {data.time = `Error, could get news date`};
}

/**
 * The `newsBuilder` function dynamically generates HTML elements to display news data on a webpage.
 * @param newsData - The `newsData` parameter in the `newsBuilder` function seems to contain
 * information about a news article. It likely includes the following properties: 
 * by, time, title, url, type, id etc.
 */
function newsBuilder(newsData){
  newsContainer.insertAdjacentHTML("beforeend", `
  <div class="news" id="${newsData.id}">
    <span class="news-title">${newsData.title}</span>
    <div class="news-info">
        <div class="news-author">by ${newsData.by}</div>
        <span class="news-date">${convertUnixInData(newsData.time)}</span>
    </div>
    <button class="news-article-link"> <a href="${newsData.url}" target="_blank">See the article</a> </button>
    <span class="news-update-interval">${calculateUpdateInterval(newsData.time)}</span>
  </div>
    `);

  newsCounterValue++;
}

/**
 * The function `convertUnixInData` converts a Unix timestamp into a formatted date string.
 * @param unixTime - Unix time is a system for tracking time that represents the number of seconds that
 * have elapsed since the Unix epoch (January 1, 1970).
 * @returns The function `convertUnixInData` takes a Unix timestamp as input, converts it to a date
 * format (dd month yyyy), and returns the formatted date string.
 */
function convertUnixInData(unixTime) {
  if (unixTime instanceof String) return `Error, could get news date`; //Check if the input is a string for error handling porposes
  let data = new Date(unixTime * 1000); //Convert Unix in Date (seconds to milliseconds)
  let day = data.getDate();
  let month = data.getMonth();
  let year = data.getFullYear();

  return `[` + day + ' ' + numberToMonth(month) + ' ' + year +`]`;
}


/**
 * The function calculates the time interval since a news article was published in minutes or hours.
 * @param newsUnix - The function `calculateUpdateInterval` takes a Unix timestamp (in seconds) as
 * input and calculates the time difference between that timestamp and the current time. It then
 * returns a message indicating how long ago the news was published.
 * @returns The function `calculateUpdateInterval` takes a Unix timestamp as input, calculates the time
 * difference between that timestamp and the current time, and returns a message indicating how long
 * ago the news was published. The function returns a string message based on the time difference:
 */
function calculateUpdateInterval(newsUnix){
  if (newsUnix instanceof String) return `Error, could get news date`; //Check if the input is a string for error handling porposes
  let newsDateObj = new Date(newsUnix * 1000); //Convert Unix in Date (seconds to milliseconds)
  let now = new Date();
  let diff = now - newsDateObj; // Calculate the difference in milliseconds
  let diffInMinutes = Math.floor(diff / 1000 / 60); // Convert the difference in milliseconds to minutes
  if (diffInMinutes < 1) {
    return `Published now`;
  } else if (diffInMinutes < 60) {
    return `Published ${diffInMinutes} minutes ago`;
  } else {
    let diffInHours = Math.floor(diffInMinutes / 60); // Convert the difference in minutes to hours
    return `Published approximately ${diffInHours} hours ago`;
  }
}

/**
 * The function `numberToMonth` takes a number as input and returns the corresponding month name.
 * @param number - The `number` parameter in the `numberToMonth` function represents the index of the
 * month in the `months` array. The function returns the month name based on the index provided.
 * @returns The function `numberToMonth` takes a number as input and returns the corresponding month
 * name from the `months` array.
 */
function numberToMonth(number){
  let months = [`January`, `February`, `March`, `April`, `May`, `June`,
    `July`, `August`, `September`, `October`, `November`, `December`];
  return months[number];
}

/* If a major error occurs with the API to get the ids, the error panel will appear and
 * block the navigation.
 */
errorPanel.onclick = () => {
  return false;
}


/* Adding an event listener to the `loadMoreButton` element. This event listener is set to trigger 
 * the `getNewsDetails` function when the `click` event occurs on the `loadMoreButton`, which creates
 * another 10 news articles.
 */
loadMoreButton.addEventListener("click", getNewsDetails);