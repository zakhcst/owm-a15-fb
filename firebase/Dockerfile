FROM node:10.23-slim

RUN ["mkdir", "firebase"]
RUN cd firebase
WORKDIR /firebase
COPY .firebaserc firebase.json run-shell ./
RUN sed 's/# alias/alias/g' < /root/.bashrc > /root/.bashrc
RUN ["node", "-v"]
RUN ["npm", "-v"]
RUN ["npm", "-s", "-g", "i", "firebase-tools@latest"]
RUN ["npm", "-g", "ls", "--depth", "0"]
