FROM node:20

WORKDIR /app

COPY . .
RUN npm install \
    --prefer-offline \
    --frozen-lockfile \
    --non-interactive

ENV HOST 0.0.0.0
EXPOSE 3000

CMD [ "npm", "run", "dev" ]
