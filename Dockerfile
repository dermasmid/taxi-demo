FROM node
WORKDIR /taxi-demo

ENV APIKEY=yourkey
COPY . .
RUN npm install
EXPOSE 3000
EXPOSE 3002
CMD [ "npm", "start" ]
