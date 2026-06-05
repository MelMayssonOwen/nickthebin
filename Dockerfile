# Nick the Bin — static site + self-hosted GoAccess traffic dashboard.
FROM nginx:alpine

# GoAccess (log analytics) + htpasswd (for the stats basic-auth)
RUN apk add --no-cache goaccess apache2-utils

RUN rm -rf /usr/share/nginx/html/*
COPY index.html /usr/share/nginx/html/index.html
COPY src/ /usr/share/nginx/html/src/
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY entrypoint.sh /entrypoint.sh

# basic-auth for /stats — override by setting build arg STATS_PASS in Coolify
ARG STATS_USER=admin
ARG STATS_PASS=binstats2026
RUN chmod +x /entrypoint.sh \
 && mkdir -p /usr/share/nginx/html/stats \
 && htpasswd -bc /etc/nginx/.htpasswd "$STATS_USER" "$STATS_PASS"

EXPOSE 80 3000
CMD ["/entrypoint.sh"]
