FROM node:20.5.1 as express_build

WORKDIR /app

# Update everything on the OS
RUN apt-get -y update && apt-get -y --no-install-recommends install autoconf build-essential && apt-get clean

COPY ./src /app/src
COPY ./package.json /app/package.json
# Update npm
RUN npm install -g npm@latest && npm install

CMD ["npm", "start"]
