package precheck

import (
	"github.com/kubesphere/kubekey/pkg/util/manager"
	"os"
)

// Precheck is used to perform the precheck function.
func Precheck(mgr *manager.Manager) error {
	//Check that the number of Etcd is odd
	if len(mgr.EtcdNodes)%2 == 0 {
		mgr.Logger.Warnln("The number of etcd is even. Please configure it to be odd.")
		os.Exit(1)
	}

	if len(mgr.K8sNodes) == 2 {
		mgr.Logger.Warnln("For the purpose of system stability, installation in multi-node mode requires at least 3 server nodes.")
		os.Exit(1)
	}
	if err := mgr.RunTaskOnAllNodes(PrecheckNodes, true); err != nil {
		return err
	}
	PrecheckConfirm(mgr)

	return nil
}
