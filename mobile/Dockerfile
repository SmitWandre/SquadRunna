FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with legacy peer deps
RUN npm install --legacy-peer-deps

# Copy app files
COPY . .

# Expose Expo dev server ports
EXPOSE 8081 19000 19001 19002

# Start Expo for web
CMD ["npx", "expo", "start", "--web"]
