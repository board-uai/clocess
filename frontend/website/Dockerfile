ARG NODE_VERSION=22
FROM node:${NODE_VERSION}-alpine
WORKDIR /frontend
COPY package.json package-lock.json ./
COPY shared/package.json ./shared/package.json
COPY website/package.json ./website/package.json
RUN npm install
COPY shared ./shared
COPY website ./website
WORKDIR /frontend/website
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]
