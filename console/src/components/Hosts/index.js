import React, { useState } from 'react';
import {
    Modal,
    Button,
    Card,
    Table,
    Tag,
    Form,
    Radio,
    Input,
    Checkbox,
    Typography,
    Popconfirm,
    Space
} from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import TextArea from "antd/es/input/TextArea";
import {
    lastStep,
    nextStep,
    selectConfiguration, selectStep,
    updateHosts
} from "../../features/configurations/configurationsSlice";
import {useDispatch, useSelector} from "react-redux";


const tailLayout = {
    wrapperCol: {
        offset: 8,
        span: 16,
    },
};

const formItemLayout = {
    labelCol: {
        xs: {
            span: 16,
        },
        sm: {
            span: 4,
        },
    },
    wrapperCol: {
        sm: {
            span: 16,
        },
    },
};
const formItemLayoutWithOutLabel = {
    wrapperCol: {
        sm: {
            offset: 4,
            span: 16,
        },
    },
};

const initValues = {
    name: "",
    address: "",
    internalAddress: "",
    key: "",
    password: "",
    ssh: "password",
    port: 22,
    user: "root",
    roles: ["工作节点"],
    arch: "amd64",
    labels: []
}

const Hosts = () => {
    const [form] = Form.useForm();
    const dispatch = useDispatch();

    const configuration = useSelector(selectConfiguration);
    const step = useSelector(selectStep);

    const [visible, setVisible] = useState(false);
    const [isDisabled, setIsDisabled] = useState(false);

    const checkHostName = (_, value) => {
        let duplicateHostName = false

        configuration.spec.hosts.map((oldHost) => {
            if (oldHost.name === value)
            {
                duplicateHostName = true
            }
            return duplicateHostName
        })
        if (duplicateHostName) {
            return Promise.reject('主机名已存在')
        }
        return Promise.resolve()
    };

    const toLabelsList = (host) => {
        let labels = []

        Object.keys(host.labels).forEach((key) => {
            labels.push(key+"="+host.labels[key])
        })
        labels.push("arch="+host.arch)
        return labels
    }

    const toFormLabelsList = (host) => {
        let labels = []

        Object.keys(host.labels).forEach((key) => {
            let label = {
                key: key,
                value: host.labels[key]
            }
            labels.push(label)
        })
        return labels
    }

    const  handleEdit = (key) => {
        let currentHost = configuration.spec.hosts.filter((item) => item.name === key)[0]
        let roles = []
        if (configuration.spec.roleGroups.controlPlane.includes(key))
        {
            roles.push("控制平面节点")
        }
        if (configuration.spec.roleGroups.worker.includes(key))
        {
            roles.push("工作节点")
        }


        const currentSSHAuthModel = currentHost.password === "" || currentHost.password === undefined ? "key":"password"
        console.log(currentHost.labels)
        console.log(toLabelsList(currentHost))
        const values = {
            name: currentHost.name,
            address: currentHost.address,
            internalAddress: currentHost.internalAddress,
            ssh: currentSSHAuthModel,
            key: currentHost.privateKey,
            password: currentHost.password,
            port: currentHost.port,
            user: currentHost.user,
            roles: roles,
            arch: currentHost.arch,
            labels: toFormLabelsList(currentHost)
        }

        setsshAuthModel(currentSSHAuthModel)

        form.setFieldsValue(values)
        setIsDisabled(true)
        setVisible(true)
    };

    const handleDelete = (key) => {
        let newHosts = configuration.spec.hosts.filter((item) => item.name !== key)

        let controlPlane = configuration.spec.roleGroups.controlPlane.filter((item) => item !== key)
        let etcd = configuration.spec.roleGroups.etcd.filter((item) => item !== key)
        let worker = configuration.spec.roleGroups.worker.filter((item) => item !== key)


        dispatch(updateHosts({
            hosts: newHosts,
            roleGroups: {
                controlPlane: controlPlane,
                etcd: etcd,
                worker: worker,
            }
        }))
    }

    const columns = [
        {
            title: '主机名',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <div>{text}</div>,
        },
        {
            title: 'IP 地址',
            dataIndex: 'address',
            key: 'address',
        },
        {
            title: 'SSH 地址',
            dataIndex: 'internalAddress',
            key: 'internalAddress',
        },
        {
            title: '角色',
            key: 'roles',
            dataIndex: 'roles',
            render: (_, { roles }) => (
                <>
                    {roles.map((role) => {
                        let color = 'green';
                        let name = ""
                        switch (role)
                        {
                            case 'controlPlane':
                                color = '#00a871'
                                name = '控制平面节点'
                                break
                            case 'worker':
                                name = '工作节点'
                                break
                            default:
                                name = '工作节点'
                        }

                        return (
                            <Tag color={color} key={role}>
                                {name}
                            </Tag>
                        );
                    })}
                </>
            ),
        },
        {
            title: '标签',
            key: 'labels',
            dataIndex: 'labels',
            render: (_, { labels }) => (
                <>
                    {labels.map((label) => {
                        let color = 'geekblue';

                        return (
                            <Tag color={color} key={label}>
                                {label}
                            </Tag>
                        );
                    })}
                </>
            ),
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Typography.Link onClick={() => handleEdit(record.key)}>
                        编辑
                    </Typography.Link>
                    <Popconfirm title="确定删除该主机?" onConfirm={() => handleDelete(record.key)} okText="是" cancelText="否">
                        <a href=" ">删除</a>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const getRoles = (roleGroups, hostName) => {
        let roles = []
        if (roleGroups.controlPlane.includes(hostName))
        {
            roles.push('controlPlane')
        }
        if (roleGroups.worker.includes(hostName))
        {
            roles.push('worker')
        }
        return roles
    }

    const hosts = (configuration) => {
        let hostsList=[]
        configuration.spec.hosts.map((host) => {
            hostsList.push({
                key: host.name,
                name: host.name,
                address: host.address,
                internalAddress: host.internalAddress,
                port: host.port,
                user: host.user,
                password: host.password,
                privateKey: host.privateKey,
                arch: host.arch,
                labels: toLabelsList(host),
                roles: getRoles(configuration.spec.roleGroups, host.name)
            })
            return hostsList
        })
        return hostsList
    }

    const showModal = () => {
        setIsDisabled(false)
        setVisible(true);
    };

    const handleOk = () => {
        const host = form.getFieldsValue(true)
        let hosts = configuration.spec.hosts.filter((item) => (item.name !== host.name))
        const labelsMap = {}

        host.labels.map((label) => {
            labelsMap[label.key] = label.value
            return labelsMap
        })

        hosts.push({
            name: host.name,
            address: host.address,
            internalAddress: host.internalAddress,
            port: host.port,
            user: host.user,
            password: host.password,
            privateKey: host.key,
            arch: host.arch,
            labels: labelsMap,
        })

        let controlPlane = configuration.spec.roleGroups.controlPlane.filter((item) => (item !== host.name))
        let etcd = configuration.spec.roleGroups.etcd.filter((item) => (item !== host.name))
        let worker = configuration.spec.roleGroups.worker.filter((item) => (item !== host.name))
        if (host.roles.includes("控制平面节点"))
        {
            controlPlane = [...controlPlane, host.name]
            etcd = [...etcd, host.name]
        }
        if (host.roles.includes("工作节点"))
        {
            worker = [...worker, host.name]
        }

        dispatch(updateHosts({
            hosts: hosts,
            roleGroups: {
                controlPlane: controlPlane,
                etcd: etcd,
                worker: worker,
            }
        }))

        setVisible(false)

        form.resetFields()
    };

    const handleCancel = () => {
        setVisible(false)
        form.resetFields()
    };

    const [sshAuthModel, setsshAuthModel] = useState('password')
    const onSelectSSHAuthModel = (e) => {
        setsshAuthModel(e.target.value)
    }

    const  inputSSHAuth = (sshAuthModel) => {
        switch (sshAuthModel)
        {
            case "key":
                return (
                    <Form.Item name="key" label="密钥" rules={[{ required: true, message: '请输入主机 SSH 密钥!'}]}>
                        <TextArea rows={4}/>
                    </Form.Item>
                )
            default:
                return (
                    <Form.Item name="password" label="密码"  rules={[{ required: true, message: '请输入主机 SSH 密码!'}]}>
                        <Input.Password />
                    </Form.Item>
                )
        }

    }

    const handleLastStep = () => {
        dispatch(lastStep())
    }

    const plainOptions = ['控制平面节点', '工作节点'];

    return step === 1 ? (
            <Card
                title="主机设置"
                style={{ marginTop: 16 }}
                type="inner"
            >
                <Button type={ "primary" } onClick={ showModal }>添加节点</Button>
                <Modal
                    visible={visible}
                    title="主机信息"
                    onOk={handleOk}
                    onCancel={handleCancel}
                    footer=""
                >
                    <Form
                        {...formItemLayout}
                        layout="horizontal"
                        form={form}
                        initialValues={ initValues }
                        onFinish={ handleOk }
                    >
                        <Form.Item
                            name="name"
                            label="主机名"
                            rules={[
                                {validator: checkHostName},
                                {required: true, message: '请输入主机名!'},
                                {pattern: /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/, message: '主机名只允许包含小写字母、数字、 "-" 、".", 并且开头与结尾必须是小写字母或数字'},
                            ]}
                        >
                            <Input disabled={isDisabled}/>
                        </Form.Item>
                        <Form.Item label="cpu 架构" name="arch">
                            <Radio.Group>
                                <Radio.Button value="amd64">amd64</Radio.Button>
                                <Radio.Button value="arm64">arm64</Radio.Button>
                            </Radio.Group>
                        </Form.Item>
                        <Form.Item
                            name="internalAddress"
                            label="IP 地址"
                            validateTrigger={ 'onBlur' }
                            rules={[
                                { required: true, message: '请输入主机 IP 地址!'},
                                { pattern: /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/, message: '请输入正确的 ip 地址' }
                            ]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="roles" label="角色">
                            <Checkbox.Group options={plainOptions} />
                        </Form.Item>
                        <Form.Item
                            name="address"
                            label="SSH 地址"
                            rules={[
                                { required: true, message: '请输入主机 SSH 地址!'},
                                { pattern: /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/, message: '请输入正确的 ip 地址' }
                            ]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="port" label="SSH 端口">
                            <Input />
                        </Form.Item>
                        <Form.Item name="user" label="用户名">
                            <Input />
                        </Form.Item>
                        <Form.Item label="SSH 认证" name="ssh">
                            <Radio.Group onChange={onSelectSSHAuthModel} value={sshAuthModel} >
                                <Radio.Button value="password">密码</Radio.Button>
                                <Radio.Button value="key">密钥</Radio.Button>
                            </Radio.Group>
                        </Form.Item>
                        { inputSSHAuth(sshAuthModel) }
                        <Form.List name="labels">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...restField }, index) => (
                                            <Form.Item
                                                key={key}
                                                label={index===0? "标签":""}
                                                style={{
                                                    marginBottom: 0,
                                                }}
                                                {... index===0? formItemLayout: formItemLayoutWithOutLabel}
                                            >
                                                <Form.Item
                                                    name={[name, 'key']}
                                                    rules={[
                                                        {
                                                            required: true,
                                                            message: "请输入 key 值"
                                                        },
                                                    ]}
                                                    style={{
                                                        display: 'inline-block',
                                                        width: '45%',
                                                    }}
                                                >
                                                    <Input placeholder="key" />
                                                </Form.Item>
                                                <Form.Item
                                                    name={[name, 'value']}
                                                    rules={[
                                                        {
                                                            required: true,
                                                            message: "请输入 value 值"
                                                        },
                                                    ]}
                                                    style={{
                                                        display: 'inline-block',
                                                        width: '45%',
                                                        marginRight: "8px",
                                                    }}
                                                >
                                                    <Input placeholder="value" />
                                                </Form.Item>
                                                <MinusCircleOutlined onClick={() => remove(name)} />
                                            </Form.Item>
                                    ))}
                                    <Form.Item
                                        wrapperCol={{ offset: 4 , span: 6 }}
                                    >
                                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                            添加标签
                                        </Button>
                                    </Form.Item>
                                </>
                            )}
                        </Form.List>
                        <Form.Item {...tailLayout}>
                            <Button type="primary" htmlType="submit" style={{ marginRight: "6px" }}>
                                确定
                            </Button>
                            <Button htmlType="button" onClick={handleCancel} style={{ marginLeft: "6px" }}>
                                取消
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
                <Table className="hosts-list" columns={columns} dataSource={hosts(configuration)} />
                <div style={{ float: "left" }} >
                    <Button
                        htmlType="button"
                        style={{
                            margin: '0 8px',
                        }}
                        onClick={ handleLastStep }
                    >
                        上一步
                    </Button>
                    <Button type={ "primary" } onClick={() => dispatch(nextStep())}>下一步</Button>
                </div>
            </Card>

    ) : (
        <noscript></noscript>
    );
};

export default Hosts;
