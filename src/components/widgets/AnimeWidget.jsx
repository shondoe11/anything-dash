import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { fetchAnimeData } from "../../services/service";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faCalendar, faClock, faTv, faFileVideo, faChartSimple, faThumbsUp,faFileLines } from '@fortawesome/free-solid-svg-icons';


export default function AnimeWidget() {
    const [animeList, setAnimeList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            toast.info('Fetching anime...', {autoClose: false});
            try {
                const data = await fetchAnimeData();
                const topAiringAnime = data.data.slice(0, 10); // extract top 10 anime recommends entries
                setAnimeList(topAiringAnime);
                toast.success('Top Current Animes loaded!');
            } catch (error) {
                toast.error('Failed to fetch anime data. Please try again.');
                console.error('fetchAnimeData FAILED: ', error);
            } finally {
                setIsLoading(false);
                toast.dismiss();
            }
        };
        fetchData();
    }, []);
    
    return (
        <div>
            <h2>Top Airing Anime</h2>
            {isLoading ? (
                <div>Loading anime...</div>
            ) : (
                <div>
                    {animeList.map((anime) => (
                        <div key={anime.mal_id}>
                            <img src={anime.images?.jpg?.image_url || 'http://placehold.it/200x250.jpg'} alt={anime.title} />
                            <h3>{anime.title}</h3>
                            {anime.title_english && (
                                <p><strong>English Title: {anime.title_english}</strong></p>
                            )}
                            <p><FontAwesomeIcon icon={faCalendar} /> <strong>Air Date:</strong> {anime.aired?.string || 'N/A'}</p>       
                            <p><FontAwesomeIcon icon={faTv} /> <strong>Broadcast:</strong> {anime.broadcast?.string || 'N/A'}</p>       
                            <p><FontAwesomeIcon icon={faFileVideo} /> <strong>Episodes:</strong> {anime.episodes || 'N/A'}</p>
                            <p><FontAwesomeIcon icon={faClock} /> <strong>Duration:</strong> {anime.duration || 'N/A'}</p>
                            <p><FontAwesomeIcon icon={faChartSimple} /> <strong>Rating:</strong> {anime.rating || 'N/A'}</p>
                            <p><FontAwesomeIcon icon={faThumbsUp} /> <strong>Score:</strong> <FontAwesomeIcon icon={faStar} /> {anime.score || 'N/A'}</p>
                            <p><FontAwesomeIcon icon={faFileLines} /> <strong>Synopsis:</strong> {anime.synopsis ? `${anime.synopsis.substring(0, 100)}...` : 'N/A'}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}