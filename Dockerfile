# Use official Nginx image
FROM nginx:alpine

# Remove default nginx index page
RUN rm -rf /usr/share/nginx/html/*

# Copy your static site files to nginx html directory
COPY . /usr/share/nginx/html
RUN cd /usr/share/nginx/html
RUN chmod 644 Kids-Talk-Pro-buttons.html homepage.html experts-talk-pro-homepage.html

# Expose port 8080 (Cloud Run expects this)
EXPOSE 8080

# Change Nginx config to listen on 8080
RUN sed -i 's/80;/8080;/' /etc/nginx/conf.d/default.conf
