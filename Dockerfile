FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY . /usr/share/nginx/html
RUN find /usr/share/nginx/html -type d -exec chmod 755 {} +; \
    find /usr/share/nginx/html -type f -exec chmod 644 {} +;
EXPOSE 8080
RUN sed -i 's/80;/8080;/' /etc/nginx/conf.d/default.conf
