import CryptoWidget from "./widgets/CryptoWidget";
import TodoWidget from "./Widgets/TodoWidget";
import WeatherWidget from "./widgets/WeatherWidget";
import FootballWidget from "./widgets/FootballWidget";

export default function Dashboard() {
    return (
        <main>
            <h1>My Dashboard</h1>
                <WeatherWidget />
                {/* temp mid row */}
                <div style={{ display: 'flex', justifyContent: 'start'}}>
                    <CryptoWidget />
                    <TodoWidget />
                    <FootballWidget />
                </div>
        </main>
    );
}
