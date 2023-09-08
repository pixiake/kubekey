import request from './request'

export function LoginApi(token, csrToken) {
    return request({
        url: 'login',
        data:  JSON.stringify(token),
        method: 'post',
        headers: {
            'X-CSRF-TOKEN': csrToken,
            'Content-Type': 'application/json'
        }
    })
}

export function GetLoginCsrTokenApi() {
    return request({
        url: 'csrftoken/login',
        method: 'get',
    })
}

export function GetClustersApi() {
    return request({
        url: 'cluster',
        method: 'get',
        header: {
            'jweToken': localStorage.getItem('jweToken')
        }
    })
}

export function GetDeployCsrTokenApi() {
    return request({
        url: 'csrftoken/deploy',
        ethod: 'get',
        header: {
            'jweToken': localStorage.getItem('jweToken')
        }
    })
}

// create cluster configuration file
export function CreateClusterApi(cluster) {
    return request({
        url: 'clusters',
        data:  JSON.stringify({
            'content': JSON.stringify(cluster).toString(),
            'name': cluster.metadata.name,
            'namespace': cluster.metadata.namespace,
            'validate': true
        }),
        method: 'post',
        headers: {
            // 'jweToken': localStorage.getItem('jweToken'),
            // 'X-CSRF-TOKEN': csrToken,
            "Content-Type": "application/json"
        }
    })
}

export function DeleteClusterApi(namespace, name) {
    return request({
        url: '_raw/cluster/namespace/'+ namespace + '/name/' + name,
        method: 'delete',
        header: {
            'jweToken': localStorage.getItem('jweToken')
        }
    })
}

export function GetClusterAPI(namespace, name) {
    return request({
        url: '_raw/cluster/namespace/'+ namespace + '/name/' + name,
        method: 'get',
        header: {
            'jweToken': localStorage.getItem('jweToken')
        }
    })
}

export function GetPodLogsApi(namespace, name, container) {
    return request({
        url: 'log/' + namespace + '/' + name + '/' + container + '?logFilePosition=end&referenceTimestamp=newest&referenceLineNum=0&offsetFrom=2000000000&offsetTo=2000000100&previous=false',
        method: 'get',
        header: {
            'jweToken': localStorage.getItem('jweToken')
        }
    })
}
