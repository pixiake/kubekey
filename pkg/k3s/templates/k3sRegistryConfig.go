/*
 Copyright 2021 The KubeSphere Authors.

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

package templates

import (
	"github.com/lithammer/dedent"
	"text/template"
)

var (
	// K3sService defines the template of kubelet service for systemd.
	K3sRegistryConfig = template.Must(template.New("registries.yaml").Parse(
		dedent.Dedent(`mirrors:
  "dockerhub.kubekey.local:5000":
    endpoint:
      - "https://dockerhub.kubekey.local:5000"
  "docker.io":
    endpoint:
      - "https://dockerhub.kubekey.local:5000"
configs:
  "dockerhub.kubekey.local:5000":
    tls:
      ca_file: "/etc/kubekey/registry/certs/ca.crt"
      insecure_skip_verify: true
    `)))
)
