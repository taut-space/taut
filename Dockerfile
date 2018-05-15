FROM node:10

RUN mkdir -p /var/app/current
WORKDIR /var/app/current
COPY . ./
RUN rm -rf ./node_modules
RUN npm install
RUN npm install -g nodemon tap


EXPOSE 8557

