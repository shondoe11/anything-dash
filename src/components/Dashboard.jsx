import TodoWidget from "./Widgets/TodoWidget";
import WeatherWidget from "./widgets/WeatherWidget";

export default function Dashboard() {
    return (
        <main>
            <h1>My Dashboard</h1>
                <WeatherWidget />
                <TodoWidget />
        </main>
    );
}
