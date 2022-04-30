const k = "bef0a92fe8a7334398abf5c043287c9c";
const mainCityDisplay = document.querySelector(".mainCityDisplay");
const fiveDaysDisplay = document.querySelector(".fiveDaysDisplay");
const baseWeather = "https://api.openweathermap.org/data/2.5/weather?";
const daKey = "&appid=" + k;
const geocoding = "https://api.openweathermap.org/geo/1.0/direct?";
const oneCall = "https://api.openweathermap.org/data/2.5/onecall?";
let citySearch = "san diego";
const history = document.querySelector("#history");
const searchBtn = document.querySelector("#search-button");
const searchInput = document.querySelector("#search-input");
const searchResult = document.querySelector("#search-result");
let localHistory = [];
const cityLabel = document.querySelector(".cityLabel");
const forecastLabel = document.querySelector(".forecastLabel");
searchBtn.addEventListener("click", function (e) {
    citySearch = searchInput.value;
    const url = geocoding + `q=${citySearch}&limit=5&` + daKey;
    if (!!citySearch) {
        fetch(url)
            .then((res) => res.json())
            .then((data) => {
                let templateHTML = `<div class='text-center'>
                <h4>We found these cities</h4>
            `;
                for (let city of data) {
                    templateHTML += ` 
                    <button data-lat='${city.lat}' data-lon='${city.lon}' data-name='${city.name}' data-state='${!!city.state ? city.state : ""}' data-country='${city.country}' class='btn btn-outline-primary btn-city mb-2 btn-block'>${city.name}, ${!!city.state ? city.state + "," : ""} ${city.country}</button>
                `;
                }
                templateHTML += `</div>`;
                searchResult.innerHTML = templateHTML;
            });
    }
});

searchResult.addEventListener("click", function (e) {
    let target = e.target;

    if (target.matches(".btn-city")) {
        const cityObj = {
            ...target.dataset,
        };
        let filteredCities = localHistory.filter(
            (city) => city.lat == cityObj.lat && city.lon == cityObj.lon
        );
        if (filteredCities.length == 0) {
            localHistory.push(cityObj);
        }
        displayHistory(localHistory);
        localStorage.setItem("cityHistory", JSON.stringify(localHistory));
        searchResult.innerHTML = "";
        searchInput.value = "";
        displayWeather(cityObj);
    }
});

async function displayWeather(cityObj) {
    const searchURI =
        oneCall +
        `lat=${cityObj.lat}&lon=${cityObj.lon}&exclude=minutely&units=imperial&` +
        daKey;
    cityLabel.textContent = `${cityObj.name}, ${!!cityObj.state ? cityObj.state + "," : ""
        } ${cityObj.country}`;
    forecastLabel.textContent = "6-Days Forecast";
    let hourly = [];
    await fetch(searchURI)
        .then((res) => res.json())
        .then((data) => {
            console.log(data);

            let templateHTML = `
                <div class="card row">
                    <div class="card-body">
                        <h3 class="card-title">
                        ${moment(data.current.dt, "X").format("dddd, MMMM Do, YYYY")}
                        </h3>
                        <h4 class="card-subtitle mb-2 text-muted">${data.current.weather[0].main} - ${data.current.weather[0].description}</h4>
                        <div class='row'>
                            <div class='col-md-4'><img class='card-img-top' src="https://openweathermap.org/img/wn/${data.current.weather[0].icon}@4x.png" class="rounded-circle card-img-top" alt="weather today"></div>
                            <div class='col-md-4 align-self-center'>
                            <p><i class="fa-solid fa-temperature-full ${data.current.temp>90?'text-danger':data.current.temp>70?'text-warning':data.current.temp>40?'text-success':data.current.temp>20?'text-info':'text-primrary'}"></i> ${data.current.temp} <span>&#176;</span>F</p>
                            <p><i class="fa-solid fa-wind"></i> ${data.current.wind_speed} MPH</p>
                            <p><i class="fa-solid fa-droplet"></i> ${data.current.humidity}%</p>
                            </div>
                            <div class='col-md-4 align-self-center'>
                            <p><i class="fa-solid fa-radiation ${data.current.uvi>=8?'text-danger':data.current.uvi>=5?'text-warning':data.current.uvi>=3?'text-info':'text-success'}"></i> ${data.current.uvi} (UVI)</p>
                            <p><i class="fa-solid  fa-sun text-warning"></i> ${moment(data.current.sunrise, "X").format("h:mma")}</p>
                            <p><i class="fa-solid fa-sun text-info"></i> ${moment(data.current.sunset, "X").format("h:mma")}</p>
                            </div>
                            <canvas id='hourly'></canvas>
                        </div>                
                    </div>
                </div>
            `;
            mainCityDisplay.innerHTML = templateHTML;
            let forecastHTML = `<div class='row'>`;
            let temps = [];
            for (let i = 1; i <= 6; i++) {
                const dayForecast = data.daily[i];



                forecastHTML += `<div class='col-md-4 p-1' >
                                <div class="card  p-0 ${dayForecast.temp.day>90?'border-danger':dayForecast.temp.day>70?'border-warning':dayForecast.temp.day>40?'border-success':dayForecast.temp.day>20?'border-info':'border-primrary'}">
                                    <div class='card-header text-center bg-white'>
                                    <h3 class="card-title col-12">${moment(dayForecast.dt, "X").format("dddd")}</h3>
                                    <p class='text-center h5 text-muted'>${moment(dayForecast.dt, "X").format("DD-MM-YYYY")}</p>
                                    </div>
                                    <img class="card-img-top" src="https://openweathermap.org/img/wn/${dayForecast.weather[0].icon}@4x.png" alt="weather image">
                                    <div class="card-body row">
                                        <div class='col-12'>
                                            <p class='h5 text-muted text-center'>${dayForecast.weather[0].main} - ${dayForecast.weather[0].description}</p>
                                        </div>
                                        <div class='col-6 col-md-12 col-lg-6'>
                                            <p><i class="fa-solid fa-temperature-full ${dayForecast.temp.day>90?'text-danger':dayForecast.temp.day>70?'text-warning':dayForecast.temp.day>40?'text-success':dayForecast.temp.day>20?'text-info':'text-primrary'}"></i> ${dayForecast.temp.day} <span>&#176;</span>F</p>
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

                const temp = {
                    labels: ["morn", "day", "eve", "night"],
                    datasets: [{
                            label: "Temp",
                            borderColor: "rgb(60,186,159)",
                            backgroundColor: "rgb(60,186,159,0.1)",
                            borderWidth: 2,
                            data: [
                                dayForecast.temp.morn,
                                dayForecast.temp.day,
                                dayForecast.temp.eve,
                                dayForecast.temp.night,
                            ],
                        },
                        {
                            label: "Feel like",
                            borderColor: "red",
                            backgroundColor: "rgb(160,186,159,0.1)",
                            borderWidth: 2,
                            data: [
                                dayForecast.feels_like.morn,
                                dayForecast.feels_like.day,
                                dayForecast.feels_like.eve,
                                dayForecast.feels_like.night,
                            ],
                        },
                    ],
                };
                temps.push(temp);
            }

            forecastHTML += `</div>`;
            fiveDaysDisplay.innerHTML = forecastHTML;

            for (let i = 1; i <= 6; i++) {
                const myChart = new Chart(
                    document.querySelector(`#tempDay-${i}`).getContext("2d"), {
                        type: "line",
                        data: temps[i - 1],
                        options: {
                            responsive: true,
                        },
                    }
                );
            }

        
    });
}

function displayHistory(cities) {
    let templateHTML = ``;
    for (let city of cities) {
        templateHTML += `<button data-lat='${city.lat}' data-lon='${city.lon}' data-name='${city.name}' data-state='${!!city.state ? city.state : ""}' data-country='${city.country}' class='btn btn-outline-secondary btn-city-history btn-block mb-1'>${city.name}, ${!!city.state ? city.state + "," : ""} ${city.country}</button>`;
    }
    history.innerHTML = templateHTML;
}
document.querySelector("#clear-btn").addEventListener("click", function (e) {
    localHistory = [];
    displayHistory(localHistory);
    localStorage.setItem("cityHistory", JSON.stringify(localHistory));
});
history.addEventListener("click", function (e) {
    let target = e.target;
    if (target.matches(".btn-city-history")) {
        const cityObj = {
            ...target.dataset,
        };
        displayWeather(cityObj);
    }
});

function init() {
    localHistory = JSON.parse(localStorage.getItem("cityHistory")) || localHistory;
    displayHistory(localHistory);
}

init();