import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { fetchCoinGeckoData } from "../../services/service";
import ReactPaginate from 'react-paginate';
import styles from './Pagination.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAnglesLeft, faAnglesRight, faEllipsis } from '@fortawesome/free-solid-svg-icons';


export default function CryptoWidget() {
    const [cryptoData, setCryptoData] = useState([]);
    const [currency, setCurrency] = useState('sgd');
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0); // pagination: https://www.contentful.com/blog/react-pagination/ (0-based indexing)
    const [totalPages, setTotalPages] = useState(1); // total pgs for pagination
    const [pageInput, setPageInput] = useState('1');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            toast.info('Fetching cryptocyrrency data...', {autoclose: false});
            try {
                const data = await fetchCoinGeckoData(currency, currentPage + 1); // add 1 (convert to 1-based indexing)
                setCryptoData(data);
                setTotalPages(100);
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

    useEffect(() => {
        setPageInput(String(currentPage + 1));
    }, [currentPage]); // dependency arr

    const handleCurrencyChange = (e) => {
        setCurrency(e.target.value);
        setCurrentPage(0); // reset to pg1 when currency switch
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

    // react paginate
    const handlePageClick = (selectedPage) => {
        setCurrentPage(selectedPage.selected);
    };

    const handlePageInputChange = (e) => {
        const value = e.target.value.replace(/\D/g, "");
        setPageInput(value);
    };
    
    const handlePageInputKey = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            goToPage();
        }
    };

    const goToPage = () => {
        const pageNumber = parseInt(pageInput, 10) - 1;
        if (!isNaN(pageNumber) && pageNumber >= 0 && pageNumber < totalPages) {
            setCurrentPage(pageNumber);
        } else {
            toast.error(`Please enter a valid page number between 1 and ${totalPages}.`);
        }
    };


   // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat
    const formatPrice = (price) => {
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.toUpperCase(),
        });
        return formatter.format(price);
    };

    // https://www.geeksforgeeks.org/how-to-convert-long-number-into-abbreviated-string-in-javascript/ -> Approach #2
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed
    const formatMarketCap = (marketCap) => {
        if (marketCap >= 1e12) {
            return `${(marketCap / 1e12).toFixed(2)}T`; // format Trillions
        } else if (marketCap >= 1e9) {
            return `${(marketCap / 1e9).toFixed(2)}B`; // format Billions
        } else {
            return `${marketCap}`;
        }
    };

    const formatPercentChange = (p) => {
        return `${p.toFixed(2)}`;
    }


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
                    <h3>Top Cryptocurrencies</h3>
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
                                    <td>{formatPrice(coin.current_price)}</td>
                                    <td>{formatMarketCap(coin.market_cap)}</td>
                                    <td style={{color: coin.price_change_percentage_24h >= 0 ? 'green' : 'red',}}>{formatPercentChange(coin.price_change_percentage_24h)}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <div>
                <label>Jump to page: </label>
                <input 
                type="text" 
                value={pageInput} 
                onChange={handlePageInputChange} 
                onKeyDown={handlePageInputKey} 
                disabled={isLoading} 
                className={styles.pageInput}
                />
                <button onClick={goToPage} disabled={isLoading} className={styles.paginationButton}>Go</button>
            </div>

            <ReactPaginate
            previousLabel={<FontAwesomeIcon icon={faAnglesLeft} />}
            nextLabel={<FontAwesomeIcon icon={faAnglesRight} />}
            breakLabel={<FontAwesomeIcon icon={faEllipsis} />}
            pageCount={totalPages}
            marginPagesDisplayed={2}
            pageRangeDisplayed={2}
            onPageChange={handlePageClick}
            containerClassName={styles.pagination}
            pageClassName={styles.paginationButton}
            activeClassName={styles.active} 
            previousClassName={styles.previousButton}
            nextClassName={styles.nextButton}
            breakClassName={styles.breakLabelContainer}
            disabledClassName={styles.disabled}
            forcePage={currentPage}
            />

        </div>
    );
}