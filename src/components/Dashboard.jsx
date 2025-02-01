import CryptoWidget from "./widgets/CryptoWidget";
import TodoWidget from "./Widgets/TodoWidget";
import WeatherWidget from "./widgets/WeatherWidget";

export default function Dashboard() {
    return (
        <main>
            <h1>My Dashboard</h1>
                <WeatherWidget />
                <div style={{ display: 'flex', justifyContent: 'start'}}>
                    <CryptoWidget />
                    <TodoWidget />
                </div>
        </main>
    );
}
