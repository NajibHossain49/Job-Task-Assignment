import { Outlet } from "react-router-dom";
// import Header from "../Components/Header";
// import Footer from "../Components/Footer";


const MainLayout = () => {
    return (
        <div>
            <header>
                {/* <Header /> */}
            </header>
            <main>
                {/* Render child routes here */}
                <Outlet />
            </main>
            <footer>
                {/* <Footer /> */}
            </footer>
        </div>
    );
};

export default MainLayout;