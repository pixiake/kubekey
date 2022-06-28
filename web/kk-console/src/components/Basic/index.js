import {Button, Card, Form, Input, Radio, Tooltip} from "antd";
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
        }
    }

    const [initValue] = useState(getMetadata(configuration))
    const [inputUserInfo, setInputUserInfo] = useState(false)

    const saveMetadata = () => {
        const basic = form.getFieldsValue(true)

        let metadataConfig = {
                name: basic.name,
                namespace: "kubekey-system"
        }

        dispatch(updateBasic(
            {
                metadata: metadataConfig,
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

    const onChangeProduct = () => {
        const product = form.getFieldsValue(true).managerSoft
        console.log(product)
        switch (product) {
            case "none":
                setInputUserInfo(false)
                break
            default:
                setInputUserInfo(true)
        }
    }

    const userInfo = (inputUserInfo) => {
      if (inputUserInfo) {
         return (
             <>
                 <Form.Item
                     name="username"
                     label="用户名"
                     rules={[
                         {
                             required: true,
                             message: '请输入您的管理员用户名 !',
                         },
                     ]}
                 >
                     <Input />
                 </Form.Item>

                 <Form.Item
                     name="password"
                     label="密码"
                     rules={[
                         {
                             required: true,
                             message: '请设置您的管理员用户密码 !',
                         },
                     ]}
                     hasFeedback
                 >
                     <Input.Password />
                 </Form.Item>
                 <Form.Item
                     name="confirm"
                     label="确认密码"
                     dependencies={['password']}
                     hasFeedback
                     rules={[
                         {
                             required: true,
                             message: '请再次确认您的管理员用户密码 !',
                         },
                         ({ getFieldValue }) => ({
                             validator(_, value) {
                                 if (!value || getFieldValue('password') === value) {
                                     return Promise.resolve();
                                 }
                                 return Promise.reject(new Error('您两次输入的密码不匹配 !'));
                             },
                         }),
                     ]}
                 >
                     <Input.Password />
                 </Form.Item>
             </>
         )
      } else {
          return (
              <noscript></noscript>
          )
      }

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
                <Form.Item label="管理软件" name="managerSoft">
                    <Radio.Group onChange={onChangeProduct}>
                        <Radio.Button value="none">
                            <Tooltip title="裸集群（kubernetes or k3s）">
                                无
                            </Tooltip>
                        </Radio.Button>
                        <Radio.Button value="kubesphere">
                            <Tooltip title="开源容器管理平台">
                                KubeSphere
                            </Tooltip>
                        </Radio.Button>
                        <Radio.Button value="qkcp">
                            <Tooltip title="企业级容器管理平台">
                                QKCP
                            </Tooltip>
                        </Radio.Button>
                        <Radio.Button value="ksv">
                            <Tooltip title="虚拟机(Virtual Machines)管理平台">
                                KSV
                            </Tooltip>
                        </Radio.Button>
                    </Radio.Group>
                </Form.Item>
                {userInfo(inputUserInfo)}
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
