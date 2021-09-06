FROM node:lts-alpine3.10

WORKDIR /app

COPY ["package.json","yarn.lock", "./"]

RUN yarn

COPY index.js ./

COPY sendNotify.js ./

COPY public ./public

EXPOSE 5678

CMD [ "node", "index.js" ]
