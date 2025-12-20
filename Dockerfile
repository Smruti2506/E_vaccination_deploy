FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# Clean default nginx content
RUN rm -rf ./*

# Copy all static files
COPY . .

# Ensure index.html exists
RUN if [ -f home.html ]; then mv home.html index.html; fi

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
