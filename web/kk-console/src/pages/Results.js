import React, {useEffect, useState} from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { ViewPlugin } from "@codemirror/view";
import CommonHeader from "../components/CommonHeader";
import {Layout, message, Steps} from 'antd';
import './css/results.css'
import ShowResults from "../components/Results";
import {GetClusterAPI} from "../request/api";
import {useParams} from "react-router-dom";
const { Content } = Layout;
const { Step } = Steps;

function Results() {
    const {namespace, name }= useParams()
    const [podName, setPodName]= useState('')
    const [containerName, setContainerName]= useState('')
    useEffect(() => {
        GetClusterAPI(namespace, name).then(
            res => {
                if (res.status === 200) {
                    setPodName(res.data.status.jobInfo.pods[0].name)
                    setContainerName(res.data.status.jobInfo.pods[0].containers[0].name)
                }
            }
        ).catch(err => message.error(err))
    }, [])

    return (
        <Layout>
           <CommonHeader/>
            <Layout className='body'>
                <Content>
                    <div className='results'>
                       <ShowResults cluster={name} namespace={namespace} pod={podName} container={containerName}/>
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
}
export default Results;
