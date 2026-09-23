ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /frontend
COPY package.json package-lock.json ./
COPY shared/package.json ./shared/package.json
COPY app/package.json ./app/package.json
RUN npm install
COPY shared ./shared
COPY app ./app

FROM deps AS dev
WORKDIR /frontend/app
EXPOSE 5174
CMD ["npm", "run", "dev", "--", "--host"]

FROM deps AS build
WORKDIR /frontend/app
RUN npm run build

FROM nginx:alpine AS prod
COPY --from=build /frontend/app/dist /usr/share/nginx/html/app
COPY app/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
