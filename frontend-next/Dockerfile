FROM node:20-alpine
WORKDIR /app

COPY package.json ./
COPY next.config.js ./
ARG NEXT_PUBLIC_API_BASE=http://127.0.0.1:5000/api
ENV NEXT_PUBLIC_API_BASE=${NEXT_PUBLIC_API_BASE}
RUN npm install

COPY . ./
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start"]
