FROM node:14-alpine AS development

ENV NODE_ENV development

# Add a work directory
WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

# Copy app files
COPY . .

# Build args for runtime config (Create React App bakes these at build time)
ARG REACT_APP_KC_URL=http://localhost:8080
ARG REACT_APP_BE_URL=http://localhost:8000
ARG REACT_APP_KC_CLIENT_ID=cerise-frontend
ARG REACT_APP_NAME="CERISE Frontend"
ENV REACT_APP_KC_URL=$REACT_APP_KC_URL REACT_APP_BE_URL=$REACT_APP_BE_URL REACT_APP_KC_CLIENT_ID=$REACT_APP_KC_CLIENT_ID REACT_APP_NAME=$REACT_APP_NAME

# Build for production.
RUN npm run build --production

# Install `serve` to run the application.
RUN npm install -g serve

# Expose port
EXPOSE 3000

# Start the app
CMD serve -s build

