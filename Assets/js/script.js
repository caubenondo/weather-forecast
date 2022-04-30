/* MODELs */
const k = "bef0a92fe8a7334398abf5c043287c9c";
const mainCityDisplay = document.querySelector(".mainCityDisplay");
const fiveDaysDisplay = document.querySelector(".fiveDaysDisplay");
const baseWeather = "https://api.openweathermap.org/data/2.5/weather?";
const daKey = "&appid=" + k;
const geocoding = "https://api.openweathermap.org/geo/1.0/direct?";
const oneCall = "https://api.openweathermap.org/data/2.5/onecall?";
let citySearch = "san diego";
const history = document.querySelector("#history");
const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector("#search-input");
const searchResult = document.querySelector("#search-result");
let localHistory = [];
const cityLabel = document.querySelector(".cityLabel");
const forecastLabel = document.querySelector(".forecastLabel");

/* Search city FORM handle */
searchForm.addEventListener("submit", function (e) {
    e.preventDefault();
    citySearch = searchInput.value;
    const url = geocoding + `q=${citySearch}&limit=5&` + daKey;
    // fectch only when the userInput is not null or empty
    if (!!citySearch) {
        fetch(url)
            .then((res) => res.json())
            .then((data) => {
                console.log(data)
                // validate the search result and provide user feedback
                if(data.length>0){
                    let templateHTML = `<div class='text-center'>
                        <h4><i class="fa-solid fa-map-location-dot text-primary"></i> Locations found</h4>
                    `;
                    // passing city name, lat and lon on button's dataset
                    for (let city of data) {
                        templateHTML += ` 
                        <button data-lat='${city.lat}' data-lon='${city.lon}' data-name='${city.name}' data-state='${!!city.state ? city.state : ""}' data-country='${city.country}' class='btn btn-outline-primary btn-city mb-2 btn-block'>${city.name}, ${!!city.state ? city.state + "," : ""} ${city.country}</button>
                    `;
                    }
                    templateHTML += `</div>`;
                    searchResult.innerHTML = templateHTML;
                }else{
                    searchResult.textContent = 'No location found';
                }
            });
    }
});

/* Handle user city selection */
searchResult.addEventListener("click", function (e) {
    let target = e.target;
    // only taking care of the button click in search result
    if (target.matches(".btn-city")) {
        // catch all the city data of the first fetch from button dataset
        const cityObj = {
            ...target.dataset,
        };
        // check if the clicked city is already in History section
        let filteredCities = localHistory.filter(
            (city) => city.lat == cityObj.lat && city.lon == cityObj.lon
        );
        // if not then push the selected city to localHistory, then store it to localstorage
        if (filteredCities.length == 0) {
            localHistory.push(cityObj);
        }    
        localStorage.setItem("cityHistory", JSON.stringify(localHistory));
        // rerender the history view
        displayHistory(localHistory);
        // clear search inputs and result
        searchResult.innerHTML = "";
        searchInput.value = "";
        //render the weather results
        displayWeather(cityObj);
    }
});
// display the weather of selected city
async function displayWeather(cityObj) {
    // user onecall from openweather API
    const searchURI =
        oneCall +
        `lat=${cityObj.lat}&lon=${cityObj.lon}&exclude=minutely,hourly&units=imperial&` +
        daKey;
    cityLabel.textContent = `${cityObj.name}, ${!!cityObj.state ? cityObj.state + "," : ""
        } ${cityObj.country}`;
    forecastLabel.textContent = "6-Day Forecast";
  
    // fetch data with city lat and lon
    await fetch(searchURI)
        .then((res) => res.json())
        .then((data) => {
            console.log(data);
            // plug data onto HTML template, using ternary for conditions
            let templateHTML = `
                <div class="card ${data.current.temp>85?'border-danger':data.current.temp>70?'border-warning':data.current.temp>50?'border-success':data.current.temp>20?'border-info':'border-primrary'}">     
                    <div class='card-header px-5 ${data.current.temp>85?'bg-danger bg-gradient text-white':data.current.temp>70?'bg-warning bg-gradient':data.current.temp>50?'bg-light bg-gradient':data.current.temp>20?'bg-info bg-gradient text-white':'bg-primrary bg-gradient text-white'}'>
                        <h3 class="card-title">
                            ${moment(data.current.dt, "X").format("dddd, MMMM Do, YYYY")}
                        </h3>
                        <h4 class="card-subtitle mb-2">${data.current.weather[0].main} - ${data.current.weather[0].description}</h4>
                    </div>
                    <div class="card-body">
                       
                        <div class='row'>
                            <div class='col-4'><img class='img-fluid' src="https://openweathermap.org/img/wn/${data.current.weather[0].icon}@4x.png" class="rounded-circle card-img-top" alt="weather today"></div>
                            <div class='col-4 align-self-center'>
                            <p class='h5 ${data.current.temp>85?'text-danger':data.current.temp>70?'text-warning':data.current.temp>40?'text-success':data.current.temp>20?'text-info':'text-primrary'}'><i class="fa-solid fa-temperature-full"></i> ${data.current.temp} <span>&#176;</span>F</p>
                            <p class='h5'><i class="fa-solid fa-wind"></i> ${data.current.wind_speed} MPH</p>
                            <p class='h5'><i class="fa-solid fa-droplet"></i> ${data.current.humidity}%</p>
                            </div>
                            <div class='col-4 align-self-center'>
                            <p class='h5'><i class="fa-solid fa-radiation ${data.current.uvi>=8?'text-danger':data.current.uvi>=5?'text-warning':data.current.uvi>=3?'text-info':'text-success'}"></i> ${data.current.uvi} (UVI)</p>
                            <p class='h5'><i class="fa-solid  fa-sun text-warning"></i> ${moment(data.current.sunrise, "X").format("h:mma")}</p>
                            <p class='h5'><i class="fa-solid fa-sun text-info"></i> ${moment(data.current.sunset, "X").format("h:mma")}</p>
                            </div>
                            
                        </div>                
                    </div>
                </div>
            `;
            // render the template
            mainCityDisplay.innerHTML = templateHTML;
            let forecastHTML = `<div class='row'>`;
            // craft the thml template for forecast section
            for (let i = 1; i <= 6; i++) {
                const dayForecast = data.daily[i];
                forecastHTML += `<div class='col-md-6 col-lg-4 p-1' >
                                <div class="card h-100  p-0 ${dayForecast.temp.day>85?'border-danger':dayForecast.temp.day>70?'border-warning':dayForecast.temp.day>40?'border-success':dayForecast.temp.day>20?'border-info':'border-primrary'}">
                                    <div class='card-header text-center bg-white'>
                                        <div class='row align-items-center'>
                                            
                                            <div class='col-8 text-left'>
                                                <h3 class="card-title col-12">${moment(dayForecast.dt, "X").format("dddd")}</h3>
                                                <p class='h5 text-muted'>${moment(dayForecast.dt, "X").format("DD-MM-YYYY")}</p>
                                                <p class='h6 text-muted'>${dayForecast.weather[0].main} - ${dayForecast.weather[0].description}</p>
                                            </div>    
                                            <div class='col-4'>
                                                <img class="img-fluid" src="https://openweathermap.org/img/wn/${dayForecast.weather[0].icon}@2x.png" alt="weather image">
                                            </div>    
                                        </div>
                                        
                                    </div>
                                    <div class="card-body row px-4">
                                        <div class='col-12'>
                                            
                                        </div>
                                        <div class='col-6 col-md-12 col-lg-6'>
                                            <p><i class="fa-solid fa-temperature-full ${dayForecast.temp.day>85?'text-danger':dayForecast.temp.day>70?'text-warning':dayForecast.temp.day>40?'text-success':dayForecast.temp.day>20?'text-info':'text-primrary'}"></i> ${dayForecast.temp.day} <span>&#176;</span>F</p>
                                            <p><i class="fa-solid fa-wind"></i> ${dayForecast.wind_speed} MPH</p>
                                            <p><i class="fa-solid fa-droplet"></i> ${dayForecast.humidity}%</p>
                                        </div>
                                        <div class='col-6 col-md-12 col-lg-6'>
                                            <p><i class="fa-solid fa-radiation ${dayForecast.uvi>=8?'text-danger':dayForecast.uvi>=5?'text-warning':dayForecast.uvi>=3?'text-info':'text-success'}"></i> ${dayForecast.uvi}</p>
                                            <p><i class="fa-solid  fa-sun text-warning"></i> ${moment(dayForecast.sunrise, "X").format("h:mma")}</p>
                                            <p><i class="fa-solid fa-sun text-info"></i> ${moment(dayForecast.sunset, "X").format("h:mma")}</p>
                                        </div>
                                        
                                    </div>
                                </div>
                            </div>
                            `;
            
            }
            //close and rennder the forecast section
            forecastHTML += `</div>`;
            fiveDaysDisplay.innerHTML = forecastHTML;
   
    });
}

// accept array of cities from mostly localstorage
// render the cities out on the HISTORY section
function displayHistory(cities) {
    let templateHTML = ``;
    // passing city name, lon, lat via dataset
    for (let city of cities) {
        templateHTML += `<button data-lat='${city.lat}' data-lon='${city.lon}' data-name='${city.name}' data-state='${!!city.state ? city.state : ""}' data-country='${city.country}' class='btn btn-outline-secondary btn-city-history btn-block mb-1'>${city.name}, ${!!city.state ? city.state + "," : ""} ${city.country}</button>`;
    }
    history.innerHTML = templateHTML;
}
// handle the clear history button
// wipe the localstorage then rerender the hisotory
document.querySelector("#clear-btn").addEventListener("click", function (e) {
    localHistory = [];
    localStorage.setItem("cityHistory", JSON.stringify(localHistory));
    displayHistory(localHistory);
});

// handle clicks on History section, listen only button click
// render the weather of the city on the button
history.addEventListener("click", function (e) {
    let target = e.target;
    if (target.matches(".btn-city-history")) {
        const cityObj = {
            ...target.dataset,
        };
        displayWeather(cityObj);
    }
});
// initial view
// grab the history from localstorage
function init() {
    localHistory = JSON.parse(localStorage.getItem("cityHistory")) || localHistory;
    displayHistory(localHistory);
}

init();