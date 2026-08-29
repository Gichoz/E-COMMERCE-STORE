FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend source code
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]