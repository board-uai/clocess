ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /frontend
COPY package.json package-lock.json ./
COPY shared/package.json ./shared/package.json
COPY website/package.json ./website/package.json
RUN npm install
COPY shared ./shared
COPY website ./website

FROM deps AS dev
WORKDIR /frontend/website
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]

FROM deps AS build
WORKDIR /frontend/website
RUN npm run build

FROM nginx:alpine AS prod
COPY --from=build /frontend/website/dist /usr/share/nginx/html
COPY website/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
