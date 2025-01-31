import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { fetchCoinGeckoData } from "../../services/service";


export default function CryptoWidget() {
    const [cryptoData, setCryptoData] = useState([]);
    const [currency, setCurrency] = useState('sgd');
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1); // pagination: https://www.contentful.com/blog/react-pagination/
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            toast.info('Fetching cryptocyrrency data...', {autoclose: false});
            try {
                const data = await fetchCoinGeckoData(currency, currentPage);
                setCryptoData(data);
                toast.success('Crypto data loaded successfully!'); 
            } catch (error) {
                toast.error('Faield to fetch crypto data. Please try again.');
                console.error('fetch crypto data FAILED: ', error);
            } finally {
                setIsLoading(false);
                toast.dismiss();
            }
        };
        fetchData();
    }, [currency, currentPage]);

    const handleCurrencyChange = (e) => {
        setCurrency(e.target.value);
        setCurrentPage(1); // reset to pg1 when currency switch
    };

    const handleSearch = async () => {
        if (!searchQuery) {
            toast.error('Please enter coin name/symbol.');
            return;
        }
        setIsLoading(true);
        toast.info('Searching for coin...', {autoClose: false});
        try {
            const data = await fetchCoinGeckoData(currency, 1, searchQuery);
            setCryptoData(data);
            toast.success('Coin data loaded successfully!');
        } catch (error) {
            toast.error('Failed to fetch coin data. Please try again.');
            console.error('search coin FAILED: ', error);
        } finally {
            setIsLoading(false);
            toast.dismiss();
        }
    };

    const handlePrevPage = () => {
        if(currentPage > 1) {
            setCurrentPage((prevPage) => prevPage - 1);
        }
    };

    const handleNextPage = () => {
        setCurrentPage((prevPage) => prevPage + 1);
    };

    return (
        <div>
            <h2>Cryptocurrency Data</h2>
            <div>
                <label>Select Currency:</label>
                <select value={currency} onChange={handleCurrencyChange} disabled={isLoading}>
                    <option value='usd'>USD</option>
                    <option value='eur'>EUR</option>
                    <option value='gbp'>GBP</option>
                    <option value='jpy'>JPY</option>
                    <option value='sgd'>SGD</option>
                </select>
            </div>

            <div>
                <form onSubmit={(e) => {e.preventDefault(); handleSearch();}}>
                    <label>Search Coin:</label>
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Enter coin name/symbol" disabled={isLoading} />
                    <button type="submit" disabled={isLoading}>{isLoading ? 'Searching...' : 'Search'}</button>
                </form>
            </div>

            {isLoading ? (
                <div>Loading crypto data...</div>
            ) : (
                <div>
                    <h3>Top 10 Cryptocurrencies</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Name</th>
                                <th>Symbol</th>
                                <th>Price ({currency.toUpperCase()})</th>
                                <th>Market Cap</th>
                                <th>24h Change</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cryptoData.map((coin) => (
                                <tr key={coin.id}>
                                    <td>{coin.market_cap_rank}</td>
                                    <td>{coin.name}</td>
                                    <td>{coin.symbol.toUpperCase()}</td>
                                    <td>{coin.current_price}</td>
                                    <td>{coin.market_cap}</td>
                                    <td style={{color: coin.price_change_percentage_24h >= 0 ? 'green' : 'red',}}>{coin.price_change_percentage_24h}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div>
                <button onClick={handlePrevPage} disabled={currentPage === 1 || isLoading}><i className="fa-duotone fa-solid fa-angles-left"></i></button>
                <span>Page {currentPage}</span>
                <button onClick={handleNextPage} disabled={isLoading}><i className="fa-duotone fa-solid fa-angles-right"></i></button>
            </div>

        </div>
    );
}