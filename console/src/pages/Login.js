import React from 'react'
import 'antd/dist/antd.min.css';
import './css/login.css'
import { Button, Form, Input, message } from 'antd';
import { LockOutlined} from '@ant-design/icons';
import logo from '../assets/img/logo.svg'
import {GetLoginCsrTokenApi, LoginApi} from "../request/api";
import { useNavigate } from 'react-router-dom'

export default function Login() {
    const navigate = useNavigate()


    const onFinish = (values) => {
        GetLoginCsrTokenApi()
            .then(res => {
                if (res.status === 200) {
                    LoginApi( {
                        token: values.token,
                    }, res.data.data.token).then(res => {
                        if ( res.status === 200 ) {
                                localStorage.setItem('jweToken', res.data.data.jweToken)
                                localStorage.setItem('username', res.data.data.name)
                                message.success("登录成功")
                                setTimeout(() => {
                                    navigate('/')
                                }, 1500)
                            }
                    }).catch(err => (
                        message.error(err)
                    ))
                }
        }).catch(err => {
            message.error(err)
        })
    };

    const onFinishFailed = (errorInfo) => {
        message.error(errorInfo)
    };
    return (
        <div className='login'>
            <div className='login_box'>
                <img src={ logo } alt=''/>
                <Form
                    name="basic"
                    initialValues={{
                        remember: true,
                    }}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                >
                    <Form.Item
                        name="token"
                        rules={[
                            {
                                required: true,
                                message: '请输入 Token',
                            },
                        ]}
                    >
                        <Input.Password
                            placeholder="请输入 Token"
                            prefix={<LockOutlined className="site-form-item-icon" />}
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            登录
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    )
}
