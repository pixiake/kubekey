import axios from 'axios'
import {message} from 'antd'
// create axios instance

const service = axios.create({
    baseURL: window.location.origin + '/api/v1',
    timout: 3000,
})

service.interceptors.request.use(
    (config) => {
        const { url } = config;
        if (!url.startsWith('/login')) {
            config.headers.jweToken = localStorage.getItem('jweToken');
        }
        return config
    },
    (err) => {
        console.log(err)
    }
)

service.interceptors.response.use(
    response => {
        let res = {}
        res.status = response.status
        res.data = response.data
        return res
    },
    err => {
        const code = err.response.status
        // if ((code === 400 || 401 || 402 || 403 || 500) || (localStorage.getItem('jweToken') === '')) {
        //     localStorage.clear()
        //     window.location.href='/login'
        // } else {
        //     message.error('认证失败，请重新登录' + err)
        // }
        return Promise.reject(err)
    }
)

export default service
