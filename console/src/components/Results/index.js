import React, {useEffect, useState} from 'react'
import {Button, message, Steps} from "antd";
import CodeMirror from "@uiw/react-codemirror";
import {EditorView, ViewPlugin} from "@codemirror/view";
import {GetClusterAPI, GetPodLogsApi} from "../../request/api";
// import { javascript } from '@codemirror/lang-javascript';
import {Link} from "react-router-dom";
import {ReloadOutlined} from "@ant-design/icons";
import Card from "antd/es/card/Card";
// import {shell} from "@codemirror/legacy-modes/mode/shell";
// import { shell } from '@codemirror/legacy-modes/mode/shell';
// import { StreamLanguage } from '@codemirror/language';


const { Step } = Steps;

const scrollBottom = ViewPlugin.fromClass(
    class {
        dispatch(tr) {
            tr.view.lineWrapping = false
        }
        update(update) {
            update.view.lineWrapping = false
            if (update.docChanged) {
                update.view.scrollDOM.scrollTop = update.view.scrollDOM.scrollHeight;
            }
        }
    }
);

// const langs = () => StreamLanguage.define(shell)

const installSteps = [
    {id: "step1", title: "初始化节点"},
    {id: "step2", title: "拉取镜像"},
    {id: "step3", title: "etcd 初始化"},
    {id: "step4", title: "控制平面初始化"},
    {id: "step5", title: "添加工作节点"},
    {id: "step6", title: "更新集群配置"},
    {id: "step7", title: "等待服务组件启动"},
]

export default function ShowResults(props) {
    const [logs, setLogs] = useState('Waiting for task status ...')
    const [endDate, setEndDate] = useState('')
    const [count, setCount] = useState(0)
    const [step, setStep] = useState(0)
    const [taskStatus, setTaskStatus] = useState('wait')

    useEffect(() => {
        const  timer = setTimeout(() => {
            if (props.namespace !== '' && props.pod !== '' && props.container !== '' && taskStatus !== 'error') {
                GetClusterAPI(props.namespace, props.cluster).then(
                    res => {
                        const condition = res.data.status.Conditions
                        const len = res.data.status.Conditions.length
                        if (res.status === 200) {
                           switch (true) {
                               case len < 7:
                                   setStep(0)
                                   condition[len-1].hasOwnProperty('status') ? setTaskStatus('process') : setTaskStatus('error')
                                   break
                               case len < 8:
                                   setStep(1)
                                   condition[len-1].hasOwnProperty('status') ? setTaskStatus('process') : setTaskStatus('error')
                                   break
                               case len < 13:
                                   setStep(2)
                                   condition[len-1].hasOwnProperty('status') ? setTaskStatus('process') : setTaskStatus('error')
                                   break
                               case len < 16:
                                   setStep(3)
                                   condition[len-1].hasOwnProperty('status') ? setTaskStatus('process') : setTaskStatus('error')
                                   break
                               case len < 18:
                                   setStep(4)
                                   condition[len-1].hasOwnProperty('status') ? setTaskStatus('process') : setTaskStatus('error')
                                   break
                               case len < 24:
                                   setStep(5)
                                   condition[len-1].hasOwnProperty('status') ? setTaskStatus('process') : setTaskStatus('error')
                                   break
                               case len > 23:
                                   setStep(6)
                                   condition[len-1].hasOwnProperty('status') ? setTaskStatus('process') : setTaskStatus('error')
                                   break
                               default:
                                   break
                           }
                        }
                    }
                ).catch(err => message.error(err))

                GetPodLogsApi(props.namespace, props.pod, props.container).then(
                    res => {
                        if (res.status === 200) {
                            if (endDate !== res.data.info.toDate && res.data.logs.length !== 0) {
                                setEndDate(res.data.info.toDate)
                                let newLogs = '\n' + res.data.logs[0].content
                                res.data.logs.forEach((item,index) => {
                                    if (index > 0) {
                                        newLogs = newLogs + '\n' + item.content
                                    }
                                })
                                setLogs(logs + newLogs)
                            }
                        }
                    }
                ).catch(err => {
                    message.error(err)
                })

                setCount(count + 1)
            }
        }, 5000)

        return () => clearTimeout(timer)

    }, [count, logs, props.pod])

    return (
        <Card
            type="inner"
            title=""
            style={{ margin: '3% 3% 3% 3%' }}
            extra={
                <>
                    <Link to="/">
                        <Button type="primary" style={{ marginRight: '5px' }}> 返回集群列表 </Button>
                    </Link>

                    <Button icon={<ReloadOutlined />}  />
                </>
            }
        >
            <div className='progressdot'>
                <Steps size="small" labelPlacement='vertical' current={step} status={taskStatus}>
                    {installSteps.map((item)=> (
                        <Step key={item.id} title={item.title} />
                    ))}
                </Steps>
            </div>
            <div className='codemirror' style={{ marginTop: '3%' }}>
                <CodeMirror
                    value={logs}
                    height="500px"
                    readOnly={true}
                    editable={false}
                    theme={'dark'}
                    style={{
                        maxWidth: '995px',
                        margin: '-18px auto 0 auto',
                        position: 'relative',
                        zIndex: 999,
                    }}
                    extensions={[scrollBottom, EditorView.lineWrapping]}
                />
            </div>
            </Card>

    )
}
