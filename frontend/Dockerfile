FROM node:18-alpine


RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY ./package*.json /app
RUN npm install

COPY . /app

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]