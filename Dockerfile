FROM node:12

RUN apt-get update

EXPOSE 3001 8082
COPY ["./package.json", "./package-lock.json", ".eslintrc.js", "tsconfig.build.json", "tsconfig.json", ".env.development", ".env.production", "/app/"]
WORKDIR /app
RUN npm i -g nest
RUN npm ci --quiet
COPY ./src /app/src

CMD npm run start
