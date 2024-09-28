const userLocation = document.getElementById("userLocation"),
    converter = document.getElementById("converter"),
    weatherIcon = document.querySelector(".weatherIcon"),
    temperature = document.querySelector(".temperature"),
    feelsLike = document.querySelector(".feelsLike"),
    description = document.querySelector(".description"),
    date = document.querySelector(".date"),
    city = document.querySelector(".city"),
    HValue = document.getElementById("HValue"),
    WValue = document.getElementById("WValue"),
    SRValue = document.getElementById("SRValue"),
    SSValue = document.getElementById("SSValue"),
    CValue = document.getElementById("CValue"),
    UVValue = document.getElementById("UVValue"),
    PValue = document.getElementById("PValue"),
    Forecast = document.querySelector(".forecast");


const API_KEY = '318b11db9cd27a1bbdd3e39640c06f23';
const WEATHER_API_ENDPOINT = `https://api.openweathermap.org/data/2.5/weather?appid=${API_KEY}&q=`;
const FORECAST_API_ENDPOINT = `https://api.openweathermap.org/data/2.5/forecast?appid=${API_KEY}&q=`;
const UV_API_ENDPOINT = `https://api.openweathermap.org/data/2.5/uvi?appid=${API_KEY}&lat=`;

function findUserLocation() {
    Forecast.innerHTML = "";

    fetchWeatherData();
    fetchForecastData();
}

function toFahrenheit(celsius) {
    return Math.round((celsius * 9/5) + 32);
}

function updateTemperatureDisplay(temp, unit) {
    if (unit === "F") {
        return `${toFahrenheit(temp)}°F`;
    } else {
        return `${Math.round(temp)}°C`;
    }
}

function fetchWeatherData() {
    fetch(`${WEATHER_API_ENDPOINT}${userLocation.value}&units=metric`)
        .then(handleResponse)
        .then(data => {
            city.innerHTML = `${data.name}, ${data.sys.country}`;
            weatherIcon.style.backgroundImage = `url('http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png')`;
            temperature.innerHTML = updateTemperatureDisplay(data.main.temp, converter.value);
            feelsLike.innerHTML = `Feels Like: ${updateTemperatureDisplay(data.main.feels_like, converter.value)}`;
            description.innerHTML = `${data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1)}`;
            date.innerHTML = new Date().toLocaleDateString();

            updateWeatherHighlights(data);
            getUVIndex(data.coord.lat, data.coord.lon);
        })
        .catch(handleError);
}

function fetchForecastData() {
    fetch(`${FORECAST_API_ENDPOINT}${userLocation.value}&units=metric`)
        .then(handleResponse)
        .then(data => {
            data.list.forEach(day => {
                if (day.dt_txt.includes("12:00:00")) {
                    const forecastItem = createForecastItem(day);
                    Forecast.appendChild(forecastItem);
                }
            });
        })
        .catch(handleError);
}

function handleResponse(response) {
    if (!response.ok) {
        throw new Error('Network response was not ok: ' + response.statusText);
    }
    return response.json();
}

function handleError(error) {
    console.error("Fetch error: ", error);
    alert('Could not fetch weather data. Please try again later.');
}

function updateWeatherHighlights(data) {
    HValue.innerHTML = `${data.main.humidity}%`;
    WValue.innerHTML = `${Math.round(data.wind.speed)} km/h`;
    SRValue.innerHTML = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    SSValue.innerHTML = new Date(data.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    CValue.innerHTML = `${data.clouds.all}%`;
    PValue.innerHTML = `${data.main.pressure} hPa`;
}

function getUVIndex(lat, lon) {
    fetch(`${UV_API_ENDPOINT}${lat}&lon=${lon}`)
        .then(handleResponse)
        .then(data => {
            UVValue.innerHTML = data.value;
        })
        .catch(handleError);
}

function createForecastItem(day) {
    const item = document.createElement("div");
    item.classList.add("forecast-item");
    
    const date = document.createElement("div");
    date.classList.add("forecast-date");
    date.textContent = new Date(day.dt * 1000).toLocaleDateString();

    const icon = document.createElement("img");
    icon.src = `http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`;
    icon.classList.add("forecast-icon");

    const temperatures = document.createElement("div");
    temperatures.classList.add("forecast-temperatures");
    temperatures.innerHTML = `<span>Day: ${updateTemperatureDisplay(day.main.temp_max, converter.value)}</span><span>Night: ${updateTemperatureDisplay(day.main.temp_min, converter.value)}</span>`;
    
    const desc = document.createElement("div");
    desc.classList.add("forecast-desc");
    desc.textContent = day.weather[0].description;

    item.append(date, icon, temperatures, desc);
    return item;
}

converter.addEventListener("change", () => {
    fetchWeatherData();
    fetchForecastData(); 
});