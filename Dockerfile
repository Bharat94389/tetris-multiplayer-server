FROM node:20.11.1-bookworm-slim as express_build

ARG NODE_ENV=production

WORKDIR /app
# Update everything on the OS
RUN apt-get -y update && apt-get -y --no-install-recommends install autoconf build-essential && apt-get clean
RUN npm install -g npm@latest

# Install Packages
COPY ./package.json /app/package.json
RUN if [ "$NODE_ENV" = "production" ]; then npm install --omit=dev; else npm install; fi;

# Copy source code
COPY ./src /app/src

CMD ["npm", "run", "dev"]
