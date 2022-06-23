import React from "react";
import './App.css';
import {Layout} from "antd";
import CommonHeader from "./components/CommonHeader";
import Clusters from "./components/Clusters";

function App() {
    return (
        <Layout>
            <CommonHeader />
            <Clusters/>
        </Layout>
    )
}

export default App;
