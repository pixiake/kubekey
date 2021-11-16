#! /bin/bash

GIT_COMMIT=$(git rev-parse HEAD)
GIT_SHA=$(git rev-parse --short HEAD)
GIT_TAG=$(git describe --tags --abbrev=0 --exact-match 2>/dev/null )
GIT_DIRTY=$(test -n "`git status --porcelain`" && echo "dirty" || echo "clean")



VERSION_METADATA=unreleased
VERSION=latest
# Clear the "unreleased" string in BuildMetadata
if [[ -n $GIT_TAG ]]
then
  VERSION_METADATA=
  VERSION=${GIT_TAG}
fi

LDFLAGS="-X github.com/kubesphere/kubekey/version.version=${VERSION}
         -X github.com/kubesphere/kubekey/version.metadata=${VERSION_METADATA}
         -X github.com/kubesphere/kubekey/version.gitCommit=${GIT_COMMIT}
         -X github.com/kubesphere/kubekey/version.gitTreeState=${GIT_DIRTY}"

if [ -n "$1" ]; then 
    if [ "$1" == "-p" ] || [ "$1" == "--proxy" ]; then
        # Using the most trusted Go module proxy in China
        GO111MODULE=on GOPROXY=https://goproxy.cn CGO_LDFLAGS="-Wl,-z,relro,-z,now,-z,noexecstack" CGO_ENABLED=1 go build -ldflags "$LDFLAGS -s -w -linkmode=external" -trimpath -buildmode=pie -o output/kk ./cmd/kk/main.go
    else
        echo "The option should be '-p' or '--proxy'"
    fi
else
    GO111MODULE=on CGO_LDFLAGS="-Wl,-z,relro,-z,now,-z,noexecstack" CGO_ENABLED=1 go build -ldflags "$LDFLAGS -s -w -linkmode=external" -trimpath -buildmode=pie -o output/kk ./cmd/kk/main.go
fi
