import React, {useEffect, useState} from 'react';
import 'antd/dist/antd.min.css';
import './css/cluster.css';
import {Layout, message} from 'antd';
import {useSelector} from "react-redux";
import {selectStep} from "../features/configurations/configurationsSlice";
import Stepper from "../components/Stepper";
import Hosts from "../components/Hosts";
import ControlPlane from "../components/ControlPlane";
import Cluster from "../components/Cluster";
import Network from "../components/Network";
import Storage from "../components/Storage";
import CommonHeader from "../components/CommonHeader";
import Basic from "../components/Basic";
import {GetClustersApi} from "../request/api";

const { Content, Sider } = Layout;

export default function NewCluster() {
    const step = useSelector(selectStep);

    const [clusters, setClusters] = useState([])
    const getClusters = () => {
        let newCluster=[]
        GetClustersApi().then((res) => {
            if (res.status === 200) {
                res.data.pods.map((item) =>
                    newCluster.push(item.objectMeta.name)
                )
                setClusters(newCluster)
            }
        }).catch(err => (
            message.error(err)
        ))
    }

    useEffect(() => {
        getClusters()
    }, [])


    return (
        <Layout>
            <CommonHeader/>
            <Layout className='body'>
                <Sider className='body'>
                    <Stepper className='steps'>{step}</Stepper>
                </Sider>
                <Content className='body'>
                    <div
                        className="site-layout-background"
                        style={{
                            padding: 24,
                        }}
                    >
                        <Basic clusters={clusters}/>
                        <Hosts/>
                        {/*<Registry/>*/}
                        <ControlPlane/>
                        <Cluster/>
                        <Network/>
                        <Storage/>
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};
