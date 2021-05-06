package precheck

import (
	"errors"
	"github.com/kubesphere/kubekey/pkg/util/manager"
)

// Precheck is used to perform the precheck function.
func Precheck(mgr *manager.Manager) error {
	//Check that the number of Etcd is odd
	if len(mgr.EtcdNodes)%2 == 0 {
		mgr.Logger.Warnln("The number of etcd is even. Please configure it to be odd.")
		return errors.New("the number of etcd is even")
	}

	if err := mgr.RunTaskOnAllNodes(PrecheckNodes, true); err != nil {
		return err
	}
	PrecheckConfirm(mgr)

	return nil
}
