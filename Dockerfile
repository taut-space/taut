FROM node:10

RUN apt-get update && apt-get install build-essential libssl-dev git -y
RUN git clone https://github.com/wg/wrk.git wrk
RUN cd wrk && make && cp wrk /usr/local/bin
RUN mkdir -p /var/app/current
WORKDIR /var/app/current
COPY . ./
RUN rm -rf ./node_modules
RUN npm install
RUN npm install -g nodemon tap

EXPOSE 7407

