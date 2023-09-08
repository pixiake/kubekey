import React from 'react';
import 'antd/dist/antd.min.css';
import './index.css';
import {Steps} from "antd";
import {useSelector} from "react-redux";
import {selectStep} from "../../features/configurations/configurationsSlice";

const {Step} = Steps

const steps = [
    {id: "step1", title: "基础设置"},
    {id: "step2", title: "主机设置"},
    // {id: "step3", title: "镜像仓库设置"},
    {id: "step4", title: "控制平面设置"},
    {id: "step5", title: "集群设置"},
    {id: "step6", title: "网络设置"},
    {id: "step7", title: "存储设置"},
    // {id: "step8", title: "组件设置"},
    {id: "step9", title: "安装"},
]

const Stepper = () => {
    const step = useSelector(selectStep);
    return (
        <div className="steps">
            <Steps direction="vertical" size="small" current={ step }>
                {
                    steps.map((item) => (
                        <Step key={item.id} title={item.title} />
                    ))
                }
            </Steps>
        </div>
    )
}


export default Stepper
