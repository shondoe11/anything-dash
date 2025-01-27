// store ALL API requests

export const fetchAirtableData = async () => {
    const airtableApiKey = import.meta.env.VITE_AIRTABLE_API_KEY;
    const airtableBaseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
    const airtableTableName = import.meta.env.VITE_AIRTABLE_TABLE_NAME;
    const url = `https://api.airtable.com/v0/${airtableBaseId}/${airtableTableName}`;
    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${airtableApiKey}`,
        },
    });
    const data = await response.json();
    return data.records;
};

export const postDataToAirtable = async (newRecord) => {
    const airtableApiKey = import.meta.env.VITE_AIRTABLE_API_KEY;
    const airtableBaseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
    const airtableTableName = import.meta.env.VITE_AIRTABLE_TABLE_NAME;
    const url = `https://api.airtable.com/v0/${airtableBaseId}/${airtableTableName}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${airtableApiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            records: [{fields: newRecord}],
        }),
    });
    const data = await response.json();
    return data;
};

export const editDataInAirtable = async (recordId, updatedFields) => {
    const airtableApiKey = import.meta.env.VITE_AIRTABLE_API_KEY;
    const airtableBaseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
    const airtableTableName = import.meta.env.VITE_AIRTABLE_TABLE_NAME;
    const url = `https://api.airtable.com/v0/${airtableBaseId}/${airtableTableName}/${recordId}`;
    const response = await fetch(url, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${airtableApiKey}`,
            'Content-Type': application/json,
        },
        body: JSON.stringify({
            fields: updatedFields,
        }),
    });
    const data = await response.json();
    return data;
};

export const deleteDataFromAirtable = async (recordId) => {
    const airtableApiKey = import.meta.env.VITE_AIRTABLE_API_KEY;
    const airtableBaseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
    const airtableTableName = import.meta.env.VITE_AIRTABLE_TABLE_NAME;
    const url = `https://api.airtable.com/v0/${airtableBaseId}/${airtableTableName}/${recordId}`;
    const response = await fetch(url, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${airtableApiKey}`,
        },
    });
    const data = await response.json();
    return data;
};

export const fetchWeatherData = async (city) => {
    const weatherApiKey = import.meta.env.VITE_WEATHERAPI_KEY;
    const url = `https://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${city}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
};

export const fetchNEAWeatherData = async () => {
    const url = `https://api.data.gov.sg/v1/environment/2-hour-weather-forecast`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
};

export const fetchCoinGeckoData = async () => {
    const coinGeckoUrl = import.meta.env.VITE_COINGECKO_URL;
    const url = `${coinGeckoUrl}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
};

export const fetchFootballData = async () => {
    const footballDataKey = import.meta.env.VITE_FOOTBALL_DATA_KEY;
    const url = `https://cors-anywhere.herokuapp.com/https://api.football-data.org/v4/competitions/PL/standings`;
    const response = await fetch(url, {
        headers: {
            'X-Auth-Token': footballDataKey,
        },
    });
    const data = await response.json();
    return data;
};

export const fetchAnimeData = async () => {
    const url = `https://api.jikan.moe/v4/recommendations/anime`
    const response = await fetch(url);
    const data = await response.json();
    return data;
};
