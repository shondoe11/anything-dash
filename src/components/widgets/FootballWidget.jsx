import { useState, useEffect } from "react";
import { fetchFootballData } from "../../services/service";
import { toast } from "react-toastify";

export default function FootballWidget() {
    const [standings, setStandings] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            toast.info('Fetching football data...', {autoClose: false});
            try {
                const data = await fetchFootballData();
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
    }, []);
    return (
        <div>
            <h2>Football Standings</h2>
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