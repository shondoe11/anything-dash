import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { fetchAnimeData } from "../../services/service";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faCalendar, faClock, faTv, faFileVideo, faChartSimple, faThumbsUp,faFileLines, faAnglesLeft, faAnglesRight } from '@fortawesome/free-solid-svg-icons';
import styles from './AnimeWidget.module.css';
import { CarouselProvider, Slider, Slide, ButtonBack, ButtonNext } from 'pure-react-carousel'; // functions
import 'pure-react-carousel/dist/react-carousel.es.css'; // styles


export default function AnimeWidget() {
    const [animeList, setAnimeList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            toast.info('Fetching anime...', {autoClose: false});
            try {
                const data = await fetchAnimeData();
                const topAiringAnime = data.data.slice(0, 50); // extract top 10 anime recommends entries
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
        <div className={styles.widgetContainer}>
            <h2>Top Airing Animes</h2>
            {isLoading ? (
                <div>Loading anime...</div>
            ) : (
                <div className={styles.carouselWrapper}>
                    <CarouselProvider 
                    naturalSlideWidth={250} 
                    naturalSlideHeight={500} 
                    totalSlides={animeList.length} 
                    visibleSlides={3} 
                    infinite={true} 
                    >
                        <ButtonBack className={styles.carouselBtnLeft}><FontAwesomeIcon icon={faAnglesLeft} /></ButtonBack>
                        <Slider className={styles.slider}>
                            {animeList.map((anime, index) => (
                                <Slide key={`${anime.mal_id}-${index}`} index={index} className={styles.slide}>
                                    <div className={styles.animeCard}>
                                        <img src={anime.images?.jpg?.image_url || 'http://placehold.it/200x250.jpg'} alt={anime.title} className={styles.animeImage} />
                                        <h3 className={styles.animeTitle}>{anime.title}</h3>
                                        {anime.title_english && (
                                            <p className={styles.animeDetail}><strong>English Title: {anime.title_english}</strong></p>
                                        )}
                                        <p className={styles.animeDetail}><FontAwesomeIcon icon={faCalendar} /> <strong>Air Date:</strong> {anime.aired?.string || 'N/A'}</p>       
                                        <p className={styles.animeDetail}><FontAwesomeIcon icon={faTv} /> <strong>Broadcast:</strong> {anime.broadcast?.string || 'N/A'}</p>       
                                        <p className={styles.animeDetail}><FontAwesomeIcon icon={faFileVideo} /> <strong>Episodes:</strong> {anime.episodes || 'N/A'}</p>
                                        <p className={styles.animeDetail}><FontAwesomeIcon icon={faClock} /> <strong>Duration:</strong> {anime.duration || 'N/A'}</p>
                                        <p className={styles.animeDetail}><FontAwesomeIcon icon={faChartSimple} /> <strong>Rating:</strong> {anime.rating || 'N/A'}</p>
                                        <p className={styles.animeDetail}><FontAwesomeIcon icon={faThumbsUp} /> <strong>Score:</strong> <FontAwesomeIcon icon={faStar} /> {anime.score || 'N/A'}</p>
                                        <p className={styles.animeDetail}><FontAwesomeIcon icon={faFileLines} /> <strong>Synopsis:</strong> {anime.synopsis ? `${anime.synopsis.substring(0, 100)}...` : 'N/A'}</p>
                                    </div>
                                </Slide>
                            ))}
                        </Slider>
                            <ButtonNext className={styles.carouselBtnRight}><FontAwesomeIcon icon={faAnglesRight} /></ButtonNext>
                    </CarouselProvider>
                </div>
            )}
        </div>
    );
}