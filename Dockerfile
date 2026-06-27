# Grab the original image from docker hub
FROM nginxinc/nginx-unprivileged:stable-alpine

# Take our local nginx conf and replace it in the image filesystem
COPY nginx.conf /etc/nginx/nginx.conf

# Copy all files from our local directory to the docker filesystem
# Repeat for all files/directories
COPY *.html /usr/share/nginx/html/
COPY css /usr/share/nginx/html/css
COPY js /usr/share/nginx/html/js
COPY json/templates /usr/share/nginx/html/templates
COPY favicon.ico /usr/share/nginx/html/
