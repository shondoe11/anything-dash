//* store ALL API requests

export const fetchAirtableData = async (userRecordId) => {
    const airtableApiKey = import.meta.env.VITE_AIRTABLE_API_KEY;
    const airtableBaseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
    const airtableTableTodo = import.meta.env.VITE_AIRTABLE_TABLE_TODO;
    const filter = encodeURIComponent(`{User}='${userRecordId}'`);
    const url = `https://api.airtable.com/v0/${airtableBaseId}/${airtableTableTodo}?filterByFormula=${filter}`;
    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${airtableApiKey}`,
        },
    });
    const data = await response.json();
    return data.records;
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
    const filter = encodeURIComponent(`{netlify_user_id}='${netlifyUserId}'`);
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
    const tableLayouts = import.meta.env.VITE_AIRTABLE_TABLE_LAYOUTS;
    const filter = encodeURIComponent(`{User}='${userRecordId}'`);
    const url = `https://api.airtable.com/v0/${baseId}/${tableLayouts}?filterByFormula=${filter}`;
    const resp = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}` } });
    const data = await resp.json();
    return data.records[0]?.fields.Layout || null;
};

export const saveLayout = async (userRecordId, layoutJSON) => {
    const apiKey = import.meta.env.VITE_AIRTABLE_API_KEY;
    const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
    const tableLayouts = import.meta.env.VITE_AIRTABLE_TABLE_LAYOUTS;
    const filter = encodeURIComponent(`{User}='${userRecordId}'`);
    const listUrl = `https://api.airtable.com/v0/${baseId}/${tableLayouts}?filterByFormula=${filter}`;
    const listResp = await fetch(listUrl, { headers: { Authorization: `Bearer ${apiKey}` } });
    const listData = await listResp.json();
    if (listData.records.length) {
        const recordId = listData.records[0].id;
        const updateUrl = `https://api.airtable.com/v0/${baseId}/${tableLayouts}/${recordId}`;
        return fetch(updateUrl, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields: { Layout: layoutJSON } }),
        }).then(res => res.json());
    } else {
        return fetch(`https://api.airtable.com/v0/${baseId}/${tableLayouts}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ records: [{ fields: { User: [userRecordId], Layout: layoutJSON } }] }),
        }).then(res => res.json());
    }
};

//^ preference APIs
export const fetchWeatherPreferences = async (userRecordId) => {
    const apiKey = import.meta.env.VITE_AIRTABLE_API_KEY;
    const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
    const table = import.meta.env.VITE_AIRTABLE_TABLE_WEATHER;
    const filter = encodeURIComponent(`{User}='${userRecordId}'`);
    const url = `https://api.airtable.com/v0/${baseId}/${table}?filterByFormula=${filter}`;
    const resp = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}` } });
    const data = await resp.json();
    return data.records[0]?.fields || {};
};
export const saveWeatherPreferences = async (userRecordId, fields) => {
    const apiKey = import.meta.env.VITE_AIRTABLE_API_KEY;
    const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
    const table = import.meta.env.VITE_AIRTABLE_TABLE_WEATHER;
    const filter = encodeURIComponent(`{User}='${userRecordId}'`);
    const listUrl = `https://api.airtable.com/v0/${baseId}/${table}?filterByFormula=${filter}`;
    const listResp = await fetch(listUrl, { headers: { Authorization: `Bearer ${apiKey}` } });
    const listData = await listResp.json();
    if (listData.records.length) {
        const recordId = listData.records[0].id;
        const url = `https://api.airtable.com/v0/${baseId}/${table}/${recordId}`;
        return fetch(url, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ fields }),
        }).then(res => res.json());
    } else {
        const url = `https://api.airtable.com/v0/${baseId}/${table}`;
        return fetch(url, {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ records: [{ fields: { User: [userRecordId], ...fields } }] }),
        }).then(res => res.json());
    }
};
//& crypto prefs
export const fetchCryptoPreferences = async (userRecordId) => {
    const apiKey = import.meta.env.VITE_AIRTABLE_API_KEY;
    const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
    const table = import.meta.env.VITE_AIRTABLE_TABLE_CRYPTO;
    const filter = encodeURIComponent(`{User}='${userRecordId}'`);
    const url = `https://api.airtable.com/v0/${baseId}/${table}?filterByFormula=${filter}`;
    const resp = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}` } });
    const data = await resp.json();
    return data.records[0]?.fields || {};
};
export const saveCryptoPreferences = async (userRecordId, fields) => {
    const apiKey = import.meta.env.VITE_AIRTABLE_API_KEY;
    const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
    const table = import.meta.env.VITE_AIRTABLE_TABLE_CRYPTO;
    const filter = encodeURIComponent(`{User}='${userRecordId}'`);
    const listUrl = `https://api.airtable.com/v0/${baseId}/${table}?filterByFormula=${filter}`;
    const listResp = await fetch(listUrl, { headers: { Authorization: `Bearer ${apiKey}` } });
    const listData = await listResp.json();
    if (listData.records.length) {
        const recordId = listData.records[0].id;
        const url = `https://api.airtable.com/v0/${baseId}/${table}/${recordId}`;
        return fetch(url, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ fields }),
        }).then(res => res.json());
    } else {
        const url = `https://api.airtable.com/v0/${baseId}/${table}`;
        return fetch(url, {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ records: [{ fields: { User: [userRecordId], ...fields } }] }),
        }).then(res => res.json());
    }
};
//& football prefs
export const fetchFootballPreferences = async (userRecordId) => {
    const apiKey = import.meta.env.VITE_AIRTABLE_API_KEY;
    const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
    const table = import.meta.env.VITE_AIRTABLE_TABLE_FOOTBALL;
    const filter = encodeURIComponent(`{User}='${userRecordId}'`);
    const url = `https://api.airtable.com/v0/${baseId}/${table}?filterByFormula=${filter}`;
    const resp = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}` } });
    const data = await resp.json();
    return data.records[0]?.fields || {};
};
export const saveFootballPreferences = async (userRecordId, fields) => {
    const apiKey = import.meta.env.VITE_AIRTABLE_API_KEY;
    const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
    const table = import.meta.env.VITE_AIRTABLE_TABLE_FOOTBALL;
    const filter = encodeURIComponent(`{User}='${userRecordId}'`);
    const listUrl = `https://api.airtable.com/v0/${baseId}/${table}?filterByFormula=${filter}`;
    const listResp = await fetch(listUrl, { headers: { Authorization: `Bearer ${apiKey}` } });
    const listData = await listResp.json();
    if (listData.records.length) {
        const recordId = listData.records[0].id;
        const url = `https://api.airtable.com/v0/${baseId}/${table}/${recordId}`;
        return fetch(url, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ fields }),
        }).then(res => res.json());
    } else {
        const url = `https://api.airtable.com/v0/${baseId}/${table}`;
        return fetch(url, {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ records: [{ fields: { User: [userRecordId], ...fields } }] }),
        }).then(res => res.json());
    }
};
