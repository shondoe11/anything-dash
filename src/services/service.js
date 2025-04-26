//* store ALL API requests

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

//* Weather APIs (global + sg)
export const fetchWeatherData = async (city) => {
    const weatherApiKey = import.meta.env.VITE_WEATHERAPI_KEY;
    const url = `https://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${city}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
};

//& forecast data (3/7 day & hourly)
export const fetchForecastWeatherData = async (city, days = 7, aqi = false, alerts = false) => {
    const weatherApiKey = import.meta.env.VITE_WEATHERAPI_KEY;
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${weatherApiKey}&q=${city}&days=${days}&aqi=${aqi}&alerts=${alerts}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
};

//& historical data
export const fetchHistoricalWeatherData = async (city, date) => {
    const weatherApiKey = import.meta.env.VITE_WEATHERAPI_KEY;
    const url = `https://api.weatherapi.com/v1/history.json?key=${weatherApiKey}&q=${city}&dt=${date}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
};

//& alerts
export const fetchWeatherAlerts = async (city) => {
    const weatherApiKey = import.meta.env.VITE_WEATHERAPI_KEY;
    const url = `https://api.weatherapi.com/v1/alerts.json?key=${weatherApiKey}&q=${city}`;
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
        return []; //~ return empty, prevent crashs
    }
};

export const fetchFootballData = async (compeId = 'PL') => {
    //~ call netlify function as proxy
    const url = `/.netlify/functions/football-proxy?league=${compeId}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
};

export const fetchAnimeData = async () => {
    const url = `https://api.jikan.moe/v4/top/anime?filter=airing`
    const response = await fetch(url);
    const data = await response.json();
    return data;
};

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

//^ preference APIs
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
            Town: data.fields['Weather-SGtown']  || ''
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
    if (fields.Town    != null) out['Weather-SGtown']  = fields.Town;
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