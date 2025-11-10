FROM node:lts-trixie as dev

WORKDIR /app

# Update everything on the OS
RUN apt-get -y update && apt-get -y --no-install-recommends install autoconf build-essential && apt-get clean
RUN npm install -g npm@latest

# Install Packages
COPY ./package.json ./
RUN if [ "$NODE_ENV" = "production" ]; then npm install --omit=dev; else npm install; fi;

# Copy ts-config
COPY ./tsconfig.json ./

# Copy source code
COPY ./src /app/src

FROM dev as prod

# Convert ts files to js
RUN npm run build

CMD ["tail", "-f", "/dev/null"]
