FROM node:22-alpine
WORKDIR /app
COPY package.json .
RUN npm install --production
COPY . .
EXPOSE 3456
CMD ["node", "index.js"]
