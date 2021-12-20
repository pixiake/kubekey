package preuninstall

import (
	kubekeyapiv1alpha1 "github.com/kubesphere/kubekey/apis/kubekey/v1alpha1"
	"github.com/kubesphere/kubekey/pkg/util/manager"
	"os"
	"strings"
	"time"
)

func Preuninstall(mgr *manager.Manager) error {

	if err := mgr.RunTaskOnMasterNodes(PreUninstall, true); err != nil {
		return err
	}

	return nil
}

func PreUninstall(mgr *manager.Manager, _ *kubekeyapiv1alpha1.HostCfg) error {
	if mgr.Runner.Index == 0 {
		cephCluster, err := mgr.Runner.ExecuteCmd("sudo -E /bin/sh -c \"/usr/local/bin/kubectl get cephcluster -n rook-ceph rook-ceph\"", 3, false)
		if err != nil {
			os.Exit(0)
		}
		mgr.Logger.Infoln("Start remove the rook-ceph and clean up the devices ...")
		if strings.Contains(cephCluster, "rook-ceph") {
			_, _ = mgr.Runner.ExecuteCmd("sudo -E /bin/sh -c \"/usr/local/bin/kubectl patch -n rook-ceph cephcluster rook-ceph --type merge -p '{\\\"spec\\\": {\\\"cleanupPolicy\\\": {\\\"confirmation\\\": \\\"yes-really-destroy-data\\\",\\\"allowUninstallWithVolumes\\\": true}}}'\"", 3, false)
			time.Sleep(10 * time.Second)
			go func() {
				_, _ = mgr.Runner.ExecuteCmd("sudo -E /bin/sh -c \"/usr/local/bin/kubectl delete cephcluster -n rook-ceph rook-ceph\"", 3, false)
			}()

			time.Sleep(10 * time.Second)
			_, _ = mgr.Runner.ExecuteCmd("sudo -E /bin/sh -c \"/usr/local/bin/kubectl delete -n rook-ceph cephblockpool replicapool\"", 3, false)
		}

		mgr.Logger.Infoln("Wait for all osd to be deleted ...")
		for i := 0; i <= 10; i++ {
			cephCluster, err := mgr.Runner.ExecuteCmd("sudo -E /bin/sh -c \"/usr/local/bin/kubectl get deploy -n rook-ceph | grep osd | wc -l\"", 3, false)
			if cephCluster == "0" {
				break
			}
			if i == 10 && err != nil {
				os.Exit(1)
			}
			time.Sleep(5 * time.Second)
		}

		mgr.Logger.Infoln("Wait for all devices to be cleaned up ...")
		for i := 0; i <= 10; i++ {
			cephCluster, err := mgr.Runner.ExecuteCmd("sudo -E /bin/sh -c \"kubectl get job -n rook-ceph | grep cluster-cleanup | grep '0/1' | wc -l\"", 3, false)
			if cephCluster == "0" {
				break
			}
			if i == 10 && err != nil {
				os.Exit(1)
			}
			time.Sleep(5 * time.Second)
		}
	}
	return nil
}
