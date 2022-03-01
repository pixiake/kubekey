package precheck

import (
	"bufio"
	"encoding/base64"
	"fmt"
	kubekeyapiv1alpha1 "github.com/kubesphere/kubekey/apis/kubekey/v1alpha1"
	"github.com/kubesphere/kubekey/pkg/util"
	"github.com/kubesphere/kubekey/pkg/util/manager"
	"github.com/lithammer/dedent"
	"github.com/mitchellh/mapstructure"
	"github.com/modood/table"
	"github.com/pkg/errors"
	"os"
	"strconv"
	"strings"
	"text/template"
)

// PrecheckResults defines the items to be checked.
type PrecheckResults struct {
	Name           string `table:"name"`
	Disk           string `table:"disk"`
	Devices        string `table:"devices"`
	Virtualization string `table:"virtualization"`
	Time           string `table:"time"`
}

var (
	kubeScriptDir = "/usr/local/bin/kube-scripts"
	// CheckResults is used to save save precheck results.
	CheckResults = make(map[string]interface{})
)

// PrecheckNodes is used to precheck nodes before installation.
func PrecheckNodes(mgr *manager.Manager, node *kubekeyapiv1alpha1.HostCfg) error {
	var results = make(map[string]interface{})
	results["name"] = node.Name

	// Check virtualization
	virtualResult, err := mgr.Runner.ExecuteCmd("grep -E '(svm|vmx)' /proc/cpuinfo", 0, false)
	if err != nil {
		results["virtualization"] = ""
	} else {
		if strings.Contains(virtualResult, "svm") || strings.Contains(virtualResult, "vmx") {
			results["virtualization"] = "y"
		} else {
			results["virtualization"] = ""
		}
	}

	// Check disk
	diskSizeResult, err := mgr.Runner.ExecuteCmd("df /var/lib | awk '{if (NR>1){print $4}}'", 0, false)
	if err != nil {
		results["disk"] = ""
	} else {
		i, err := strconv.ParseInt(diskSizeResult, 10, 64)
		if err != nil {
			results["disk"] = ""
		} else {
			if i > 80000000 {
				diskSizeResultFormat, err := mgr.Runner.ExecuteCmd("df -h /var/lib | awk '{if (NR>1){print $4}}'", 0, false)
				if err != nil {
					results["disk"] = "y"
				} else {
					results["disk"] = diskSizeResultFormat
				}
			} else {
				results["disk"] = "< 80G"
			}
		}
	}

	// Check devices
	tmpDir := "/tmp/kubekey"
	_, err = mgr.Runner.ExecuteCmd(fmt.Sprintf("sudo -E /bin/sh -c \"if [ -d %s ]; then rm -rf %s ;fi && mkdir -p %s\" && mkdir -p %s", tmpDir, tmpDir, kubeScriptDir, tmpDir), 1, false)
	if err != nil {
		return errors.Wrap(errors.WithStack(err), "Failed to create tmp dir")
	}

	devicesCheckScript, err2 := GenerateDevicesCheckScript()
	if err2 != nil {
		return err2
	}

	str := base64.StdEncoding.EncodeToString([]byte(devicesCheckScript))
	_, err3 := mgr.Runner.ExecuteCmd(fmt.Sprintf("echo %s | base64 -d > %s/devicesCheck.sh && chmod +x %s/devicesCheck.sh", str, tmpDir, tmpDir), 1, false)
	if err3 != nil {
		return errors.Wrap(errors.WithStack(err3), "Failed to generate devices precheck script")
	}

	devicesResult, err4 := mgr.Runner.ExecuteCmd(fmt.Sprintf("sudo cp %s/devicesCheck.sh %s && sudo %s/devicesCheck.sh", tmpDir, kubeScriptDir, kubeScriptDir), 1, false)
	if err4 != nil {
		results["devices"] = ""
	} else {
		devices := strings.Split(devicesResult, "\r\n")
		if len(devices) != 0 {
			results["devices"] = strings.Join(devices, ",")
		} else {
			results["devices"] = ""
		}
	}

	// Check server time
	output, err := mgr.Runner.ExecuteCmd("date +\"%Z %H:%M:%S\"", 0, false)
	if err != nil {
		results["time"] = ""
	} else {
		results["time"] = strings.TrimSpace(output)
	}

	//// Check server time
	//netInterface, err := mgr.Runner.ExecuteCmd(fmt.Sprintf("ip route | grep %s | awk '{if($1~/^[1-9]/)print $3}' | head -n 1", node.InternalAddress), 0, false)
	//if err != nil {
	//	results["interface"] = ""
	//} else {
	//	results["interface"] = strings.TrimSpace(netInterface)
	//}

	CheckResults[node.Name] = results
	return nil
}

// PrecheckConfirm is used to show precheck results and interact with user.
func PrecheckConfirm(mgr *manager.Manager) {

	var (
		results        []PrecheckResults
		stopFlag       bool
		emulationFlag  bool
		devicesNodeNum int
	)
	for node := range CheckResults {
		var result PrecheckResults
		_ = mapstructure.Decode(CheckResults[node], &result)
		results = append(results, result)
	}
	table.OutputA(results)
	reader := bufio.NewReader(os.Stdin)

	for _, host := range results {
		if host.Virtualization == "" {
			//fmt.Printf("%s: Virtualization is not supported. \n", host.Name)
			emulationFlag = true
		}
		if host.Disk == "" || host.Disk == "< 80G" {
			fmt.Printf("%s: System disk size is less than the minimum required value. \n", host.Name)
			stopFlag = true
		}
		if host.Devices != "" {
			devicesNodeNum = devicesNodeNum + 1
		}
	}

	fmt.Println("")

	if mgr.RookCeph {
		switch {
		case len(results) > 2 && devicesNodeNum < 3:
			fmt.Println("Please ensure that at least three nodes have available devices.")
			stopFlag = true
		case (len(results) == 2) && devicesNodeNum != 0:
			fmt.Println("The number of nodes is less than 3, Please Set the 'enableHA' of rook-ceph-cluster in the configuration file to false.")
			stopFlag = true
		case (len(results) == 2) && devicesNodeNum == 0:
			fmt.Println("The number of nodes is less than 3, Please mount an available device for nodes and Set the 'enableHA' of rook-ceph-cluster in the configuration file to false.")
			stopFlag = true
		case len(results) < 2 && devicesNodeNum == 0:
			fmt.Println("Please ensure that node have available devices.")
			stopFlag = true
		}
	}

	if stopFlag {
		os.Exit(1)
	}
	_ = os.Remove(".emulation.tmp")
	if emulationFlag {
		emulationTmpFile, _ := os.Create(".emulation.tmp")
		emulationTmpFile.Close()
		fmt.Println("Some nodes do not support virtualization. KSV will run in emulation mode. The emulation mode may occupy more resources and may affect performance.")
	}

	fmt.Println("")
	fmt.Println("")
Loop:
	for {
		fmt.Printf("Continue this installation? [yes/no]: ")
		input, err := reader.ReadString('\n')
		if err != nil {
			mgr.Logger.Fatal(err)
		}
		input = strings.TrimSpace(strings.ToLower(input))

		switch input {
		case "yes":
			break Loop
		case "no":
			os.Exit(1)
		default:
			continue
		}
	}
}

var DevicesCheckTempl = template.Must(template.New("devicesCheck").Parse(
	dedent.Dedent(`#!/usr/bin/env bash
FIVE_GB_IN_BYTES="5368709120"

for dev in $(lsblk --all --noheadings --list --output KNAME 2>/dev/null | grep -v "^rbd")
do
  dev_name="/dev/$dev"
  type=$(lsblk "$dev_name" --bytes --nodeps --pairs --paths --output SIZE,ROTA,RO,TYPE,PKNAME,NAME,KNAME 2>/dev/null | awk '{print $4}' | cut -d'=' -f2 | tr -d '"')
  size=$(lsblk "$dev_name" --bytes --nodeps --pairs --paths --output SIZE,ROTA,RO,TYPE,PKNAME,NAME,KNAME 2>/dev/null | awk '{print $1}' | cut -d'=' -f2 | tr -d '"')

  # exclude unsupported types
  type_match=$(echo "$type" | grep -E -c -i "disk|ssd|crypt|mpath|part|linear")
  [[ $type_match -ne 1 ]] && continue

  if [[ $type == "disk" ]]
  then
    # exclude parent disk
    children=$(lsblk --noheadings --pairs "$dev_name" 2>/dev/null | wc -l)
    [[ $children -ne 1 ]] && continue
  fi

  #[[ $type == "lvm" ]] && [[ "$dev" =~ "dm-" ]] && continue

  # exclude too small devices
  [[ $size -lt $FIVE_GB_IN_BYTES ]] && continue
  
  # exlude device with filesystem
  fs=$(udevadm info --query=property "$dev_name" 2>/dev/null | grep "ID_FS_TYPE" | cut -d'=' -f2)
  [[ ! -z $fs ]] && continue

  echo "$dev_name"
done
    `)))

func GenerateDevicesCheckScript() (string, error) {
	return util.Render(DevicesCheckTempl, util.Data{})
}
