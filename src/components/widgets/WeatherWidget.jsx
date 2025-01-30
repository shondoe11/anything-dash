import { useEffect, useState } from "react";
import { fetchWeatherData, fetchNEAWeatherData } from "../../services/service";


export default function WeatherWidget() {
    

    // fetch initial NEA forecast data
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const neaData = await fetchNEAWeatherData();
                processForecastData(neaData);
            } catch (error) {
                console.error('error loading initial weather data: ', error);
            }
        };
        loadInitialData();
    }, []);
}