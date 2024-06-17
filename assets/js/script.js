import '../sass/styles.scss';
import '../sass/_variables.scss';
import '../sass/_mixins.scss';
//Inizializing idsArray and newsCountervalue

let idsArray=[];
let newsCounterValue = 0;


// Selection of DOM objects
let loadMoreButton = document.getElementById("bottom");
let newsContainer = document.querySelector(".news-container");
let newsCounter = document.querySelector(".news-counter");
let loaderIcon = document.querySelector(".loader");
let loadingScreen = document.querySelector(".loading-screen");
let errorPanel = document.querySelector("#error-panel");

//Event handlers

/* The code snippet provided is an asynchronous function assigned to the `window.onload` event.
This function is executed when the window has finished loading. Here's a breakdown of what the
function is doing: it starts by fetching to the Hacker News API a list of ids; if everything
goes right, then calls the "getNewsDetails" function. During the execution it changes some 
css styles of the loading elements.*/
window.onload = async function() {
  try{
    let promise = await fetch(process.env.API_URL);
    idsArray = await promise.json();
  }catch(err){
    errorPanel.style.display = "flex";
    errorPanel.innerHTML = `There has been an error while loading the news, please try again later.
    <br> Error details: ${err.name}: ${err.message}`
    console.log(err);
  }
  await getNewsDetails()
  loadingScreen.style.opacity = 0; // Hide the loading screen after 2 seconds of loadingScreen.style.opacity = 0;
  await new Promise(resolve => setTimeout(resolve, 600)); // For navigation porpouses, we set the display to none after 0.6 seconds (time taken by the animation to finish)
  loadingScreen.style.display = "none";
};


/* If a major error occurs with the main fetch to the Hacker News API, the error panel will appear and
 * block the navigation.
 */
errorPanel.onclick = () => {
  return false;
}


/* The line is adding an event listener to the `loadMoreButton` element. When the user clicks on the
`loadMoreButton`, the `getNewsDetails` function wil be executed, which will fetch and display
more news details from the Hacker News API asynchronously. */
loadMoreButton.addEventListener("click", getNewsDetails);


//Classes

/* The class `noNewsAvailableError` extends the `Error` class and is used to represent an error when no
news is available. */
class noNewsAvailableError extends Error{
  constructor(message){
    super(message);
    this.name = "noNewsAvailableError";
  }
}


//Functions

/**
 * The function `getNewsDetails` fetches news details from an API, handles errors, and updates the news
 * counter and loader animation accordingly.
 */
async function getNewsDetails(){
  loaderIcon.style.display = "block"; // Show the loader animation
  try{
    if (idsArray.length == 0 && newsCounterValue > 1) { // It there are no more news, throw the error and hide the button.
      //The news counter value check is made to prevent the noNewsAvaliableError to run if the result of the main fetch is undefined.
      throw new noNewsAvailableError(`There are no more news available to load, please refresh the page to see more recent ones`)
    }
    let ids = idsArray.splice(0, 10);
    let request = ids.map(id=>fetch(`${process.env.API_ID_URL}${id}.json`));
    let responses = await Promise.all(request);  
    for(let res of responses) {
      let validRes = await convalidNewsId(res);
      if (validRes === "skip") continue;
      let data = await res.json(); 
      data = await convalidNewsInfo(data); // Checks if the news info are valid
      newsBuilder(data); //  Creates the news
    }
  } catch (err) {
    if (err instanceof noNewsAvailableError){
      alert(`${err.message}`)
      console.log(err)
      loadMoreButton.style.display = "none";
    } else {
      alert(`A ${err.name} has occurred: ${err.message}`);
      console.log("An error has occurred:", err)
    }
  } finally {
    newsCounter.textContent = `Loaded news: ${newsCounterValue}`; // Update the news counter
    loaderIcon.style.display = "none"; //stop the loader animation
  }
}

/**
 * The function `convalidNewsId` checks and skips news with invalid response bodies from a fetch
 * request.
 * @param res - The `res` parameter in the `convalidNewsId` function is the response object returned
 * from a fetch request. The function checks if the response is not okay or has a status of 204 (No
 * Content). If either condition is met, it logs a message and attempts to fetch a new
 * @returns The function `convalidNewsId` returns a Promise that resolves to the response object from a
 * fetch request. If the response is not ok or has a status of 204, the function will log a message and
 * continue fetching news items until a valid response is received. If there are no more news IDs to
 * fetch, it will return the string "skip".
 */
async function convalidNewsId(res){
  while (!res.ok || res.status === 204){
    console.log("A news has been skipped due to an invalid response body from fetch");
    if (idsArray.length === 0) {
      return res == "skip";
    }
    let newID = idsArray.splice(0, 1)[0];
    try {
      res = await fetch(`${process.env.API_ID_URL}${newID}.json`);
    } catch (error) {
      console.error('Errore di rete:', error);
    }
  }
  return res;
}

/**
 * The function `convalidNewsInfo` is an asynchronous function that validates news data and fetches
 * additional data if necessary before returning the validated news object.
 * @param data - The `data` parameter in the `convalidNewsInfo` function is an object that should have
 * the properties `title` and `url`. If these properties are missing or undefined, the function will
 * log an error message and attempt to fetch new data from a Hacker News API using an ID from an
 * @returns The `convalidNewsInfo` function returns the validated news data object with the author name
 * and news date filled in if they were missing.
 */
async function convalidNewsInfo(data){
  if (!data || data.title === undefined || data.url === undefined) {
    let consoleNotification = (data != null && data.id) ? `Error: invalid object at id ${data.id}. News skipped` : `Error: id number ${data} invalid. News skipped`; // Create a notification for the console
    console.log(consoleNotification);
    let newID;
    do {
      if (idsArray.length < 1) throw new noNewsAvailableError("No more news available");
      newID = idsArray.splice(0, 1)[0];
    } while (newID === null || newID === undefined)
    try{
      let request = await fetch(`${process.env.API_ID_URL}${newID}.json`);
      data = await request.json();
    } catch (err){
      console.log(`Error ${err.name}: id number ${newID} invalid. News skipped`) //Recall itself if title or url are invalid
    } finally {
      return convalidNewsInfo(data);
    }
  };
  if (data.by === undefined) {data.by = `Error, missing author name`};
  if (data.time === undefined) {data.time = `Error, missing news date`};
  return data;
}


/**
 * The `newsBuilder` function dynamically creates a news article element with various details and a
 * toggle to show more text if available.
 * @param newsData - The `newsData` parameter in the `newsBuilder` function seems to contain
 * information about a news article. It includes properties such as `id`, `title`, `by` (author),
 * `time` (timestamp), `url` (link to the article), and `text` (article description).
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
    if (newsData.text){
      let currentNews = document.getElementById(`${newsData.id}`);
      let currentNewsInfo = currentNews.querySelector(`.news-info`);
      currentNewsInfo.insertAdjacentHTML("beforeend", `
        <div class="news-text-toggle">&#8681; Show more &#8681;</div>
        <div class="news-text hidden">${newsData.text}</div>`);
      let newsToggle = currentNews.querySelector(`.news-text-toggle`);
      newsToggle.addEventListener("click", newsDescriptionToggle);
    }
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
  if (typeof unixTime === "string") return unixTime; //Check if the input is a string for error handling porposes
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
  if (typeof newsUnix === "string") return `Error, could not calculate the interval`; //Check if the input is a string for error handling porposes
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
 * month in the `months` array. For example, if `number` is 0, the function will return `January`
 * because `January` is at index 0 in the `months` array.
 * @returns The function `numberToMonth` takes a number as input and returns the corresponding month
 * name from the `months` array.
 */
function numberToMonth(number){
  let months = [`January`, `February`, `March`, `April`, `May`, `June`,
    `July`, `August`, `September`, `October`, `November`, `December`];
  return months[number];
}

/**
 * The function `newsDescriptionToggle` toggles the visibility of a news description when a user clicks
 * on a button, showing more or less content based on the current state.
 * @param e - The parameter `e` in the `newsDescriptionToggle` function is typically an event object
 * that represents the event that triggered the function. It can be an instance of the `Event`
 * interface in JavaScript, containing information about the event such as the type of event, the
 * target element that triggered the event
 */
function newsDescriptionToggle(e){
  let newsTextToggle = e.target;
  let newsText = newsTextToggle.nextElementSibling;
  if (newsText.classList.contains("hidden") ){
    newsTextToggle.innerHTML = "&#8679; Show less &#8679;";
    newsText.classList.remove("hidden");
  } else {
    newsTextToggle.innerHTML = "&#8681; Show more &#8681;";
    newsText.classList.add("hidden");
  }
}
