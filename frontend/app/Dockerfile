ARG NODE_VERSION=22
FROM node:${NODE_VERSION}-alpine
WORKDIR /frontend
COPY package.json package-lock.json ./
COPY shared/package.json ./shared/package.json
COPY app/package.json ./app/package.json
RUN npm install
COPY shared ./shared
COPY app ./app
WORKDIR /frontend/app
EXPOSE 5174
CMD ["npm", "run", "dev", "--", "--host"]
