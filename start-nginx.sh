#!/bin/sh
# Startup script for nginx that substitutes PORT environment variable

PORT=${PORT:-8080}

# Replace PORT placeholder in nginx config template
sed "s/\${PORT:-8080}/$PORT/g" /etc/nginx/http.d/default.conf.template > /etc/nginx/http.d/default.conf

# Start nginx
exec nginx -g 'daemon off;'





