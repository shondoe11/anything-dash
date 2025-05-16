import { useState, useEffect } from 'react';
import { toast } from "react-toastify";
import { fetchAnimeData, postDataToAirtable } from "../../services/service";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faCalendar, faClock, faTv, faFileVideo, faChartSimple, faThumbsUp, faFileLines } from '@fortawesome/free-solid-svg-icons';
import { Card, Button, Carousel, Spinner, Row, Col, Badge } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { FaTv } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

export default function AnimeWidget({ refreshTodoList = () => {} }) {
    const { userRecordId, login } = useAuth();
    const [animeList, setAnimeList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

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
        if (!userRecordId) { login(); return; }
        try {
            toast.info('Adding to Todo list...', { autoClose: false });
            const newTask = `Watch ${anime.title_english || anime.title}`;
            await postDataToAirtable(userRecordId, {
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
        <Card className="border-0 shadow-sm mb-4 widget-card d-flex flex-column h-100 overflow-auto">
            <Card.Header className="d-flex justify-content-between align-items-center py-3 px-4 gradient-header">
                <div className="d-flex align-items-center">
                    <FaTv className="text-white me-2 widget-icon" size={20} />
                    <h5 className="mb-0 text-white fw-bold">Top Airing Animes</h5>
                </div>
                <div>
                    <Badge bg="light" text="dark" className="px-3 py-2 rounded-pill">
                        {animeList.length} Animes
                    </Badge>
                </div>
            </Card.Header>
            <Card.Body className="flex-grow-1 overflow-auto">
                {isLoading ? (
                    <div className="text-center py-3">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading anime...</span>
                        </Spinner>
                    </div>
                ) : (
                    <div className="position-relative custom-carousel-container">
                        <button 
                            className="carousel-custom-control prev" 
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => { e.stopPropagation();
                                //~ go prev slide, wrap around if at first
                                setActiveIndex(prev => prev === 0 ? animeList.length - 1 : prev - 1);
                            }}
                            aria-label="Previous slide"
                        >
                            <span aria-hidden="true" className="icon-24px">&lsaquo;</span>
                        </button>
                        <button 
                            className="carousel-custom-control next" 
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => { e.stopPropagation();
                                //~ go next slide, wrap around if at last
                                setActiveIndex(prev => prev === animeList.length - 1 ? 0 : prev + 1);
                            }}
                            aria-label="Next slide"
                        >
                            <span aria-hidden="true" className="icon-24px">&rsaquo;</span>
                        </button>
                        <Carousel 
                            indicators={false} 
                            interval={null} 
                            className="mx-auto custom-carousel max-w-90" 
                            controls={false}
                            activeIndex={activeIndex}
                            onSelect={(index) => setActiveIndex(index)}
                        >
                            {animeList.map((anime, index) => (
                                <Carousel.Item key={`${anime.mal_id}-${index}`}>
                                    <Row className="g-0 justify-content-center">
                                        <Col xs={12} md={10} lg={8}>
                                            <Card className="shadow-sm">
                                                <Row className="g-0">
                                                    <Col xs={4} md={3}>
                                                        <Card.Img 
                                                            src={anime.images?.jpg?.image_url || 'http://placehold.it/200x250.jpg'} 
                                                            alt={anime.title} 
                                                            className="object-cover" 
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
                                                                    <p className="mb-1 small"><FontAwesomeIcon icon={faFileLines} /> <strong>Synopsis:</strong> {anime.synopsis || 'N/A'}</p>
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

                        <div className="custom-pagination mt-3">
                            {animeList.map((_, index) => (
                                <button 
                                    key={index}
                                    className={`pagination-dot ${index === activeIndex ? 'active' : ''}`}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onClick={(e) => { e.stopPropagation(); setActiveIndex(index); }}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
}

AnimeWidget.propTypes = {
    refreshTodoList: PropTypes.func
};