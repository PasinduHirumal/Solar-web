import { Outlet } from "react-router-dom";
import Footer from "../components/Footer.jsx";
import Navbar from "../components/Navbar.jsx";

export default function MainLayout() {
    return (
        <div className="min-h-screen flex flex-col font-sans transition-colors duration-300">
            <Navbar />

            <main className="w-full flex-1 mx-auto">
                <Outlet />
            </main>

            <Footer />
        </div>
    );
}
