// store ALL API requests

export const fetchAirtableData = async () => {
    const airtableApiKey = import.meta.env.VITE_AIRTABLE_API_KEY;
    const airtableBaseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
    const airtableTableTodo = import.meta.env.VITE_AIRTABLE_TABLE_TODO;
    const url = `https://thingproxy.freeboard.io/fetch/https://api.airtable.com/v0/${airtableBaseId}/${airtableTableTodo}`;
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
    const airtableTableTodo = import.meta.env.VITE_AIRTABLE_TABLE_TODO;
    const url = `https://thingproxy.freeboard.io/fetch/https://api.airtable.com/v0/${airtableBaseId}/${airtableTableTodo}`;
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
    const airtableTableTodo = import.meta.env.VITE_AIRTABLE_TABLE_TODO;
    const url = `https://thingproxy.freeboard.io/fetch/https://api.airtable.com/v0/${airtableBaseId}/${airtableTableTodo}/${recordId}`;
    const response = await fetch(url, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${airtableApiKey}`,
            'Content-Type': 'application/json',
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
    const airtableTableTodo = import.meta.env.VITE_AIRTABLE_TABLE_TODO;
    const url = `https://thingproxy.freeboard.io/fetch/https://api.airtable.com/v0/${airtableBaseId}/${airtableTableTodo}/${recordId}`;
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

export const fetchFourDayWeatherDataSG = async () => {
    const url=`https://api-open.data.gov.sg/v2/real-time/api/four-day-outlook`
    const options = {method: 'GET'};
    const response = await fetch(url, options);
    const data = await response.json();
    // console.log("API response: ", data);
    return data;
}

export const fetchNEAWeatherData = async () => {
    const url = `https://api.data.gov.sg/v1/environment/2-hour-weather-forecast`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
};

export const fetchCoinGeckoData = async (currency = 'sgd', page = 1, searchQuery = '') => {
    const coinGeckoUrl = import.meta.env.VITE_COINGECKO_URL;
    const coinGeckoKey = import.meta.env.VITE_COINGECKO_API_KEY;
    const url = `${coinGeckoUrl}/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=10&page=${page}&sparkline=false`;
    try {
        const response = await fetch(url, {
            headers: {
                "x-cg-demo-api-key": coinGeckoKey,
            },
        });
        if (!response.ok) {
            throw new Error(`error! status: ${response.status}`)
        }
        const data = await response.json();
        if (searchQuery) {
            return data.filter(
                (coin) => coin.name.toLowerCase().includes(searchQuery.toLowerCase()) || coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        return data;
    } catch (error) {
        console.error('CoinGecko data fetch FAIL: ', error);
        return []; // return empty, prevent crashs
    }
};

export const fetchFootballData = async (compeId = 'PL') => {
    const footballDataKey = import.meta.env.VITE_FOOTBALL_DATA_KEY;
    const url = `https://thingproxy.freeboard.io/fetch/https://api.football-data.org/v4/competitions/${compeId}/standings`;
    const response = await fetch(url, {
        headers: {
            'X-Auth-Token': footballDataKey,
        },
    });
    const data = await response.json();
    return data;
};

export const fetchAnimeData = async () => {
    const url = `https://api.jikan.moe/v4/top/anime?filter=airing`
    const response = await fetch(url);
    const data = await response.json();
    return data;
};
