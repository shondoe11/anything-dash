//* store ALL API requests

//^ Airtable API

export const fetchAirtableData = async (userRecordId, userEmail) => {
    const airtableApiKey = import.meta.env.VITE_AIRTABLE_API_KEY;
    const airtableBaseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
    const airtableTableTodo = import.meta.env.VITE_AIRTABLE_TABLE_TODO;
    //& server-side filter by lookup email field fr user link
    const filterFormula = `{Email (from User)} = "${userEmail}"`;
    const url = `https://api.airtable.com/v0/${airtableBaseId}/${airtableTableTodo}?filterByFormula=${encodeURIComponent(filterFormula)}`;
    const response = await fetch(url, { headers: { Authorization: `Bearer ${airtableApiKey}` } });
    let records = [];
    if (!response.ok) {
        console.error(`[todo] fetchAirtableData error: ${response.status} ${response.statusText}`);
    } else {
        const data = await response.json();
        records = data.records || [];
    }
    if (!records.length) {
        const allUrl = `https://api.airtable.com/v0/${airtableBaseId}/${airtableTableTodo}`;
        const allResp = await fetch(allUrl, { headers: { Authorization: `Bearer ${airtableApiKey}` } });
        const allData = await allResp.json();
        records = allData.records.filter(r => Array.isArray(r.fields.User) && r.fields.User.includes(userRecordId));
    }
    return records;
};

export const postDataToAirtable = async (userRecordId, newRecord) => {
    const airtableApiKey = import.meta.env.VITE_AIRTABLE_API_KEY;
    const airtableBaseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
    const airtableTableTodo = import.meta.env.VITE_AIRTABLE_TABLE_TODO;
    const url = `https://api.airtable.com/v0/${airtableBaseId}/${airtableTableTodo}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${airtableApiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            records: [{ fields: { ...newRecord, User: [userRecordId] } }],
        }),
    });
    const data = await response.json();
    return data;
};

export const editDataInAirtable = async (recordId, updatedFields) => {
    const airtableApiKey = import.meta.env.VITE_AIRTABLE_API_KEY;
    const airtableBaseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
    const airtableTableTodo = import.meta.env.VITE_AIRTABLE_TABLE_TODO;
    const url = `https://api.airtable.com/v0/${airtableBaseId}/${airtableTableTodo}/${recordId}`;
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
    const url = `https://api.airtable.com/v0/${airtableBaseId}/${airtableTableTodo}/${recordId}`;
    const response = await fetch(url, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${airtableApiKey}`,
        },
    });
    const data = await response.json();
    return data;
};

//^ Weather APIs (global + SG)
export const fetchWeatherData = async (city) => {
    const weatherApiKey = import.meta.env.VITE_WEATHERAPI_KEY;
    const url = `https://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${city}&lang=en`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
};

//& forecast data (3/7 day & hourly)
export const fetchForecastWeatherData = async (city, days = 7, aqi = false, alerts = false) => {
    const weatherApiKey = import.meta.env.VITE_WEATHERAPI_KEY;
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${weatherApiKey}&q=${city}&days=${days}&aqi=${aqi}&alerts=${alerts}&lang=en`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
};

//& historical data
export const fetchHistoricalWeatherData = async (city, date) => {
    const url = `/.netlify/functions/weather-history?city=${encodeURIComponent(city)}&dt=${date}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
};

//& alerts
export const fetchWeatherAlerts = async (city) => {
    const weatherApiKey = import.meta.env.VITE_WEATHERAPI_KEY;
    const url = `https://api.weatherapi.com/v1/alerts.json?key=${weatherApiKey}&q=${city}&lang=en`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
};

//& autocomplete search
export const fetchSearchAutocomplete = async (query) => {
    const key = import.meta.env.VITE_WEATHERAPI_KEY;
    const url = `https://api.weatherapi.com/v1/search.json?key=${key}&q=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    return await res.json();
};

//& astronomy data
export const fetchAstronomyData = async (city, date) => {
    const key = import.meta.env.VITE_WEATHERAPI_KEY;
    const d = date || new Date().toISOString().split('T')[0];
    const url = `https://api.weatherapi.com/v1/astronomy.json?key=${key}&q=${encodeURIComponent(city)}&dt=${d}`;
    const res = await fetch(url);
    return await res.json();
};

//& timezone data
export const fetchTimezoneData = async (city) => {
    const key = import.meta.env.VITE_WEATHERAPI_KEY;
    const url = `https://api.weatherapi.com/v1/timezone.json?key=${key}&q=${encodeURIComponent(city)}`;
    const res = await fetch(url);
    return await res.json();
};

//& marine and tide data
export const fetchMarineData = async (lat, lon, date) => {
    const key = import.meta.env.VITE_WEATHERAPI_KEY;
    const d = date || new Date().toISOString().split('T')[0];
    const q = `${lat},${lon}`;
    const url = `https://api.weatherapi.com/v1/marine.json?key=${key}&q=${q}&dt=${d}`;
    const res = await fetch(url);
    return await res.json();
};

//& air quality data
export const fetchAirQualityData = async (city) => {
    const key = import.meta.env.VITE_WEATHERAPI_KEY;
    const url = `https://api.weatherapi.com/v1/airquality.json?key=${key}&q=${encodeURIComponent(city)}`;
    const res = await fetch(url);
    return await res.json();
};

//& sports data
export const fetchSportsData = async (sport) => {
    const key = import.meta.env.VITE_WEATHERAPI_KEY;
    const url = `https://api.weatherapi.com/v1/sports.json?key=${key}&q=${encodeURIComponent(sport)}`;
    const res = await fetch(url);
    return await res.json();
};

export const fetchFourDayWeatherDataSG = async () => {
    const url = `https://api-open.data.gov.sg/v2/real-time/api/four-day-outlook`
    const options = { method: 'GET' };
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

//& rainfall data sg
export const fetchRainfallDataSG = async () => {
    const url = `https://api.data.gov.sg/v1/environment/rainfall`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
};

//& uv index data sg
export const fetchUVIndexDataSG = async () => {
    const url = `https://api.data.gov.sg/v1/environment/uv-index`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
};

//& hourly 24-hour forecast SG
export const fetchHourlyForecastDataSG = async () => {
    //~ try Netlify Func first
    try {
        const res = await fetch('/.netlify/functions/hourly-forecast');
        if (!res.ok) throw new Error(`Function error: ${res.status}`);
        return await res.json();
    } catch (err) {
        console.warn('Netlify func failed, falling back to CORS proxy', err);
        const realUrl = 'https://api.data.gov.sg/v1/environment/24-hour-weather-forecast';
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(realUrl)}`;
        const proxyRes = await fetch(proxyUrl);
        if (!proxyRes.ok) throw new Error(`Proxy error: ${proxyRes.status}`);
        return await proxyRes.json();
    }
};

//^ CoinGecko API

//& local Netlify proxy in prod
const coinGeckoBaseUrl = import.meta.env.DEV ? '/api' : '/.netlify/functions/coingecko-proxy';

export const fetchCoinGeckoData = async (currency = 'sgd', page = 1, searchQuery = '') => {
    const coinGeckoKey = import.meta.env.VITE_COINGECKO_API_KEY;
    const baseUrl = coinGeckoBaseUrl;
    const url = `${baseUrl}/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=10&page=${page}&sparkline=false`;
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
        return []; //~ return empty, prevent crashs
    }
};

//& global mkt overview data
export const getGlobalData = async () => {
    const coinGeckoKey = import.meta.env.VITE_COINGECKO_API_KEY;
    const url = import.meta.env.DEV
        ? `${coinGeckoBaseUrl}/global`
        : `${coinGeckoBaseUrl}?endpoint=global`;
    try {
        const response = await fetch(url, {
            headers: { "x-cg-demo-api-key": coinGeckoKey },
        });
        if (!response.ok) throw new Error(`status: ${response.status}`);
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('getGlobalData fail:', error);
        return null;
    }
};

//& trending coins data
export const getTrendingCoins = async () => {
    const coinGeckoKey = import.meta.env.VITE_COINGECKO_API_KEY;
    const url = import.meta.env.DEV
        ? `${coinGeckoBaseUrl}/search/trending`
        : `${coinGeckoBaseUrl}?endpoint=search/trending`;
    try {
        const response = await fetch(url, {
            headers: { "x-cg-demo-api-key": coinGeckoKey },
        });
        if (!response.ok) throw new Error(`status: ${response.status}`);
        const data = await response.json();
        return data.coins.map(c => c.item);
    } catch (error) {
        console.error('getTrendingCoins fail:', error);
        return [];
    }
};

//& supported vs currencies
let vsCurrenciesCache = null;
export const getSupportedVsCurrencies = async () => {
    if (vsCurrenciesCache) return vsCurrenciesCache;
    const coinGeckoKey = import.meta.env.VITE_COINGECKO_API_KEY;
    const url = import.meta.env.DEV
        ? `${coinGeckoBaseUrl}/simple/supported_vs_currencies`
        : `${coinGeckoBaseUrl}?endpoint=simple/supported_vs_currencies`;
    try {
        const response = await fetch(url, { headers: { "x-cg-demo-api-key": coinGeckoKey } });
        if (!response.ok) throw new Error(`status: ${response.status}`);
        const data = await response.json();
        vsCurrenciesCache = data;
        return data;
    } catch (error) {
        console.error('getSupportedVsCurrencies fail:', error);
        //~ fallback common currencies
        const defaultList = ['usd','eur','jpy','gbp','btc','eth'];
        vsCurrenciesCache = defaultList;
        return defaultList;
    }
};

//& top gainers and losers (24h)
export const getTopGainersLosers = async (currency = 'usd', perPage = 5) => {
    const coinGeckoKey = import.meta.env.VITE_COINGECKO_API_KEY;
    //& fetch larger list, then sort manually by 24h change
    const url = import.meta.env.DEV
        ? `${coinGeckoBaseUrl}/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=100&page=1&sparkline=false`
        : `${coinGeckoBaseUrl}?endpoint=coins/markets&vs_currency=${currency}&order=market_cap_desc&per_page=100&page=1&sparkline=false`;
    try {
        const response = await fetch(url, { headers: { "x-cg-demo-api-key": coinGeckoKey } });
        if (!response.ok) throw new Error(`status: ${response.status}`);
        const data = await response.json();
        const valid = data.filter(c => c.price_change_percentage_24h != null);
        const gainers = [...valid]
            .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
            .slice(0, perPage);
        const losers = [...valid]
            .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
            .slice(0, perPage);
        return { gainers, losers };
    } catch (error) {
        console.warn('getTopGainersLosers fail:', error);
        return { gainers: [], losers: [] };
    }
};

//& volume leaders
export const getVolumeLeaders = async (currency = 'usd', perPage = 10) => {
    const coinGeckoKey = import.meta.env.VITE_COINGECKO_API_KEY;
    const url = import.meta.env.DEV
        ? `${coinGeckoBaseUrl}/coins/markets?vs_currency=${currency}&order=volume_desc&per_page=${perPage}&page=1&sparkline=false`
        : `${coinGeckoBaseUrl}?endpoint=coins/markets&vs_currency=${currency}&order=volume_desc&per_page=${perPage}&page=1&sparkline=false`;

    try {
        const response = await fetch(url, {
            headers: { "x-cg-demo-api-key": coinGeckoKey }
        });

        if (!response.ok) throw new Error(`status: ${response.status}`);

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('getVolumeLeaders fail:', error);
        return [];
    }
};

//& price history chart data
export const getCoinMarketChart = async (coinId, currency = 'usd', days = 1) => {
    const coinGeckoKey = import.meta.env.VITE_COINGECKO_API_KEY;
    //~ valid days values: 1, 7, 14, 30, 90, 180, 365, max
    const url = import.meta.env.DEV
        ? `${coinGeckoBaseUrl}/coins/${coinId}/market_chart?vs_currency=${currency}&days=${days}`
        : `${coinGeckoBaseUrl}?endpoint=coins/${coinId}/market_chart&vs_currency=${currency}&days=${days}`;

    try {
        const response = await fetch(url, {
            headers: { "x-cg-demo-api-key": coinGeckoKey }
        });

        if (!response.ok) throw new Error(`status: ${response.status}`);

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`getCoinMarketChart fail for ${coinId}:`, error);
        //~ fallback CORS proxy
        try {
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
            const proxyResp = await fetch(proxyUrl);
            if (!proxyResp.ok) throw new Error(`Proxy error: ${proxyResp.status}`);
            return await proxyResp.json();
        } catch (proxyErr) {
            console.error('getCoinMarketChart via proxy fail:', proxyErr);
            return { prices: [], market_caps: [], total_volumes: [] };
        }
    }
};

//& ohlc (candlestick) chart data
export const getCoinOHLC = async (coinId, currency = 'usd', days = 1) => {
    const coinGeckoKey = import.meta.env.VITE_COINGECKO_API_KEY;
    //~ valid days values: 1, 7, 14, 30, 90, 180, 365
    const url = import.meta.env.DEV
        ? `${coinGeckoBaseUrl}/coins/${coinId}/ohlc?vs_currency=${currency}&days=${days}`
        : `${coinGeckoBaseUrl}?endpoint=coins/${coinId}/ohlc&vs_currency=${currency}&days=${days}`;

    try {
        const response = await fetch(url, {
            headers: { "x-cg-demo-api-key": coinGeckoKey }
        });

        if (!response.ok) throw new Error(`status: ${response.status}`);

        const data = await response.json();
        return data; //~ returns arr [timestamp, open, high, low, close]
    } catch (error) {
        console.error(`getCoinOHLC fail for ${coinId}:`, error);
        //~ fallback CORS proxy
        try {
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
            const proxyResp = await fetch(proxyUrl);
            if (!proxyResp.ok) throw new Error(`Proxy error: ${proxyResp.status}`);
            return await proxyResp.json();
        } catch (proxyErr) {
            console.error('getCoinOHLC via proxy fail:', proxyErr);
            return [];
        }
    }
};

//& coin tickers & trading pairs
export const getCoinTickers = async (coinId, page = 1) => {
    const coinGeckoKey = import.meta.env.VITE_COINGECKO_API_KEY;
    const url = import.meta.env.DEV
        ? `${coinGeckoBaseUrl}/coins/${coinId}/tickers?page=${page}`
        : `${coinGeckoBaseUrl}?endpoint=coins/${coinId}/tickers&page=${page}`;

    try {
        const response = await fetch(url, {
            headers: { "x-cg-demo-api-key": coinGeckoKey }
        });

        if (!response.ok) throw new Error(`status: ${response.status}`);

        const data = await response.json();
        return data.tickers || [];
    } catch (error) {
        console.error(`getCoinTickers fail for ${coinId}:`, error);
        return [];
    }
};

//& token prices by platform
export const getTokenPrices = async (platformId = 'ethereum', tokenAddresses, currency = 'usd') => {
    const coinGeckoKey = import.meta.env.VITE_COINGECKO_API_KEY;
    const contractAddresses = Object.keys(tokenAddresses).join(',');
    const url = import.meta.env.DEV
        ? `${coinGeckoBaseUrl}/simple/token_price/${platformId}?contract_addresses=${contractAddresses}&vs_currencies=${currency}&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true`
        : `${coinGeckoBaseUrl}?endpoint=simple/token_price/${platformId}&contract_addresses=${contractAddresses}&vs_currencies=${currency}&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true`;

    try {
        const response = await fetch(url, {
            headers: { "x-cg-demo-api-key": coinGeckoKey }
        });

        if (!response.ok) throw new Error(`status: ${response.status}`);

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`getTokenPrices fail for ${platformId}:`, error);
        return {};
    }
};

//& full coin list fr dynamic selectors
export const getAllCoins = async () => {
    const coinGeckoKey = import.meta.env.VITE_COINGECKO_API_KEY;
    const url = import.meta.env.DEV
        ? `${coinGeckoBaseUrl}/coins/list`
        : `${coinGeckoBaseUrl}?endpoint=coins/list`;
    try {
        const response = await fetch(url, { headers: { "x-cg-demo-api-key": coinGeckoKey } });
        if (!response.ok) throw new Error(`status: ${response.status}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('getAllCoins fail:', error);
        //~ fallback CORS proxy
        try {
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
            const proxyResp = await fetch(proxyUrl);
            if (!proxyResp.ok) throw new Error(`Proxy error: ${proxyResp.status}`);
            return await proxyResp.json();
        } catch (proxyErr) {
            console.error('getAllCoins via proxy fail:', proxyErr);
            return [];
        }
    }
};

//& asset platforms fr TokenPrices
export const getAssetPlatforms = async () => {
    const coinGeckoKey = import.meta.env.VITE_COINGECKO_API_KEY;
    const url = import.meta.env.DEV
        ? `${coinGeckoBaseUrl}/asset_platforms`
        : `${coinGeckoBaseUrl}?endpoint=asset_platforms`;
    try {
        const response = await fetch(url, { headers: { "x-cg-demo-api-key": coinGeckoKey } });
        if (!response.ok) throw new Error(`status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('getAssetPlatforms fail:', error);
        return [];
    }
};

//^ Football API

export const fetchFootballData = async (compeId = 'PL') => {
    const url = `/.netlify/functions/football-proxy?league=${compeId}`;
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok || data.error) throw new Error(data.error || `status: ${response.status}`);
    return data;
};

//& fetch compe details
export const fetchCompetitionDetails = async (compeId = 'PL') => {
    const url = `/.netlify/functions/football-proxy?endpoint=competitions/${compeId}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
};

//& fetch matches fr specific compe
export const fetchCompetitionMatches = async (compeId = 'PL', dateFrom = null, dateTo = null, status = null) => {
    let url = `/.netlify/functions/football-proxy?endpoint=competitions/${compeId}/matches`;
    
    //~ add query params if provided
    const params = new URLSearchParams();
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);
    if (status) params.append('status', status); //~ SCHEDULED, LIVE, IN_PLAY, PAUSED, FINISHED, POSTPONED, SUSPENDED, CANCELED
    
    const queryString = params.toString();
    if (queryString) url += `&params=${encodeURIComponent(queryString)}`;
    
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok || data.error) throw new Error(data.error || `status: ${response.status}`);
    return data;
};

//& fetch teams fr specific compe
export const fetchCompetitionTeams = async (compeId = 'PL') => {
    const url = `/.netlify/functions/football-proxy?endpoint=competitions/${compeId}/teams`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
};

//& fetch team details
export const fetchTeamDetails = async (teamId) => {
    const url = `/.netlify/functions/football-proxy?endpoint=teams/${teamId}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
};

//& fetch team matches
export const fetchTeamMatches = async (teamId, status = null, dateFrom = null, dateTo = null) => {
    let url = `/.netlify/functions/football-proxy?endpoint=teams/${teamId}/matches`;
    
    //~ add query params if provided
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);
    
    const queryString = params.toString();
    if (queryString) url += `&params=${encodeURIComponent(queryString)}`;
    
    const response = await fetch(url);
    const data = await response.json();
    return data;
};

//& fetch scorers fr specific compe
export const fetchCompetitionScorers = async (compeId = 'PL', limit = 10) => {
    const url = `/.netlify/functions/football-proxy?endpoint=competitions/${compeId}/scorers&params=limit=${limit}`;
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok || data.error) throw new Error(data.error || `status: ${response.status}`);
    return data;
};

//^ Anime API

export const fetchAnimeData = async () => {
    const url = `https://api.jikan.moe/v4/top/anime?filter=airing`
    const response = await fetch(url);
    const data = await response.json();
    return data;
};

//& fetch anime details by id
export const fetchAnimeById = async (id) => {
    const url = `https://api.jikan.moe/v4/anime/${id}/full`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
};

//& search anime by query
export const searchAnime = async (query, page = 1, type = null, status = null, rating = null, genres = null, orderBy = null, sort = null) => {
    const params = new URLSearchParams();
    params.append('q', query);
    params.append('page', page);
    
    if (type) params.append('type', type); //~ tv, movie, ova, special, ona, music
    if (status) params.append('status', status); //~ airing, complete, upcoming
    if (rating) params.append('rating', rating); //~ g, pg, pg13, r17, r, rx
    if (genres) params.append('genres', genres);
    if (orderBy) params.append('order_by', orderBy); //~ title, start_date, end_date, episodes, score, etc
    if (sort) params.append('sort', sort); //~ desc, asc
    
    const url = `https://api.jikan.moe/v4/anime?${params.toString()}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
};

//& fetch seasonal anime
export const fetchSeasonalAnime = async (year = new Date().getFullYear(), season = 'spring') => {
    //~ determine current season if nt specified
    if (season === 'spring') {
        const currentMonth = new Date().getMonth();
        if (currentMonth >= 0 && currentMonth <= 2) season = 'winter';
        else if (currentMonth >= 3 && currentMonth <= 5) season = 'spring';
        else if (currentMonth >= 6 && currentMonth <= 8) season = 'summer';
        else season = 'fall';
    }
    
    const url = `https://api.jikan.moe/v4/seasons/${year}/${season}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
};

//& fetch anime reccos
export const fetchAnimeRecommendations = async () => {
    const url = `https://api.jikan.moe/v4/recommendations/anime`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
};

//& fetch anime reviews
export const fetchAnimeReviews = async (id, page = 1) => {
    const url = `https://api.jikan.moe/v4/anime/${id}/reviews?page=${page}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
};

//& fetch anime chars
export const fetchAnimeCharacters = async (id) => {
    const url = `https://api.jikan.moe/v4/anime/${id}/characters`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
};

//& fetch anime staff
export const fetchAnimeStaff = async (id) => {
    const url = `https://api.jikan.moe/v4/anime/${id}/staff`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
};

//& fetch anime eps
export const fetchAnimeEpisodes = async (id) => {
    const url = `https://api.jikan.moe/v4/anime/${id}/episodes`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
};

//& fetch anime stats
export const fetchAnimeStats = async (id) => {
    const url = `https://api.jikan.moe/v4/anime/${id}/statistics`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
};

//& fetch anime genres
export const fetchAnimeGenres = async () => {
    const url = `https://api.jikan.moe/v4/genres/anime`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
};

//^ Airtable/Netlify prefs APIs

//& multi-user helper func
export const getOrCreateUser = async (netlifyUserId, email) => {
    const apiKey = import.meta.env.VITE_AIRTABLE_API_KEY;
    const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
    const tableUsers = import.meta.env.VITE_AIRTABLE_TABLE_USERS;
    const filter = encodeURIComponent(`{netlify_user_id}="${netlifyUserId}"`);
    const url = `https://api.airtable.com/v0/${baseId}/${tableUsers}?filterByFormula=${filter}`;
    const resp = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}` } });
    const data = await resp.json();
    if (data.records.length) return data.records[0].id;
    const createResp = await fetch(`https://api.airtable.com/v0/${baseId}/${tableUsers}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ records: [{ fields: { netlify_user_id: netlifyUserId, Email: email } }] }),
    });
    const createData = await createResp.json();
    return createData.records[0].id;
};

export const fetchLayout = async (userRecordId) => {
    const apiKey = import.meta.env.VITE_AIRTABLE_API_KEY;
    const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
    const tableUsers = import.meta.env.VITE_AIRTABLE_TABLE_USERS;
    //~ fetch layout frm Users table
    const url = `https://api.airtable.com/v0/${baseId}/${tableUsers}/${userRecordId}`;
    const resp = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}` } });
    const data = await resp.json();
    return data.fields.Layout || null;
};

export const saveLayout = async (userRecordId, layoutJSON) => {
    const apiKey = import.meta.env.VITE_AIRTABLE_API_KEY;
    const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
    const tableUsers = import.meta.env.VITE_AIRTABLE_TABLE_USERS;
    //& save layout to Users table
    const url = `https://api.airtable.com/v0/${baseId}/${tableUsers}/${userRecordId}`;
    const resp = await fetch(url, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: { Layout: layoutJSON } })
    });
    const data = await resp.json();
    return data;
};

//& fetch weather prefs frm users record
export const fetchWeatherPreferences = async (userRecordId) => {
    const apiKey = import.meta.env.VITE_AIRTABLE_API_KEY;
    const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
    const table = import.meta.env.VITE_AIRTABLE_TABLE_USERS;
    const url = `https://api.airtable.com/v0/${baseId}/${table}/${userRecordId}`;
    const resp = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}` } });
    const data = await resp.json();
    return {
        fields: {
            Country: data.fields['Weather-Country'] || '',
            Town: data.fields['Weather-SGtown'] || ''
        },
        recordId: data.id
    };
};

//& patch weather prefs fields on users record
export const saveWeatherPreferences = async (userRecordId, fields) => {
    const apiKey = import.meta.env.VITE_AIRTABLE_API_KEY;
    const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
    const table = import.meta.env.VITE_AIRTABLE_TABLE_USERS;
    const out = {};
    if (fields.Country != null) out['Weather-Country'] = fields.Country;
    if (fields.Town != null) out['Weather-SGtown'] = fields.Town;
    const url = `https://api.airtable.com/v0/${baseId}/${table}/${userRecordId}`;
    const resp = await fetch(url, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: out })
    });
    const data = await resp.json();
    return { id: data.id };
};

export const fetchCryptoPreferences = async (userRecordId) => {
    //~ fetch crypto currency prefs frm Users record
    const apiKey = import.meta.env.VITE_AIRTABLE_API_KEY;
    const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
    const table = import.meta.env.VITE_AIRTABLE_TABLE_USERS;
    const url = `https://api.airtable.com/v0/${baseId}/${table}/${userRecordId}`;
    const resp = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}` } });
    const data = await resp.json();
    return { Currency: data.fields['Crypto-Currency'] || '' };
};

export const saveCryptoPreferences = async (userRecordId, fields) => {
    //~ patch crypto currency field on Users record
    const apiKey = import.meta.env.VITE_AIRTABLE_API_KEY;
    const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
    const table = import.meta.env.VITE_AIRTABLE_TABLE_USERS;
    const out = {};
    if (fields.Currency != null) out['Crypto-Currency'] = fields.Currency;
    const url = `https://api.airtable.com/v0/${baseId}/${table}/${userRecordId}`;
    const resp = await fetch(url, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: out }),
    });
    const data = await resp.json();
    return { id: data.id };
};

export const fetchFootballPreferences = async (userRecordId) => {
    const apiKey = import.meta.env.VITE_AIRTABLE_API_KEY;
    const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
    const table = import.meta.env.VITE_AIRTABLE_TABLE_USERS;
    const url = `https://api.airtable.com/v0/${baseId}/${table}/${userRecordId}`;
    const resp = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}` } });
    const data = await resp.json();
    return { Competition: data.fields['Football-Compe'] || '' };
};

export const saveFootballPreferences = async (userRecordId, fields) => {
    const apiKey = import.meta.env.VITE_AIRTABLE_API_KEY;
    const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
    const table = import.meta.env.VITE_AIRTABLE_TABLE_USERS;
    const out = {};
    if (fields.Competition != null) out['Football-Compe'] = fields.Competition;
    const url = `https://api.airtable.com/v0/${baseId}/${table}/${userRecordId}`;
    const resp = await fetch(url, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: out }),
    });
    const result = await resp.json();
    if (!resp.ok) {
        console.error('Airtable error saving football pref:', result);
        throw new Error(result.error?.message || 'Failed to save football preference');
    }
    return { id: result.id };
};