FROM node:18.17.0

# The -p flag ensures that the command creates parent directories if they don't exist.
RUN mkdir -p /app

WORKDIR /app