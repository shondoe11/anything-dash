import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { fetchAnimeData, postDataToAirtable } from "../../services/service";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faCalendar, faClock, faTv, faFileVideo, faChartSimple, faThumbsUp, faFileLines } from '@fortawesome/free-solid-svg-icons';
import { Card, Button, Carousel, Spinner, Row, Col } from 'react-bootstrap';
import PropTypes from 'prop-types';


export default function AnimeWidget({ refreshTodoList }) {
    const [animeList, setAnimeList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            toast.info('Fetching anime...', {autoClose: false});
            try {
                const data = await fetchAnimeData();
                const topAiringAnime = data.data.slice(0, 50); //~ top 50 entries
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

    const handleAddToTodo = async (anime) => {
        try {
        toast.info('Adding to Todo list...', { autoClose: false });
        const newTask = `Watch ${anime.title_english || anime.title}`;
        await postDataToAirtable({
            Tasks: newTask,
            Status: "New",
            "Due Date": null,
        });
        toast.success('Task added to Todo list!');
        if (refreshTodoList) {
        refreshTodoList();
        }
        } catch (error) {
        toast.error('Failed to add task to Todo list. Please try again.');
        console.error('Add to Todo failed: ', error);
        } finally {
        toast.dismiss();
        }
    };
    
    return (
        <Card className="border shadow-sm mb-4">
            <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">Top Airing Animes</h5>
            </Card.Header>
            <Card.Body>
                {isLoading ? (
                    <div className="text-center py-3">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading anime...</span>
                        </Spinner>
                    </div>
                ) : (
                    <div className="position-relative">
                        <Carousel indicators={false} interval={null} className="mx-auto" style={{ maxWidth: '90%' }}>
                            {animeList.map((anime, index) => (
                                <Carousel.Item key={`${anime.mal_id}-${index}`}>
                                    <Row className="g-0 justify-content-center">
                                        <Col xs={12} md={10} lg={8}>
                                            <Card className="h-100 shadow-sm">
                                                <Row className="g-0">
                                                    <Col xs={4} md={3}>
                                                        <Card.Img 
                                                            src={anime.images?.jpg?.image_url || 'http://placehold.it/200x250.jpg'} 
                                                            alt={anime.title} 
                                                            style={{ height: '100%', objectFit: 'cover' }}
                                                        />
                                                    </Col>
                                                    <Col xs={8} md={9}>
                                                        <Card.Body>
                                                            <Card.Title className="border-bottom pb-2">{anime.title}</Card.Title>
                                                            <Row className="mt-2 g-2">
                                                                <Col xs={12}>
                                                                    {anime.title_english && (
                                                                        <p className="mb-1 small"><strong>English Title:</strong> {anime.title_english}</p>
                                                                    )}
                                                                </Col>
                                                                <Col xs={12} sm={6}>
                                                                    <p className="mb-1 small"><FontAwesomeIcon icon={faCalendar} /> <strong>Air Date:</strong> {anime.aired?.string || 'N/A'}</p>
                                                                </Col>
                                                                <Col xs={12} sm={6}>
                                                                    <p className="mb-1 small"><FontAwesomeIcon icon={faTv} /> <strong>Broadcast:</strong> {anime.broadcast?.string || 'N/A'}</p>
                                                                </Col>
                                                                <Col xs={12} sm={6}>
                                                                    <p className="mb-1 small"><FontAwesomeIcon icon={faFileVideo} /> <strong>Episodes:</strong> {anime.episodes || 'N/A'}</p>
                                                                </Col>
                                                                <Col xs={12} sm={6}>
                                                                    <p className="mb-1 small"><FontAwesomeIcon icon={faClock} /> <strong>Duration:</strong> {anime.duration || 'N/A'}</p>
                                                                </Col>
                                                                <Col xs={12} sm={6}>
                                                                    <p className="mb-1 small"><FontAwesomeIcon icon={faChartSimple} /> <strong>Rating:</strong> {anime.rating || 'N/A'}</p>
                                                                </Col>
                                                                <Col xs={12} sm={6}>
                                                                    <p className="mb-1 small"><FontAwesomeIcon icon={faThumbsUp} /> <strong>Score:</strong> <FontAwesomeIcon icon={faStar} className="text-warning" /> {anime.score || 'N/A'}</p>
                                                                </Col>
                                                                <Col xs={12}>
                                                                    <p className="mb-1 small"><FontAwesomeIcon icon={faFileLines} /> <strong>Synopsis:</strong> {anime.synopsis ? `${anime.synopsis.substring(0, 100)}...` : 'N/A'}</p>
                                                                </Col>
                                                            </Row>
                                                            <div className="d-flex gap-2 mt-3 justify-content-end">
                                                                <Button 
                                                                    variant="outline-primary" 
                                                                    size="sm" 
                                                                    onClick={() => window.open(anime.url, '_blank')}
                                                                >
                                                                    More Details
                                                                </Button>
                                                                <Button 
                                                                    variant="outline-success" 
                                                                    size="sm" 
                                                                    onClick={() => handleAddToTodo(anime)}
                                                                >
                                                                    Add to Todo list
                                                                </Button>
                                                            </div>
                                                        </Card.Body>
                                                    </Col>
                                                </Row>
                                            </Card>
                                        </Col>
                                    </Row>
                                </Carousel.Item>
                            ))}
                        </Carousel>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
}

//~ def prop types fr AnimeWidget
AnimeWidget.propTypes = {
    refreshTodoList: PropTypes.func
};

//~ default props
AnimeWidget.defaultProps = {
    refreshTodoList: () => {}
};