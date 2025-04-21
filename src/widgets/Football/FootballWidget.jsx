import { useState, useEffect } from "react";
import { fetchFootballData } from "../../services/service";
import { toast } from "react-toastify";
import ReactPaginate from "react-paginate";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAnglesLeft, faAnglesRight } from "@fortawesome/free-solid-svg-icons";
import { Form, Table, Spinner, Card, Badge, Button } from 'react-bootstrap';
import { FaFutbol } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { fetchFootballPreferences, saveFootballPreferences } from '../../services/service';

const competitions = [
    {id: 'WC', name: 'FIFA World Cup'},
    {id: 'CL', name: 'UEFA Champions League'},
    {id: 'BL1', name: 'Bundesliga'},
    {id: 'DED', name: 'Eredivisie'},
    {id: 'BSA', name: 'Campeonato Brasileiro Série A'},
    {id: 'PD', name: 'Primera Division'},
    {id: 'FL1', name: 'Ligue 1'},
    {id: 'ELC', name: 'Championship'},
    {id: 'PPL', name: 'Primeira Liga'},
    {id: 'EC', name: 'European Championship'},
    {id: 'SA', name: 'Serie A'},
    {id: 'PL', name: 'Premier League'},
    {id: 'CLI', name: 'Copa Libertadores'},
]

export default function FootballWidget() {
    const [standings, setStandings] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectCompe, setSelectCompe] = useState('PL');
    const { userRecordId, login } = useAuth();
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(standings.length / itemsPerPage);
    const [prefLoaded, setPrefLoaded] = useState(false);

    useEffect(() => {
        if (userRecordId && !prefLoaded) return;
        const fetchData = async () => {
            setIsLoading(true);
            toast.info('Fetching football data...', {autoClose: false});
            try {
                const data = await fetchFootballData(selectCompe);
                setStandings(data.standings[0].table);
                toast.success('Football data loaded successfully!');
            } catch (error) {
                toast.error('Failed to fetch football data. Please try again.');
                console.error('fetch football data FAILED: ', error)
            } finally {
                setIsLoading(false);
                toast.dismiss();
            }
        };
        fetchData();
    }, [selectCompe, userRecordId, prefLoaded]);

    useEffect(() => {
        if (!userRecordId) {
            setPrefLoaded(true);
            return;
        }
        fetchFootballPreferences(userRecordId)
            .then(fields => {
                if (fields.Competition) setSelectCompe(fields.Competition);
            })
            .finally(() => setPrefLoaded(true));
    }, [userRecordId]);

    const handleCompeChange = (e) => {
        setSelectCompe(e.target.value);
        setCurrentPage(0);
    };

    const handleSaveFootballPref = async () => {
        if (!userRecordId) { login(); return; }
        try {
            await saveFootballPreferences(userRecordId, { Competition: selectCompe });
            toast.success('Preferences saved!');
        } catch (error) {
            toast.error('Failed to save preferences. Please try again.');
            console.error(error);
        }
    };

    const displayedStandings = standings.slice(
    currentPage * itemsPerPage,
    currentPage * itemsPerPage + itemsPerPage
    );

    return (
        <>
            <Card className="border-0 shadow-sm mb-4 widget-card overflow-hidden">
                <Card.Header className="d-flex justify-content-between align-items-center py-3 px-4" style={{background: 'linear-gradient(45deg, var(--primary), var(--secondary))', border: 'none'}}>
                    <div className="d-flex align-items-center">
                        <FaFutbol className="text-white me-2 widget-icon" size={20} />
                        <h5 className="mb-0 text-white fw-bold">Football Standings</h5>
                    </div>
                    <div>
                        <Badge bg="light" text="dark" className="px-3 py-2 rounded-pill">
                            {selectCompe}
                        </Badge>
                    </div>
                </Card.Header>
                <Card.Body className="p-4">
            <Form.Group className="mb-3 d-flex align-items-center gap-2">
                <Form.Label htmlFor="competitionSelect">Select Competition: </Form.Label>
                <Form.Select id="competitionSelect" value={selectCompe} onChange={handleCompeChange} disabled={isLoading} className="w-auto">
                    {competitions.map((comp) => (
                        <option key={comp.id} value={comp.id}>{comp.name}</option>
                    ))}
                </Form.Select>
                <Button size="sm" variant="primary" onClick={handleSaveFootballPref} disabled={isLoading}>
                    Save Preferences
                </Button>
            </Form.Group>
            {isLoading ? (
                <div className="d-flex justify-content-center my-3">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading football data...</span>
                    </Spinner>
                </div>
            ) : (
                <>
                    <Table hover responsive bordered className="mb-3 football-table">
                        <thead>
                        <tr>
                            <th>Position</th>
                            <th>Team</th>
                            <th>Played</th>
                            <th>Wins</th>
                            <th>Draws</th>
                            <th>Losses</th>
                            <th>Points</th>
                        </tr>
                        </thead>
                        <tbody>
                        {displayedStandings.map((team) => (
                            <tr key={team.team.id}>
                            <td>{team.position}</td>
                            <td>{team.team.name}</td>
                            <td>{team.playedGames}</td>
                            <td>{team.won}</td>
                            <td>{team.draw}</td>
                            <td>{team.lost}</td>
                            <td>{team.points}</td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                    {totalPages > 1 && (
                        <ReactPaginate
                        previousLabel={<FontAwesomeIcon icon={faAnglesLeft} />}
                        nextLabel={<FontAwesomeIcon icon={faAnglesRight} />}
                        pageCount={totalPages}
                        onPageChange={(selectedItem) => setCurrentPage(selectedItem.selected)}
                        containerClassName="pagination justify-content-center mt-3"
                        pageClassName="page-item"
                        pageLinkClassName="page-link"
                        activeClassName="active"
                        previousClassName="page-item"
                        nextClassName="page-item"
                        previousLinkClassName="page-link"
                        nextLinkClassName="page-link"
                        disabledClassName="disabled"
                        forcePage={currentPage}
                        />
                    )}
                </>
            )}
                </Card.Body>
            </Card>
        </>
    );
}