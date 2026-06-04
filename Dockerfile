# Nick the Bin is a fully static, dependency-free site.
FROM nginx:alpine
# clear nginx's default welcome page, then copy exactly the game files
RUN rm -rf /usr/share/nginx/html/*
COPY index.html /usr/share/nginx/html/index.html
COPY src/ /usr/share/nginx/html/src/
EXPOSE 80
