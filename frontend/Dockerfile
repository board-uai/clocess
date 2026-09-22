ARG NODE_VERSION=22
FROM node:${NODE_VERSION}-alpine
WORKDIR /frontend
COPY package.json package-lock.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]
