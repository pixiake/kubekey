import React, {useEffect, useState} from 'react'
import logo from "../../assets/img/logo.svg";
import {Layout, Dropdown, Menu, Space, message} from "antd";
import {UserOutlined, UpOutlined} from "@ant-design/icons";
import './index.css'
import {useNavigate} from "react-router-dom";

const { Header } = Layout


export default function CommonHeader() {
    const navigate = useNavigate()

    const [username, setUsername] = useState("访客")
    useEffect(() => {
        let username1 = localStorage.getItem('username')
        if (username1) {
            setUsername(username1)
        }
    }, [])

    const logout = ({ key }) => {
        if ({key}.key.toString() === '2') {
            localStorage.clear()
            message.success('退出成功，即将返回登录页')
            setTimeout(() => navigate('/login'), 1500)
        }
    }

    const menu = (
        <Menu
            onClick={ logout }
            items={[
                {
                    key: '1',
                    label: (
                        <div>
                            { username } &nbsp;
                            <UpOutlined />
                        </div>
                    ),
                },
                {
                    type: 'divider',
                },
                {
                    key: '2',
                    label: '退出登录',
                }
            ]}
        />
    );



    return (
        <Header className='header'>
            <img src={ logo } alt="" className="logo"/>
            <Dropdown overlay={menu}>
                <a href='' onClick={e => e.preventDefault()}>
                    <Space>
                        <UserOutlined />
                    </Space>
                </a>
            </Dropdown>
        </Header>
    )
}
