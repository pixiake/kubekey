import {Button, Card, Form, Input, Radio, Tooltip} from "antd";
import {useDispatch, useSelector} from "react-redux";
import {
    lastStep,
    nextStep,
    selectConfiguration,
    selectStep, updateControlPlane,
} from "../../features/configurations/configurationsSlice";
import React, { useState } from 'react';

const tailLayout = {
    wrapperCol: {
        offset: 4,
        span: 16,
    },
};

const ControlPlane = () => {
    const [form] = Form.useForm();
    const dispatch = useDispatch();

    const configuration = useSelector(selectConfiguration);
    const step = useSelector(selectStep);

    const getRegistryConfig = (controlPlane) => {
        let config = {
            type: controlPlane.hasOwnProperty('internalLoadbalancer') ? 'internal' : 'external',
            domain: controlPlane.hasOwnProperty('internalLoadbalancer') ? 'lb.kubesphere.local' : controlPlane.domain,
            address: controlPlane.address,
            port: controlPlane.hasOwnProperty('internalLoadbalancer') ? '6443' : controlPlane.port,
        }

        return config
    }

    const [initValue] = useState(getRegistryConfig(configuration.spec.controlPlaneEndpoint))

    const [disabled, setDisabled] = useState({
        isRequiredDomain: true,
        domain: false,
        address: false,
        port: false,
    })

    const onChange = () => {
        const registry = form.getFieldsValue(true)
        // eslint-disable-next-line default-case
        switch (registry.type) {
            case "internal":
                setDisabled({
                    isRequiredDomain: false,
                    domain: true,
                    address: true,
                    port: true,
                })
                break
            case "external": {
                setDisabled({
                    isRequiredDomain: true,
                    domain: false,
                    address: false,
                    port: false,
                })
                form.setFieldsValue(getRegistryConfig(configuration.spec.controlPlaneEndpoint))
                break
            }
        }
    };

    const saveControlPlaneConfig = () => {
        const controlPlane = form.getFieldsValue(true)

        let config = {
            domain: "lb.kubesphere.local",
            address: "",
            port: 6443,
        }

        if (controlPlane.type === 'internal') {
            config.internalLoadbalancer = 'haproxy'
        }

        dispatch(updateControlPlane(
            {
                controlPlaneEndpoint: config
            }
        ))

    }
    const handleSubmmit = () => {
        saveControlPlaneConfig()

        dispatch(nextStep())
    }

    const handleLastStep = () => {
        saveControlPlaneConfig()
        dispatch(lastStep())
    }

    return step === 3 ?(
            <Card
                title="控制平面设置"
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
                    <Form.Item label="负载均衡器（LoadBlancer）类型" name="type">
                        <Radio.Group onChange={onChange} >
                            <Radio.Button value="external">
                                <Tooltip title="可通过配置对接集群外已创建好的负载均衡器">
                                    外置负载均衡器
                                </Tooltip>
                            </Radio.Button>
                            <Radio.Button value="internal">
                                <Tooltip title="使用内置负载均衡器实现控制平面高可用">
                                    内置负载均衡器
                                </Tooltip>
                            </Radio.Button>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item label="域名" name="domain" rules={[{ required: disabled.isRequiredDomain, message: '请输入镜像仓库地址!'}]}>
                        <Input disabled={disabled.domain} />
                    </Form.Item>
                    <Form.Item label="地址" name="address">
                        <Input disabled={disabled.address} />
                    </Form.Item>
                    <Form.Item label="端口" name="port">
                        <Input disabled={disabled.port} />
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

export default ControlPlane