import { Link } from "react-router";

export default function Navbar() {
    return (
        <nav>
            <Link to ="/anything">Dashboard</Link>
            {/* Add widget toggles */}
        </nav>
    );
}