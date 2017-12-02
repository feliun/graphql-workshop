FROM mongo:3.2

MAINTAINER Felipe Polo Ruiz "felipe.polo@gmail.com"

ENV MONGO_INITDB_ROOT_USERNAME admin
ENV MONGO_INITDB_ROOT_PASSWORD password
# Create app directory
COPY setup.sh /docker-entrypoint-initdb.d/
COPY courses.json /courses.json
COPY students.json /students.json