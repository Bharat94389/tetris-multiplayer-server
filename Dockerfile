FROM node:20.10.0 as express_build

ARG NODE_ENV=production

WORKDIR /app
# Update everything on the OS
RUN apt-get -y update && apt-get -y --no-install-recommends install autoconf build-essential && apt-get clean

COPY ./src /app/src
COPY ./package.json /app/package.json
# Update npm
RUN echo "$NODE_ENV"
RUN npm install -g npm@latest
RUN if [ "$NODE_ENV" = "production" ]; then npm install --omit=dev; else npm install; fi;

CMD ["tail", "-f", "/dev/null"]
