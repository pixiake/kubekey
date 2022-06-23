import { createSlice } from "@reduxjs/toolkit";

const initialState = {
   cluster: {
     apiVersion: 'kubekey.kubesphere.io/v1alpha2',
     kind: "Cluster",
     metadata: {
         name: "",
         namespace: "kubekey-system",
         annotations: {
             "kubekey.kubesphere.io/is-current-cluster": true
         }
     },
     spec: {
       hosts: [],
       roleGroups: {
          controlPlane: [],
          etcd: [],
          worker: [],
       },
       controlPlaneEndpoint: {
          domain: "lb.kubesphere.local",
          address: "",
          port: 6443,
       },
       system:{},
       kubernetes: {
          type: "kubernetes",
          version: "v1.21.5",
          containerManager: "docker",
          autoRenewCerts: true,
          kata: {
             enabled: false
          },
          nodeFeatureDiscovery: {
             enabled: false
          },
          nodelocaldns: true,

       },
       network: {
          plugin: "calico",
          kubePodsCIDR: "10.233.64.0/18",
          kubeServiceCIDR: "10.233.0.0/18"
       },
       addons: [],
       etcd: {},
       registry: {
          type: "default",
          privateRegistry: "",
          namespaceOverride: "",
       },
     },
   },
   step: 0
};


export const configurationsSlice = createSlice({
   name: 'configurations',
   initialState,
   reducers: {
       updateBasic: (state, action) => {
           state.cluster.metadata = action.payload.metadata
           state.cluster.spec.registry = action.payload.registry
       },
      updateHosts: (state, action) => {
         state.cluster.spec.hosts = action.payload.hosts
         state.cluster.spec.roleGroups = action.payload.roleGroups

      },
      updateRegistry: (state, action) => {
         state.cluster.spec.registry = action.payload.registry
      },
      updateControlPlane: (state, action) => {
         state.cluster.spec.controlPlaneEndpoint = action.payload.controlPlaneEndpoint
      },
      updateCluster: (state, action) => {
         state.cluster.spec.kubernetes = action.payload.kubernetes
      },
      updateNetwork: (state, action) => {
         state.cluster.spec.network = action.payload.network
      },
      updateAddons: (state, action) => {
         state.cluster.spec.addons = action.payload.addons
      },
      nextStep: (state) => {
         state.step += 1
         console.log(state.step)
      },
      lastStep: (state) => {
         state.step -= 1
      },
      viewResult: (state) => {
           state.step = 6
       }
   },
})

export const {
    updateBasic,
    updateHosts,
    updateRegistry,
    updateControlPlane,
    updateCluster,
    updateNetwork,
    updateAddons,
    nextStep,
    lastStep,
    viewResult
} = configurationsSlice.actions

export const selectConfiguration = (state) => state.configurations.cluster
export const selectStep = (state) => state.configurations.step;

export default configurationsSlice.reducer
