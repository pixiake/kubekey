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
        url: 'csrftoken/appdeploymentfromfile',
        ethod: 'get',
        header: {
            'jweToken': localStorage.getItem('jweToken')
        }
    })
}

// create cluster configuration file
export function CreateClusterApi(cluster, csrToken) {
    return request({
        url: 'appdeploymentfromfile',
        data:  JSON.stringify({
            'content': JSON.stringify(cluster).toString(),
            'name': cluster.metadata.name,
            'namespace': cluster.metadata.namespace,
            'validate': true
        }),
        method: 'post',
        headers: {
            'jweToken': localStorage.getItem('jweToken'),
            'X-CSRF-TOKEN': csrToken,
            "Content-Type": "application/json"
        }
    })
}

export function DeleteClusterApi(namespace, name) {
    console.log(name, namespace)
    return request({
        url: '_raw/cluster/namespace/'+ namespace + '/name/' + name,
        method: 'delete',
        header: {
            'jweToken': localStorage.getItem('jweToken')
        }
    })
}


// // get sessionID
// export function sessionID(pod) {
//     return request({
//         url: 'pod/' + pod.namespace + '/' + pod.name + '/' + 'shell/' + pod.container,
//         method: 'get',
//     })
// }
//
// export function createCluster(cluster) {
//     return request({
//         url: 'cluster/' + cluster.metadata.namespace + '/' + cluster.metadata.name,
//         data: JSON.stringify(cluster),
//         method: 'post',
//     })
// }
//
// export function deletCluster(cluster) {
//     return request({
//         url: 'cluster/' + cluster.metadata.namespace + '/' + cluster.metadata.name + '/delete',
//         method: 'get',
//     })
// }
//
// export function getNamespaces() {
//     return request({
//         url: 'namespaces',
//         method: 'get',
//     })
// }
//
// export function getKubeConfig(cluster) {
//     return request({
//         url: 'cluster/' + cluster.metadata.namespace + '/' + cluster.metadata.name + '/kubeconfig',
//         method: 'get',
//     })
// }
//
// export function getClusterService(cluster, params) {
//     return request({
//         url: 'cluster/' + cluster.metadata.namespace + '/' + cluster.metadata.name + '/services',
//         method: 'get',
//         params: params,
//     })
// }
//
// export function getDolphinService() {
//     return request({
//         url: '/dolphinservices',
//         method: 'get',
//     })
// }
//
// export function forwardService(cluster, ds) {
//     return request({
//         url: 'cluster/' + cluster.metadata.namespace + '/' + cluster.metadata.name + '/dolphinservices',
//         data: JSON.stringify(ds),
//         method: 'post',
//     })
// }
