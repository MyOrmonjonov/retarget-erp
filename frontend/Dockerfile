# Frontend (Vite + React) production image, served as static files via nginx.
# VITE_* values are baked in at build time, so pass them as build args:
#   docker build --build-arg VITE_API_URL=https://api.example.com/api \
#                --build-arg VITE_WS_URL=wss://api.example.com/ws \
#                -t retarget-erp-frontend .

FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL=/api
ARG VITE_WS_URL=/ws
ARG VITE_USE_REAL_API=true
ARG VITE_APP_NAME="Retarget ERP"
ENV VITE_API_URL=$VITE_API_URL \
    VITE_WS_URL=$VITE_WS_URL \
    VITE_USE_REAL_API=$VITE_USE_REAL_API \
    VITE_APP_NAME=$VITE_APP_NAME

RUN npm run build:telegram

FROM nginx:1.27-alpine
COPY --from=build /app/dist-telegram /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
