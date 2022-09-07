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
	// k3sRegistryConfigTempl defines the template of k3s' registry.
	K3sRegistryConfigTempl = template.Must(template.New("registries.yaml").Parse(
		dedent.Dedent(`mirrors:
  "docker.io":
    endpoint:
      - "{{ if .PlainHTTP }}http{{ else }}https{{ end }}://{{ .Registry }}"
{{ if .NamespaceOverride }}
    rewrite:
      "^rancher/(.*)": "{{ .NamespaceOverride }}/$1"
{{ end }}
{{ if .Auths }}
    lalala
{{ end }}
    `)))
)

//configs:
//{{ range $key, $value := .Auths }}
//"{{ .key }}":
//{{ if or (.value.Username) ($value.Password) }}
//auth:
//{{ if .value.Username }}
//username: {{ .value.Username  }}
//{{ end }}
//{{ if .value.Password }}
//password: {{ .value.Password }}
//{{ end }}
//{{ end }}
//{{ if not .value.PlainHTTP }}
//tls:
//{{ if .value.CertFile }}
//cert_file: {{ .value.CertFile }}
//{{ end }}
//{{ if .value.KeyFile }}
//key_file: {{ .value.KeyFile }}
//{{ end }}
//{{ if .value.CAFile }}
//ca_file: {{ .value.KeyFile }}
//{{ end }}
//insecure_skip_verify: {{ .value.SkipTLSVerify }}
//{{ end }}
//{{ end }}
