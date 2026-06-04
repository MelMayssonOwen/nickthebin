# Nick the Bin — fully static, dependency-free site.
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY index.html /usr/share/nginx/html/index.html
COPY src/ /usr/share/nginx/html/src/
# Listen on 80 AND 3000 so it works whatever port Coolify's proxy routes to.
RUN printf 'server {\n  listen 80 default_server;\n  listen 3000;\n  server_name _;\n  root /usr/share/nginx/html;\n  index index.html;\n  location / { try_files $uri $uri/ /index.html; }\n}\n' > /etc/nginx/conf.d/default.conf
EXPOSE 80 3000
