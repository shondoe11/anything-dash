import { useState, useEffect } from "react";
import { fetchFootballData } from "../../services/service";
import { toast } from "react-toastify";

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

    useEffect(() => {
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
    }, [selectCompe]);

    const handleCompeChange = (e) => {
        setSelectCompe(e.target.value);
    }

    return (
        <div>
            <h2>Football Standings</h2>
            <div>
                <label>Select Competition: </label>
                <select value={selectCompe} onChange={handleCompeChange} disabled={isLoading}>
                    {competitions.map((comp) => (
                        <option key={comp.id} value={comp.id}>{comp.name}</option>
                    ))}
                </select>
            </div>
            {isLoading ? (
                <div>Loading football data...</div>
            ) : (
                <table>
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
                        {standings.map((team) => (
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
                </table>
            )}
        </div>
    );
}