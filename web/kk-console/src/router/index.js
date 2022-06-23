import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Login from "../pages/Login";
import App from "../App";
import NewCluster from "../pages/Cluster";
import Results from "../pages/Results";

const BaseRouter = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<App />}/>
                <Route path="/login" element={<Login />}/>
                <Route path="/cluster" element={<NewCluster />}/>
                <Route path="/cluster/:namespace/:name" element={<Results />}/>
            </Routes>
        </Router>
        )
}

export default BaseRouter
