import React, {useEffect, useState} from 'react'
import {Button, Card, Layout, message, Popconfirm, Space, Spin, Table, Tag, Tooltip} from "antd";
import {DeleteClusterApi, GetClustersApi} from "../../request/api";
import {Link, useNavigate} from "react-router-dom";
import {ReloadOutlined, FileTextOutlined} from "@ant-design/icons";
import './index.css'
import {useDispatch} from "react-redux";
import {viewResult} from "../../features/configurations/configurationsSlice";

const { Content } = Layout

export default function Clusters() {
    const navigate = useNavigate()
    const dispatch = useDispatch();

    const [reload, setReload] = useState(true)
    const [clusters, setClusters] = useState([])

    const columns = [
        {
            title: '集群名称',
            dataIndex: 'name',
            key: 'name',
            render: (_, record) => (
                <div>
                    {record.name}&nbsp;&nbsp;
                    {record.tags.hasOwnProperty("kubekey.kubesphere.io/is-current-cluster")? <Tag color="lime">当前集群</Tag> : <noscript/>}
                </div>
            ),
        },
        {
            title: '集群规模',
            dataIndex: 'size',
            key: 'size',
            render: (_, record) => {
                if (record.piplineStatus === 'Running') {
                    return (
                        <div>
                            <Spin size='small' tip='安装中'/>
                        </div>
                    )
                } else {
                    return (
                        <div>
                            <Tag> ControlPlane: {record.size[0]} </Tag>
                            <Tag> Worker: {record.size[1]} </Tag>
                        </div>
                        )
                }

            }
        },
        {
            title: '集群版本',
            dataIndex: 'version',
            key: 'version',
        },
        {
            title: '集群标签',
            key: 'tags',
            dataIndex: 'tags',
            render: (_, { tags }) => (
                <>
                    { Object.keys(tags).map(
                        (key,index) => {
                            if (key === 'kubekey.kubesphere.io/cluster-type') {
                                return (
                                    <Tag key={key} color="#55acee">
                                        { tags[key] }
                                    </Tag>
                                );
                            }
                            if (key === 'kubekey.kubesphere.io/kubesphere') {
                                return (
                                    <Tag key={key} color="#3b5999" >
                                        KubeSphere
                                    </Tag>
                                );
                            }
                            if (key === 'kubekey.kubesphere.io/QKCP') {
                                return (
                                    <Tag key={key} color="#3b5999">
                                        QKCP
                                    </Tag>
                                );
                            }
                            if (key === 'kubekey.kubesphere.io/KSV') {
                                return (
                                    <Tag key={key} color="#3b5999">
                                        KSV
                                    </Tag>
                                );
                            }
                            return null
                        }

                    ) }
                </>
            ),
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button size="small" type="link">添加节点</Button>
                    <Button size="small" type="link">升级</Button>
                    <Popconfirm
                        title={`确定删除集群 ${record.name} ？`}
                        okText="删除"
                        cancelText="取消"
                        onConfirm={() => {
                            DeleteClusterApi(record.namespace, record.name)
                                .then(
                                    res => {
                                        if (res.status === 200) {
                                            message.success(`集群 $(record.name) 已删除`)
                                            setReload(!reload)
                                        }
                                    }
                                ).catch(err => message.error(err))
                        }
                        }
                    >
                        <Button size="small" type="link">删除</Button>
                    </Popconfirm>
                    { record.piplineStatus === 'Running' ? (
                        <Tooltip title="查看任务日志">
                            <Button shape="circle" icon={<FileTextOutlined />} onClick={() => {
                                dispatch(viewResult())
                                navigate('/cluster/kubekey-system/'+ record.name)
                            }}/>
                        </Tooltip>
                    ) : <noscript/> }
                </Space>
            ),
        },
    ];

    const handleReload = () => {
        setReload(!reload)
    }

    useEffect(() => {
        let newClusters = []
        GetClustersApi().then((res) => {
            if (res.status === 200) {
                res.data.pods.map((cluster) =>
                    newClusters.push({
                        key: cluster.objectMeta.uid,
                        name: cluster.objectMeta.name,
                        namespace: cluster.objectMeta.namespace,
                        size: [cluster.status.masterCount, cluster.status.nodesCount],
                        version: cluster.version,
                        tags: cluster.objectMeta.annotations !== undefined ? cluster.objectMeta.annotations : {},
                        piplineStatus: cluster.status.piplineInfo.status
                    })
                )
                setClusters(newClusters)
            }
        }).catch(err => (
            message.error(err)
        ))
    }, [reload])

    return (
        <Layout className='body'>
            <Content>
                <Card
                    type="inner"
                    title="集群列表"
                    style={{ margin: '3% 3% 3% 3%' }}
                    extra={
                        <>
                            <Link to="/cluster">
                                <Button type="primary" style={{ marginRight: '5px' }}> 创建 </Button>
                            </Link>

                            <Button icon={<ReloadOutlined />} onClick={ handleReload } />
                        </>
                    }
                >
                    <Table columns={columns}  dataSource={ clusters }/>
                </Card>
            </Content>
        </Layout>
    )
}
