import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Login from "../pages/Login";
import App from "../App";
import NewCluster from "../pages/Cluster";

const BaseRouter = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<App />}/>
                <Route path="/login" element={<Login />}/>
                <Route path="/cluster" element={<NewCluster />}/>
            </Routes>
        </Router>
        )
}

export default BaseRouter
