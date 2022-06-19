import {Button, Card, Form, Radio, Tooltip, Input} from "antd";
import {useDispatch, useSelector} from "react-redux";
import {
    lastStep,
    nextStep,
    selectConfiguration,
    selectStep, updateNetwork,
} from "../../features/configurations/configurationsSlice";

import React, { useState } from 'react';

const tailLayout = {
    wrapperCol: {
        offset: 4,
        span: 16,
    },
};

const NetWork = () => {
    const [form] = Form.useForm();
    const dispatch = useDispatch();

    const configuration = useSelector(selectConfiguration);
    const step = useSelector(selectStep);


    const getNetworkConfig = (network) => {
        let config = {
            plugin: network.plugin,
            podsCIDR: network.kubePodsCIDR,
            serviceCIDR: network.kubeServiceCIDR,
        }
        return config
    }

    const [initValue] = useState(getNetworkConfig(configuration.spec.network))


    const saveNetworkConfig = () => {
        const network = form.getFieldsValue(true)

        let config = {
            plugin: network.plugin,
            podsCIDR: network.kubePodsCIDR,
            serviceCIDR: network.kubeServiceCIDR,
        }

        dispatch(updateNetwork(
            {
                network: config
            }
        ))

    }
    const handleSubmmit = () => {
        saveNetworkConfig()
        dispatch(nextStep())
    }

    const handleLastStep = () => {
        saveNetworkConfig()
        dispatch(lastStep())
    }


    return step === 5 ? (
            <Card
                title="网络设置"
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
                    <Form.Item label="Pods CIDR" name="podsCIDR">
                        <Input />
                    </Form.Item>
                    <Form.Item label="Services CIDR" name="serviceCIDR">
                        <Input />
                    </Form.Item>
                    <Form.Item label="网络插件" name="plugin">
                        <Radio.Group>
                            <Radio value="calico">
                                <Tooltip>
                                    Calico
                                </Tooltip>
                            </Radio>
                            <Radio value="flannel">
                                <Tooltip>
                                    Flannel
                                </Tooltip>
                            </Radio>
                                <Radio value="cilium">
                                    Cilium
                                </Radio>
                        </Radio.Group>
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

export default NetWork