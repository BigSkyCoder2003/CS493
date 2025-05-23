# FROM node:16
# WORKDIR /usr/src/app
# COPY . .
# RUN npm install
# ENV PORT=8000
# EXPOSE ${PORT}
# CMD [ "npm", "start" ]
FROM node:16
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
ENV PORT=8000
EXPOSE ${PORT}
CMD [ "npm", "start" ]