FROM node:18-alpine

WORKDIR /usr/src/app

# Install build dependencies for bcrypt
RUN apk add --no-cache python3 make g++ bash dos2unix

# Install wait-for-it script
COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

COPY package*.json ./

# Install dependencies
RUN npm install

COPY . .

# Create uploads directory and set permissions
RUN mkdir -p uploads && chmod 777 uploads

# Fix line endings and make start script executable
RUN dos2unix start.sh && chmod +x start.sh

EXPOSE 3001

CMD ["/wait-for-it.sh", "db:3306", "--", "/usr/src/app/start.sh"] 