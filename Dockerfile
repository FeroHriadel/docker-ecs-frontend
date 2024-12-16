# Stage 1: Build the application
FROM node:20 AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

# nextjs needs .env's at buildtime to build static assets (!). That's why:
ARG NEXT_PUBLIC_API_ENDPOINT
ENV NEXT_PUBLIC_API_ENDPOINT=${NEXT_PUBLIC_API_ENDPOINT}

RUN npm run build

# Stage 2: Serve the application => files from Stage 1 will not be included in the final container
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 3000

CMD ["npm", "run", "start"]

# to test dockerization on ur local machine:
# run the backend+db container on your local machine (port:80), then: 
# $ ipconfig   => get the: IPv4 Address. . . . . . . . . . . : 192.168.0.102 (don't use `docker.host.internal` it acts up)
# build image like: $ docker build -t nextjs-app:latest --build-arg NEXT_PUBLIC_API_ENDPOINT=http://192.168.0.102:80/api .
# run the image: $ docker run -d -p 3000:3000 nextjs-app:latest
