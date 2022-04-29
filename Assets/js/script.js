const k='bef0a92fe8a7334398abf5c043287c9c'
const mainCityDisplay = document.querySelector('.mainCityDisplay');
const fiveDaysDisplay = document.querySelector('.fiveDaysDisplay');


let city = 'san diego';
const base = 'https://api.openweathermap.org/data/2.5/weather?';
const daKey = '&appid='+k;
let url = base+`q=${city}`+daKey;

fetch(url).then(res=>res.json()).then((data)=>{
    console.log(data)
    mainCityDisplay.innerHTML = `<h2>Main City</h2>
        <h4>${data.name}, ${data.sys.country}</h4>
        <p>Population: ${data.sys.population}</p>
        <p>Sunrise: ${moment(data.sys.sunrise,'X').format('hh:mm A')}</p>
        <p>Sunset: ${moment(data.sys.sunset,'X').format('hh:mm A')}</p>
    `;

    fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${data.coord.lat}&lon=${data.coord.lon}&exclude=minutely,hourly&units=imperial&appid=${k}`).then(res=>res.json()).then((onecall)=>{
        console.log(onecall)
    })

    fiveDaysDisplay.innerHTML = '<h3>5Days</h3>'
})

let key='e5caa6719d474edb19611194ae96a441';
fetch('https://api.openweathermap.org/data/2.5/forecast?q=san%20diego&appid='+key).then(res=>res.json()).then((data)=>{

    console.log(data)
})