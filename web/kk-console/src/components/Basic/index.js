import {Button, Card, Form, Input} from "antd";
import {useDispatch, useSelector} from "react-redux";
import {
    nextStep,
    selectConfiguration,
    selectStep,
    updateBasic,
} from "../../features/configurations/configurationsSlice";

import React, {useState} from 'react';

const tailLayout = {
    wrapperCol: {
        offset: 4,
        span: 16,
    },
};

const Basic = (props) => {
    const [form] = Form.useForm();
    const dispatch = useDispatch();

    const configuration = useSelector(selectConfiguration);
    const step = useSelector(selectStep);

    const getMetadata = (configuration) => {
        return {
            name: configuration.metadata.name,
            registry: configuration.spec.registry.privateRegistry,
            namespace: configuration.spec.registry.namespaceOverride
        }
    }

    const [initValue] = useState(getMetadata(configuration))


    const saveMetadata = () => {
        const basic = form.getFieldsValue(true)

        let metadataConfig = {
                name: basic.name,
                namespace: "kubekey-system"
        }
        let registryConfig = {
            privateRegistry: basic.registry !== '' ? basic.registry : '',
            namespaceOverride: basic.namespace !== '' ? basic.namespace : ''
        }
        dispatch(updateBasic(
            {
                metadata: metadataConfig,
                registry : registryConfig
            }
        ))

    }
    const handleSubmmit = () => {
        saveMetadata()
        dispatch(nextStep())
    }

    const handleValidatorName = (_ , value) => {
        if (!props.clusters.includes(value)) {
            return Promise.resolve();
        }
        return Promise.reject(new Error('集群' + value + '已存在'));
    }

    return step === 0 ? (
        <Card
            title="基础设置"
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
                <Form.Item
                    label="集群名称"
                    name="name"
                    rules={[
                        {required: true, message: '请输入名称'},
                        {pattern: /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/, message: '名称中只允许包含小写字母、数字、 "-" 、".", 并且开头与结尾必须是小写字母或数字'},
                        {validator: handleValidatorName}
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item label="镜像仓库地址" name="registry">
                    <Input placeholder="指定镜像仓库部署，默认 docker.io"/>
                </Form.Item>
                <Form.Item label="镜像命名空间" name="namespace">
                    <Input placeholder="指定镜像 namespace，如 harbor 中存放部署镜像的项目"/>
                </Form.Item>
                <Form.Item {...tailLayout}>
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

export default Basic
