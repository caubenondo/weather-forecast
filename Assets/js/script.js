const k = "bef0a92fe8a7334398abf5c043287c9c";
const mainCityDisplay = document.querySelector(".mainCityDisplay");
const fiveDaysDisplay = document.querySelector(".fiveDaysDisplay");
const baseWeather = "https://api.openweathermap.org/data/2.5/weather?";
const daKey = "&appid=" + k;
const geocoding = "http://api.openweathermap.org/geo/1.0/direct?";
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
                    <button data-lat='${city.lat}' data-lon='${city.lon}' data-name='${city.name}' data-state='${!!city.state ? city.state : ""}' data-country='${city.country}' class='btn btn-outline-info btn-city mb-2 btn-block'>${city.name}, ${!!city.state ? city.state + "," : ""} ${city.country}</button>
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
    forecastLabel.textContent = "Next 6 days";
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
                <h6 class="card-subtitle mb-2 text-muted"></h6>
                <div class='row'>
                    <div class='col-md-4'><img class='card-img-top' src="http://openweathermap.org/img/wn/${data.current.weather[0].icon}@4x.png" class="rounded-circle card-img-top" alt="weather today"></div>
                    <div class='col-md-4 align-self-center'>
                    <p><i class="fa-solid fa-temperature-full"></i> ${data.current.temp} *F</p>
                    <p><i class="fa-solid fa-wind"></i> ${data.current.wind_speed} MPH</p>
                    <p><i class="fa-solid fa-droplet"></i> ${data.current.humidity}%</p>
                    </div>
                    <div class='col-md-4 align-self-center'>
                    <p><i class="fa-solid fa-radiation ${data.current.uvi>=8?'text-danger':data.current.uvi>=5?'text-warning':data.current.uvi>=3?'text-info':'text-success'}"></i> ${data.current.uvi} (UVI)</p>
                    <p><i class="fa-solid  fa-sun text-warning"></i> ${moment(data.current.sunrise, "X").format("h:mm A")}</p>
                    <p><i class="fa-solid fa-sun text-info"></i> ${moment(data.current.sunset, "X").format("h:mm A")}</p>
                    </div>
                </div>
                
                
                
            </div>
        </div>
        
        `;
            mainCityDisplay.innerHTML = templateHTML;
            let forecastHTML = `<div class='row'>`;
            let temps = [];
            for (let i = 1; i <= 6; i++) {
                const dayForecast = data.daily[i];

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

                forecastHTML += `
            <div class="card col-md-4">
                <img class="card-img-top" src="http://openweathermap.org/img/wn/${dayForecast.weather[0].icon}@4x.png" alt="weather image">
                <div class="card-body">
                <h4 class="card-title">${moment(dayForecast.dt, "X").format("ddd MM/DD/YY")}</h4>
                <p>Temp: ${dayForecast.temp.day} *F</p>
                    <p>Wind: ${dayForecast.wind_speed} MPH</p>
                    <p>Humidity: ${dayForecast.humidity}%</p>
                    <p>UV Index: ${dayForecast.uvi}</p>
                    <p>Sunrise: ${moment(dayForecast.sunrise, "X").format(
                        "h:mm A"
                    )}</p>
                    <p>Sunrise: ${moment(dayForecast.sunset, "X").format(
                        "h:mm A"
                    )}</p>
                    <canvas id='tempDay-${i}'></canvas>
                </div>
            </div>
          `;
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
        const cityObj = {...target.dataset,};
        displayWeather(cityObj);
    }
});

function init() {
    localHistory =JSON.parse(localStorage.getItem("cityHistory")) || localHistory;
    displayHistory(localHistory);
}

init();