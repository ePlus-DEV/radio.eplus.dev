FROM node:22

WORKDIR /app

COPY . .
RUN npm ci

ENV HOST 0.0.0.0
EXPOSE 3000

CMD [ "npm", "run", "dev" ]
