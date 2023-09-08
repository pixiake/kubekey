import {Button, Card, Form, Radio, Tooltip, Switch, Input} from "antd";
import {useDispatch, useSelector} from "react-redux";
import {
    lastStep,
    nextStep,
    selectConfiguration,
    selectStep, updateCluster,
} from "../../features/configurations/configurationsSlice";
import React, { useState } from 'react';


const tailLayout = {
    wrapperCol: {
        offset: 4,
        span: 16,
    },
};


const Cluster = () => {
    const [form] = Form.useForm();
    const dispatch = useDispatch();

    const configuration = useSelector(selectConfiguration);
    const step = useSelector(selectStep);

    // const [advanced, setAdvanced] = useState(false)

    const getClusterConfig = (cluster) => {
        let config = {
            type: cluster.kubernetes.type,
            containerManager: cluster.kubernetes.containerManager,
            nodeLocalDNS: cluster.kubernetes.nodelocaldns,
            kata: cluster.kubernetes.kata.enabled,
            nodeFeatureDiscovery: cluster.kubernetes.nodeFeatureDiscovery.enabled,
            autoRenewCerts: cluster.kubernetes.autoRenewCerts,
            registry: cluster.registry.privateRegistry,
            namespace: cluster.registry.namespaceOverride
        }

        return config
    }

    const [initValue] = useState(getClusterConfig(configuration.spec))

    const [disabled, setDisabled] = useState({
        containerManager: false,
        kata: true,
        autoRenewCerts: false
    })

    const onChangeType = () => {
        const cluster = form.getFieldsValue(true)
        switch (cluster.type) {
            case "k3s": {
                setDisabled({
                    containerManager: true,
                    kata: true,
                    autoRenewCerts: true
                })
                form.setFieldsValue({
                    autoRenewCerts: false,
                    kata: false
                })
                break
            }
            default:
                setDisabled({
                    containerManager: false,
                    kata: cluster.containerManager === 'docker' || cluster.containerManager === 'isula',
                    autoRenewCerts: false
                })
        }
    };


    const onChangeRuntime = () => {
        const cluster = form.getFieldsValue(true)
        switch (cluster.containerManager) {
            case "docker":
                setDisabled({
                    kata: true
                })
                break
            case "isula": {
                setDisabled({
                    kata: true
                })
                break
            }
            default:
                setDisabled({
                    kata: false
                })
        }
    };

    const saveClusterConfig = () => {
        const cluster = form.getFieldsValue(true)

        let config = {
            type: cluster.type,
            version: 'v1.23.7',
            containerManager: cluster.containerManager,
            nodelocaldns: cluster.nodeLocalDNS,
            autoRenewCerts: cluster.autoRenewCerts,
            nodeFeatureDiscovery: {
                enabled: cluster.nodeFeatureDiscovery
            },
            kata: {
                enabled: cluster.kata
            }
        }
        let registryConfig = {
            privateRegistry: cluster.registry !== '' ? cluster.registry : '',
            namespaceOverride: cluster.namespace !== '' ? cluster.namespace : ''
        }
        dispatch(updateCluster(
            {
              kubernetes : config,
              registry : registryConfig
            }
        ))

    }
    const handleSubmmit = () => {
        saveClusterConfig()
        dispatch(nextStep())
    }

    const handleLastStep = () => {
        saveClusterConfig()
        dispatch(lastStep())
    }

    // const handleSwitch = (checked) => {
    //     setAdvanced(checked)
    // }
    //
    // const advancedConfig = (advanced) => {
    //     return advanced ? (
    //         <>
    //             <Form.Item label="kube-apiserver 设置">
    //                 <DynamicField name="kube-apiserver" label="添加"></DynamicField>
    //             </Form.Item>
    //             <Form.Item label="kube-controller-manager 设置">
    //                 <DynamicField name="kube-controller-manager" label="添加"></DynamicField>
    //             </Form.Item>
    //             <Form.Item label="kube-scheduler 设置">
    //                 <DynamicField name="kube-scheduler" label="添加"></DynamicField>
    //             </Form.Item>
    //             <Form.Item label="kube-proxy 设置">
    //                 <DynamicField name="kube-proxy" label="添加"></DynamicField>
    //             </Form.Item>
    //             <Form.Item label="kubelet 设置">
    //                 <DynamicField name="kubelet" label="添加"></DynamicField>
    //             </Form.Item>
    //         </>
    //
    //
    //     ) : (
    //         <></>
    //     )
    // }

    return step === 3 ?(
            <Card
                title="集群设置"
                style={{ marginTop: 16 }}
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
                    onFinish={ handleSubmmit }
                >
                    <Form.Item label="集群类型" name="type">
                        <Radio.Group onChange={onChangeType} >
                            <Radio.Button value="kubernetes">
                                    kubernetes
                            </Radio.Button>
                            <Radio.Button value="k3s">
                                    k3s
                            </Radio.Button>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item label="容器运行时" name="containerManager">
                        <Radio.Group onChange={onChangeRuntime} disabled={disabled.containerManager}>
                            <Radio.Button value="docker">
                                <Tooltip>
                                    Docker
                                </Tooltip>
                            </Radio.Button>
                            <Radio.Button value="containerd">
                                <Tooltip>
                                    Containerd
                                </Tooltip>
                            </Radio.Button>
                            <Radio.Button value="cri-o">
                                <Tooltip title="集群节点需提前预装 CRI-O">
                                    CRI-O
                                </Tooltip>
                            </Radio.Button>
                            <Radio.Button value="isula">
                                <Tooltip title="集群节点需提前预装 iSula">
                                    iSula
                                </Tooltip>
                            </Radio.Button>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item label="镜像仓库地址" name="registry">
                        <Input placeholder="指定镜像仓库部署，默认 docker.io"/>
                    </Form.Item>
                    <Form.Item label="镜像命名空间" name="namespace">
                        <Input placeholder="指定镜像 namespace，如 harbor 中存放部署镜像的项目"/>
                    </Form.Item>
                    <Form.Item label="集群 DNS 缓存" valuePropName="checked" name="nodeLocalDNS">
                        <Switch  />
                    </Form.Item>
                    <Form.Item label="节点特性发现" valuePropName="checked" name="nodeFeatureDiscovery">
                        <Switch  />
                    </Form.Item>
                    <Form.Item label="集群证书自动更新" valuePropName="checked" name="autoRenewCerts">
                        <Switch  disabled={disabled.autoRenewCerts}/>
                    </Form.Item>
                    <Form.Item label="安全容器 Kata" valuePropName="checked" name="kata">
                        <Switch disabled={disabled.kata} />
                    </Form.Item>
                    {/*<Form.Item label="高级设置" valuePropName="checked" name="advanced">*/}
                    {/*    <Switch  onChange={handleSwitch} />*/}
                    {/*</Form.Item>*/}
                    {/*{ advancedConfig(advanced) }*/}
                    <Form.Item {...tailLayout}>
                        <Button
                            htmlType="button"
                            style={{
                                margin: '0 8px',
                            }}
                            onClick={ handleLastStep }
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

export default Cluster
