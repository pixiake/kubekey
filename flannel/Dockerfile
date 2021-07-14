FROM quay.io/coreos/flannel:v0.14.0

FROM alpine:3.13
LABEL maintainer="Tom Denham <tom@tigera.io>"

ENV FLANNEL_ARCH=amd64

RUN apk add --no-cache iproute2 net-tools ca-certificates iptables strongswan && update-ca-certificates
RUN apk add wireguard-tools --no-cache --repository http://dl-cdn.alpinelinux.org/alpine/edge/community
COPY --from=0 /opt/bin/flanneld /opt/bin/flanneld
COPY --from=0 /opt/bin/mk-docker-opts.sh /opt/bin/
COPY ./iptables-wrapper-installer.sh /
RUN /iptables-wrapper-installer.sh

ENTRYPOINT ["/opt/bin/flanneld"]