import {Button, Card, Form, Input, Radio, Tooltip, Switch} from "antd";
import {useDispatch, useSelector} from "react-redux";
import {
    lastStep,
    nextStep,
    selectConfiguration,
    selectStep,
    updateRegistry
} from "../../features/configurations/configurationsSlice";
import React, { useState } from 'react';

const tailLayout = {
    wrapperCol: {
        offset: 4,
        span: 16,
    },
};

const Registry = () => {
    const [form] = Form.useForm();
    const dispatch = useDispatch();

    const configuration = useSelector(selectConfiguration);
    const step = useSelector(selectStep);

    const getRegistryConfig = (registry, type) => {
        let config = {
            type: type,
            address: type === 'registry' || type === 'harbor' ? 'dockerhub.kubekey.local': registry.address,
            namespace: registry.namespaceOverride,
            user: type === 'harbor' ? 'admin':'',
            password: type === 'harbor' ? 'Harbor12345':'',
            skipTLSVerify: false,
            plainHTTP: false
        }
        if (registry.auths.hasOwnProperty(registry.address)) {
            Object.keys(registry.auths[registry.address]).forEach((key) => {
                // eslint-disable-next-line default-case
                switch (key) {
                    case "username":
                        config.user = registry.auths[registry.address][key]
                        break
                    case "password":
                        config.password = registry.auths[registry.address][key]
                        break
                    case "skipTLSVerify":
                        config.skipTLSVerify = registry.auths[registry.address][key]
                        break
                    case "plainHTTP":
                        config.plainHTTP = registry.auths[registry.address][key]
                        break
                }
            })
        }

        return config
    }

    const [initValue] = useState(getRegistryConfig(configuration.spec.registry, 'default'))

    const [disabled, setDisabled] = useState({
        isRequiredAddress: false,
        address: true,
        namespace: true,
        user: true,
        password: true,
        skipTLSVerify: true,
        plainHTTP: true,
    })

    const onChange = () => {
        const registry = form.getFieldsValue(true)
        // eslint-disable-next-line default-case
        switch (registry.type) {
            case "default":
                setDisabled({
                    isRequiredAddress: false,
                    address: true,
                    namespace: true,
                    user: true,
                    password: true,
                    skipTLSVerify: true,
                    plainHTTP: true,
                })
                break
            case "custom": {
                setDisabled({
                    isRequiredAddress: true,
                    address: false,
                    namespace: false,
                    user: false,
                    password: false,
                    skipTLSVerify: false,
                    plainHTTP: false,
                })
                form.setFieldsValue(getRegistryConfig(configuration.spec.registry, 'custom'))
                break
            }
            case "registry": {
                setDisabled({
                    isRequiredAddress: true,
                    address: true,
                    namespace: false,
                    user: true,
                    password: true,
                    skipTLSVerify: true,
                    plainHTTP: true,
                })
                form.setFieldsValue(getRegistryConfig(configuration.spec.registry, 'registry'))
                break
            }
            case "harbor": {
                setDisabled({
                    isRequiredAddress: true,
                    address: true,
                    namespace: false,
                    user: true,
                    password: true,
                    skipTLSVerify: true,
                    plainHTTP: true,
                })
                form.setFieldsValue(getRegistryConfig(configuration.spec.registry, 'harbor'))
                break
            }
        }
    };

    const saveRegistryConfig = () => {
        const registry = form.getFieldsValue(true)

        let config = {
            type: registry.type,
            privateRegistry: registry.address,
            namespaceOverride: registry.namespace,
            auths: {}
        }
        if (registry.address !== '' && registry.user !== '' && registry.password !== '') {
            config.auths["'"+registry.address+"'"] = {
                username: registry.user,
                password: registry.password,
                skipTLSVerify: registry.skipTLSVerify === undefined ? false : registry.skipTLSVerify,
                plainHTTP: registry.plainHTTP === undefined ? false : registry.plainHTTP,
            }
        }

        dispatch(updateRegistry(
            {
                registry: config
            }
        ))

    }
    const handleSubmmit = () => {
        saveRegistryConfig()

        dispatch(nextStep())
    }

    const handleLastStep = () => {
        saveRegistryConfig()
        dispatch(lastStep())
    }

    return step === 2 ?(
            <Card
                title="镜像仓库设置"
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
                    <Form.Item label="仓库类型" name="type">
                        <Radio.Group onChange={onChange} >
                            <Radio.Button value="default">
                                <Tooltip title="将使用默认仓库地址(docker.io)进行安装，如环境无法连接互联网，请选择其它仓库类型">
                                    默认仓库
                                </Tooltip>
                            </Radio.Button>
                            <Radio.Button value="custom">
                                <Tooltip title="可通过配置使用自有镜像仓库进行集群安装">
                                    自有仓库
                                </Tooltip>
                            </Radio.Button>
                            <Radio.Button value="registry">
                                <Tooltip title="安装 Docker Registry 作为集群镜像仓库">
                                    Docker Registry
                                </Tooltip>
                            </Radio.Button>
                            <Radio.Button value="harbor">
                                <Tooltip title="安装 Harbor 作为集群镜像仓库">
                                    Harbor
                                </Tooltip>
                            </Radio.Button>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item label="仓库地址" name="address" rules={[{ required: disabled.isRequiredAddress, message: '请输入镜像仓库地址!'}]}>
                        <Input disabled={disabled.address} />
                    </Form.Item>
                    <Form.Item label="命名空间" name="namespace">
                        <Input disabled={disabled.namespace} />
                    </Form.Item>
                    <Form.Item label="用户名" name="user">
                        <Input disabled={disabled.user} />
                    </Form.Item>
                    <Form.Item label="密码" name="password">
                        <Input disabled={disabled.password} />
                    </Form.Item>
                    <Form.Item label="TLS 验证" valuePropName="checked" name="skipTLSVerify">
                        <Switch disabled={disabled.skipTLSVerify} />
                    </Form.Item>
                    <Form.Item label="使用HTTP连接仓库" valuePropName="checked" name="plainHTTP">
                        <Switch disabled={disabled.user} />
                    </Form.Item>
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

export default Registry