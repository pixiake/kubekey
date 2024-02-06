/*
Copyright 2023 The KubeSphere Authors.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package manager

import (
	"context"

	"k8s.io/klog/v2"

	kubekeyv1 "github.com/kubesphere/kubekey/v4/pkg/apis/kubekey/v1"
	_const "github.com/kubesphere/kubekey/v4/pkg/const"
	"github.com/kubesphere/kubekey/v4/pkg/proxy"
)

// Manager shared dependencies such as Addr and , and provides them to Runnable.
type Manager interface {
	// Run the driver
	Run(ctx context.Context) error
}

type CommandManagerOptions struct {
	*kubekeyv1.Pipeline
	*kubekeyv1.Config
	*kubekeyv1.Inventory
}

func NewCommandManager(o CommandManagerOptions) (Manager, error) {
	client, err := proxy.NewLocalClient()
	if err != nil {
		klog.V(4).ErrorS(err, "Failed to create local client")
		return nil, err
	}
	return &commandManager{
		Pipeline:  o.Pipeline,
		Config:    o.Config,
		Inventory: o.Inventory,
		Client:    client,
		Scheme:    _const.Scheme,
	}, nil
}

type ControllerManagerOptions struct {
	ControllerGates         []string
	MaxConcurrentReconciles int
	LeaderElection          bool
}

func NewControllerManager(o ControllerManagerOptions) Manager {
	return &controllerManager{
		ControllerGates:         o.ControllerGates,
		MaxConcurrentReconciles: o.MaxConcurrentReconciles,
		LeaderElection:          o.LeaderElection,
	}
}
