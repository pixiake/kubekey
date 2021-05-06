package cmd

import (
	"github.com/kubesphere/kubekey/pkg/cluster/delete"
	"github.com/kubesphere/kubekey/pkg/util"
	"github.com/spf13/cobra"
)

var deleteClusterCmd = &cobra.Command{
	Use:   "cluster",
	Short: "Delete a cluster",
	RunE: func(cmd *cobra.Command, args []string) error {
		logger := util.InitLogger(opt.Verbose)
		return delete.ResetCluster(opt.ClusterCfgFile, logger, opt.SkipCheck, opt.Verbose)
	},
}

func init() {
	deleteCmd.AddCommand(deleteClusterCmd)

	deleteClusterCmd.Flags().StringVarP(&opt.ClusterCfgFile, "filename", "f", "", "Path to a configuration file")
	deleteClusterCmd.Flags().BoolVarP(&opt.SkipCheck, "yes", "y", false, "Skip pre-check of the installation")
}
