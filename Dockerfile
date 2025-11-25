# ✅ 1. Lightweight Nginx image
FROM nginx:alpine

# ✅ 2. Nginx ka web root
WORKDIR /usr/share/nginx/html

# ✅ 3. Default Nginx files hata do
RUN rm -rf ./*

# ✅ 4. Tumhara pura project image me copy karo
COPY . .

# ✅ 5. Agar welcome.html hai to usko index.html bana do
RUN if [ -f welcome.html ]; then mv welcome.html index.html; fi

# ✅ 6. Container port
EXPOSE 80

# ✅ 7. Nginx ko foreground me chalao
CMD ["nginx", "-g", "daemon off;"]
