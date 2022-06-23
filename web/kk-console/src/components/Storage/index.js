import {Button, Card, Form, Radio, Tooltip, Input, Select, message} from "antd";
import {useDispatch, useSelector} from "react-redux";
import {
    lastStep,
    nextStep,
    selectConfiguration,
    selectStep, updateAddons,
} from "../../features/configurations/configurationsSlice";
import React, { useState } from 'react';
import {CreateClusterApi, GetDeployCsrTokenApi} from "../../request/api";
import {useNavigate} from "react-router-dom";

const { Option } = Select;
const tailLayout = {
    wrapperCol: {
        offset: 4,
        span: 16,
    },
};

const Storage = () => {
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const navigate = useNavigate()
    const [storageType, setStorageType] = useState('local');

    const configuration = useSelector(selectConfiguration);
    const step = useSelector(selectStep);


    const getStorageConfig = (addons) => {
        let addon;
        let config = {
            storageType: 'local'
        }
        for (addon in addons) {
            switch (addon.name) {
                case 'nfs-client':
                    config = {
                        storageType: 'nfs',
                        nfsServer: '',
                        nfsPath: ''
                    }
                    for (let value in addon.sources.chart.values) {
                        if (value.split('=')[0] === 'nfs.server') {
                            config.nfsServer = value.split('=')[1]
                        }
                        if (value.split('=')[0] === 'nfs.path') {
                            config.nfsPath = value.split('=')[1]
                        }
                    }
                    break
                case 'rook-ceph':
                    config = {
                        storageType: 'ceph',
                        nodes: []
                    }
                    for (let value in addon.sources.chart.values) {
                        let valueSplit = value.split('=')
                        if (valueSplit[0].includes('ceph.storage.nodes')) {
                            config.nodes.push(valueSplit[1])
                        }
                    }
                    break
                default:
                    config = {
                        storageType: 'local'
                    }
            }
        }

        return config
    }

    const [initValue] = useState(getStorageConfig(configuration.spec.addons))

    const saveStorageConfig = () => {
        let config = []
        let addon = {}
        const storage = form.getFieldsValue(true)
        switch (storage.storageType) {
            case 'nfs':
                addon = {
                    name: 'nfs-client',
                    namespace: 'kube-system',
                    sources: {
                        chart: {
                            name: 'nfs-client-provisioner',
                            path: 'charts',
                            values: [
                                'storageClass.defaultClass=true',
                                `nfs.server=${storage.nfsServer}`,
                                `nfs.path=${storage.nfsPath}`
                            ]
                        }
                    },
                }

                config = configuration.spec.addons.filter((item) => item.name !== 'nfs-client')
                config.unshift(addon)
                break
            case 'ceph':
                let values = [
                    `enableHA=${storage.nodes.length > 2}`,
                    `ceph.storage.useAllNodes=${storage.nodes.length === 0}`
                ]
                storage.nodes.map((node, index) => {
                    return (
                        values.push(`ceph.storage.nodes[${index.toString()}]=${node}`)
                    )
                })
                addon = {
                    name: 'rook-ceph',
                    namespace: 'rook-ceph',
                    sources: {
                        chart: {
                            name: 'ceph-cluster',
                            path: 'charts',
                            values: values
                        }
                    },
                }
                config = configuration.spec.addons.filter((item) => item.name !== 'rook-ceph')
                config.unshift(addon)
                break
            default:
                addon = {}

            dispatch(updateAddons(
                {
                    addons: config
                }
            ))
        }
    }

    const handleSubmmit = () => {
        saveStorageConfig()

        GetDeployCsrTokenApi().then(
            (res) => {
                if (res.status === 200) {
                    CreateClusterApi(configuration, res.data.token).then(
                        (res) => {
                            message.success("集群创建任务下发成功")
                            navigate('/cluster/'+ configuration.metadata.namespace + '/' + configuration.metadata.name)
                        }
                    ).catch(err => {
                     message.error(err)
                    })
                }

            }
        ).catch(err => {
            message.error(err)
        })

        dispatch(nextStep())
    }

    const handleLastStep = () => {
        saveStorageConfig()
        dispatch(lastStep())
    }

    const onChange = () => {
        const storage = form.getFieldsValue(true)
        switch (storage.storageType) {
            case 'nfs':
                setStorageType('nfs')
                break
            case 'ceph':
                setStorageType('ceph')
                break
            default:
                setStorageType('local')
        }
    }

    const showNodes = () => {
            let children = [];
            let hostList = []

            const nodes = [...new Set(configuration.spec.roleGroups.controlPlane.concat(configuration.spec.roleGroups.worker))]

            configuration.spec.hosts.forEach(
                (item) => {
                    if (nodes.includes(item.name)) {
                        hostList.push(item)
                    }
                }
            )

            // const filteredOptions = hostList.filter((o) => !selectedItems.includes(o.name.toString()))
            hostList.map((host) => (
                children.push(<Option name={host.name.toString()} key={host.name.toString()}
                                      label={host.name.toString()}
                                      value={host.name.toString()}> {host.name.toString() + ' (' + host.internalAddress.toString() + ')'} </Option>)
            ))
            return children
        }

    const storageConfig = (storageType) => {
            switch (storageType) {
                case 'nfs':
                    return (
                        <>
                            <Form.Item label="NFS 服务地址" name="nfsServer">
                                <Input/>
                            </Form.Item>
                            <Form.Item label="NFS 服务路径" name="nfsPath">
                                <Input/>
                            </Form.Item>
                        </>
                    )
                case 'ceph':
                    return (
                        <>
                            <Form.Item
                                name="nodes"
                                label="选择存储节点"
                                rules={[{required: true, message: '请指定集群中节点安装 ceph !', type: 'array'}]}
                                extra="被选中节点上的所有未格式化硬盘或分区，将会被 ceph 纳管，组成存储资源池，请确保所选节点上存在未格式化的硬盘或分区。如需实现存储高可用，请选择至少三个节点。"
                            >
                                <Select mode="multiple" placeholder="请指定集群中节点安装 ceph " optionLabelProp="label">
                                    {showNodes()}
                                </Select>
                            </Form.Item>
                        </>
                    )
                default:
                    return (
                        <noscript/>
                    )
            }
        }


    return step === 5 ? (
            <Card
                title="存储设置"
                style={{marginTop: 16}}
                type="inner"
            >
                <Form
                    labelCol={{
                        span: 4,
                    }}
                    wrapperCol={{
                        span: 6,
                    }}
                    layout="horizontal"
                    initialValues={ initValue }
                    form={form}
                    onFinish={handleSubmmit}
                >
                    <Form.Item label="存储类型" name="storageType">
                        <Radio.Group onChange={onChange}>
                            <Radio value="local">
                                <Tooltip title="将自动安装 openebs local provisioner 提供本地存储服务">
                                    本地存储
                                </Tooltip>
                            </Radio>
                            <Radio value="nfs">
                                <Tooltip title="将根据配置，自动安装 nfs-client-provisioner 对接第三方 NFS 存储">
                                    对接 NFS
                                </Tooltip>
                            </Radio>
                            <Radio value="ceph">
                                <Tooltip title="将在集群中安装 rook-ceph，要求存储节点拥有未被格式化的磁盘或分区">
                                    Rook Ceph
                                </Tooltip>
                            </Radio>
                        </Radio.Group>
                    </Form.Item>
                    {storageConfig(storageType)}
                    <Form.Item {...tailLayout}>
                        <Button
                            htmlType="button"
                            style={{
                                margin: '0 8px',
                            }}
                            onClick={handleLastStep}
                        >
                            上一步
                        </Button>
                        <Button htmlType="submit" type="primary">
                            下一步
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        ) : (
            <noscript></noscript>
        )
}
export default Storage
