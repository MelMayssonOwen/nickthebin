# Nick the Bin is a fully static, dependency-free site — just serve the folder.
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
