
const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const weatherCardsDiv = document.querySelector(".weather-cards");
const currentWeatherDiv = document.querySelector(".current-weather");
const locationButton = document.querySelector(".location-btn")

const API_KEY = "0b766e05e0b36cc236e9d19ad8579601";

const createWeatherCard = (cityName, weatherItem, index) => {
    if (index === 0) {
        return `
            <div class="details">
                <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)} &deg;C</h4>
                <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                <h4>Humidity: ${weatherItem.main.humidity}%</h4>
            </div>
            <div class="icon">
                <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather icon">
                <h4>${weatherItem.weather[0].description}</h4>
            </div>`;
    } else {
        return `
            <li class="card">
                <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather icon">
                <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)} &deg;C</h4>
                <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                <h4>Humidity: ${weatherItem.main.humidity}%</h4>
            </li>`;
    }
};

const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL)
        .then(res => res.json())
        .then(data => {
            const uniqueForecastDays = [];
            const fiveDaysForecast = data.list.filter(forecast => {
                const forecastDate = new Date(forecast.dt_txt).getDate();
                if (!uniqueForecastDays.includes(forecastDate)) {
                    uniqueForecastDays.push(forecastDate);
                    return true;
                }
                return false;
            });

            // Clear previous results
            cityInput.value = "";
            weatherCardsDiv.innerHTML = "";
            currentWeatherDiv.innerHTML = "";

            fiveDaysForecast.forEach((weatherItem, index) => {
                const cardHTML = createWeatherCard(cityName, weatherItem, index);
                if (index === 0) {
                    currentWeatherDiv.innerHTML = cardHTML;
                } else {
                    weatherCardsDiv.insertAdjacentHTML("beforeend", cardHTML);
                }
            });
        })
        .catch(() => {
            alert("An error occurred while fetching the weather forecast!");
        });
};

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (!cityName) return;
    const GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    fetch(GEOCODING_API_URL)
        .then(res => res.json())
        .then(data => {
            if (!data.length) return alert(`No coordinates found for ${cityName}`);
            const { name, lat, lon } = data[0];
            getWeatherDetails(name, lat, lon);
        })
        .catch(() => {
            alert("An error occurred while fetching the coordinates!");
        });
};

searchButton.addEventListener("click", getCityCoordinates);

// Enable Enter key search
cityInput.addEventListener("keyup", e => {
    if (e.key === "Enter") getCityCoordinates();
});

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const {latitude,longitude } = position.coords;
            // const REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            const REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=15.1229477&lon=77.6325593&limit=5&appid=${API_KEY}`;

            fetch(REVERSE_GEOCODING_URL)
            .then(res => res.json())
            .then(data => {
                if (!data.length) return alert("City not found for your location!");
                const { name, lat, lon } = data[0];
                getWeatherDetails(name, lat, lon);
            })
            .catch(() => {
                alert("An error occurred while fetching the city!");
            });

        },
        error =>{
            if(error.code === error.PERMISSION_DENIED){
                alert("Geolocation request denied. Please reset location permission to grant access again.");
            }
        }
    );
}


locationButton.addEventListener("click",getUserCoordinates);

