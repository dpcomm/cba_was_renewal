FROM node:20.18.0
WORKDIR /app
COPY package*.json ./
RUN npm i
RUN ln -snf /usr/share/zoneinfo/Asia/Seoul /etc/localtime
COPY . .
RUN npm run build
ENV SERVER_PORT=3000
ENV PORT=3000
EXPOSE 3000
CMD ["npm", "run", "start"]
