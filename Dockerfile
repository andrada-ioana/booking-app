FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
RUN npm install react-icons

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"] 