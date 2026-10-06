FROM node:24.15.0

WORKDIR /app

COPY . .
RUN npm ci

ENV HOST 0.0.0.0
EXPOSE 3000

CMD [ "npm", "run", "dev" ]
