import { useEffect } from "react";
import { toast } from "react-toastify";
import { fetchCoinGeckoData } from "../../services/service";


export default function CryptoWidget() {
    const [cryptoData, setCryptoData] = useState([]);
    const [currency, setCurrency] = useState('sgd');
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1); // pagination: https://www.contentful.com/blog/react-pagination/

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
        </div>
    );
}