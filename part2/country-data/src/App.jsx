import { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [search, setSearch] = useState("");
  const [allCountries, setAllCountries] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [weather, setWeather] = useState(null);

  const api_key = import.meta.env.VITE_SOME_KEY;

  useEffect(() => {
    axios
      .get("https://studies.cs.helsinki.fi/restcountries/api/all")
      .then((response) => setAllCountries(response.data));
  }, []);

  useEffect(() => {
    const results = allCountries.filter((country) =>
      country.name.common.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredCountries(results);
    setSelectedCountry(null);
  }, [search, allCountries]);

  useEffect(() => {
    if (!selectedCountry) return;

    const lat = selectedCountry.capitalInfo?.latlng?.[0];
    const lon = selectedCountry.capitalInfo?.latlng?.[1];

    if (!lat || !lon) return;

    axios
      .get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}`
      )
      .then((response) => setWeather(response.data))
      .catch((err) => console.error("Weather API error:", err));
  }, [selectedCountry, api_key]);

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  const handleShowClick = (country) => {
    setSelectedCountry(country);
  };

  const renderCountryDetails = (country) => (
    <div>
      <h1>{country.name.common}</h1>
      <p>Capital {country.capital[0]}</p>
      <p>Area {country.area}</p>
      <h3>Languages</h3>
      <ul>
        {Object.values(country.languages).map((lang) => (
          <li key={lang}>{lang}</li>
        ))}
      </ul>
      <img
        src={country.flags.png}
        alt={`Flag of ${country.name.common}`}
        width="150"
      />
      {weather && (
        <div>
          <h3>Weather in {country.capital[0]}</h3>
          <p>Temperature: {weather.main.temp}°C</p>
          <img
            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
            alt="Weather icon"
          />
          <p>Wind: {weather.wind.speed} m/s</p>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <label>find countries </label>
      <input value={search} onChange={handleSearchChange} />

      {filteredCountries.length > 10 && (
        <p>Too many matches, specify another filter</p>
      )}

      {filteredCountries.length <= 10 && filteredCountries.length > 1 && (
        <ul>
          {filteredCountries.map((country) => (
            <li key={country.cca3}>
              {country.name.common}
              <button onClick={() => handleShowClick(country)}>Show</button>
            </li>
          ))}
        </ul>
      )}

      {filteredCountries.length === 1 &&
        renderCountryDetails(filteredCountries[0])}
      {selectedCountry &&
        filteredCountries.length > 1 &&
        renderCountryDetails(selectedCountry)}
    </div>
  );
}

export default App;
