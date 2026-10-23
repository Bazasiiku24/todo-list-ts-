import './style.css'

function getElement<T extends HTMLElement>(selector: string): T{
  const el = document.querySelector(selector)
  if(!el){
    throw new Error(`${selector}が見つかりません`);
  }
  return el as T;
}

const btn = getElement<HTMLButtonElement>(".btn");
const inputArea = getElement<HTMLInputElement>(".input-area");
const temperature = getElement<HTMLDivElement>(".weather-value");
const relativeHumidity = getElement<HTMLDivElement>(".relative-humidity");
const windSpeed = getElement<HTMLDivElement>(".wind-speed");
const windDirection = getElement<HTMLDivElement>(".wind-direction");
const apparentTemperature = getElement<HTMLDivElement>(".apparent-temperature");
const card = getElement<HTMLDivElement>(".card");
const weather = getElement<HTMLDivElement>(".weather");
const load = getElement<HTMLDivElement>(".loading");

interface WeatherResponse {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    weather_code: number;
  };
}

function handleSearch() {
    const cityName = inputArea.value.trim();

    if (cityName.length === 0) {
        alert("都市名を入力してください");
        return;
    }
    search(cityName);
}

btn.addEventListener("click", handleSearch);

inputArea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.isComposing) {
        handleSearch();
    }
});

interface GeoResponse {
            results?: { latitude: number; longitude: number }[];
}

async function search(cityName: string) {
    load.style.display = "block"
    try {
        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}`);

        if (!response.ok) {
            throw new Error("都市情報を取得できませんでした");
        }

        
        
        const geoData: GeoResponse = await response.json();
        
        if (!geoData.results) {
            throw new Error("都市情報が見つかりませんでした");
        }
        const lat = geoData.results[0].latitude;
        const lon = geoData.results[0].longitude;
    
        const weatherResponse= await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,weather_code`)
        if (!weatherResponse.ok) {
            throw new Error("天気情報を取得できませんでした");
        }
        const weatherData: WeatherResponse = await weatherResponse.json();
        render(weatherData);

    }catch (error) {
        if (error instanceof Error) {
            alert(error.message);
        }else{
            return;
        }
    }finally {
        load.style.display = "none"
    }
    

}

function render(weatherData: WeatherResponse){
    card.classList.add("run")
    temperature.textContent = String(weatherData.current.temperature_2m);
    relativeHumidity.textContent = String(weatherData.current.relative_humidity_2m);
    windSpeed.textContent = String(weatherData.current.wind_speed_10m);
    windDirection.textContent = String(weatherData.current.wind_direction_10m);
    apparentTemperature.textContent = String(weatherData.current.apparent_temperature);

    weatherCode(weatherData);
}

interface WeatherInfo {
    label: string;
    icon: string;
}

const weatherInfo: Record<number, WeatherInfo | undefined> = {
    0: { label: "Clear sky", icon: "fa-solid fa-sun" },
    1: { label: "Mainly clear", icon: "fa-solid fa-cloud-sun" },
    2: { label: "Partly cloudy", icon: "fa-solid fa-cloud-sun"},
    3: {label: "Overcast", icon: "fa-solid fa-cloud" },
    45: { label: "Fog", icon: "fa-solid fa-smog"},
    48: { label: "Depositing rime fog", icon: "fa-solid fa-smog" },
    51: { label: "Drizzle: Light", icon: "fa-solid fa-cloud-rain" },
    53: { label: "Drizzle: Moderate", icon: "fa-solid fa-cloud-rain" },
    55: { label: "Drizzle: Dense intensity", icon: "fa-solid fa-cloud-rain" },
    56: { label: "Freezing Drizzle: Light", icon: "fa-solid fa-cloud-rain" },
    57: { label: "Freezing Drizzle: Dense intensity", icon: "fa-solid fa-cloud-rain" },
    61: { label: "Rain: Slight", icon: "fa-solid fa-cloud-rain" },
    63: { label: "Rain: Moderate", icon: "fa-solid fa-cloud-showers-heavy" },
    65: { label: "Rain: Heavy intensity", icon: "fa-solid fa-cloud-showers-heavy" },
    66: { label: "Freezing Rain: Light", icon: "fa-solid fa-cloud-showers-heavy" },
    67: { label: "Freezing Rain: Heavy intensity", icon: "fa-solid fa-cloud-showers-heavy" },
    71: { label: "Snow fall: Slight", icon: "fa-solid fa-snowflake" },
    73: { label: "Snow fall: Moderate", icon: "fa-solid fa-snowflake" },
    75: { label: "Snow fall: Heavy", icon: "fa-solid fa-snowflake" },
    77: { label: "Snow grains", icon: "fa-solid fa-snowflake" },
    80: { label: "Rain showers: Slight", icon: "fa-solid fa-cloud-showers-heavy" },
    81: { label: "Rain showers: Moderate", icon: "fa-solid fa-cloud-showers-heavy" },
    82: { label: "Rain showers: Violent", icon: "fa-solid fa-cloud-showers-heavy" },
    85: { label: "Snow showers slight", icon: "fa-solid fa-snowflake" },    
    86: { label: "Snow showers heavy", icon: "fa-solid fa-snowflake" },
    95: { label: "Thunderstorm: Slight or moderate", icon: "fa-solid fa-bolt" },
    96: { label: "Thunderstorm with slight hail", icon: "fa-solid fa-bolt" },
    99: { label: "Thunderstorm with heavy hail", icon: "fa-solid fa-bolt" }
};

function weatherCode(weatherData: WeatherResponse){
    const code = weatherData.current.weather_code;
    const info = weatherInfo[code];

    if (!info) {
        weather.innerHTML = "<div>?</div>";
        return;
    }
    
    weather.innerHTML = `<i id="weather-mark" class="${info.icon}"></i>
    <div>${info.label}</div>`;
    
}

