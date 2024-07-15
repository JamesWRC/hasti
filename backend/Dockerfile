ARG PORT=3000

FROM node:20.5.0-alpine AS node

# Builder stage
FROM node:20.5.0-alpine AS builder

# Use /app as the CWD
WORKDIR /app            

# Copy package.json and package-lock.json to /app
COPY ./codebase/package.json ./codebase/yarn.lock ./codebase/process.yml ./   

# Install all dependencies
RUN yarn

# Copy the rest of the code
COPY ./codebase/ .                

# Invoke the build script to transpile ts code to js
RUN npm run build    

# Open desired port
EXPOSE ${PORT}

# Run development server
ENTRYPOINT [ "npm", "run", "dev" ]

# Final stage

FROM node:20.5.0-alpine AS final

# Set node environment to production
ENV NODE_ENV production

# Update the system
RUN apk --no-cache -U upgrade

# Prepare destination directory and ensure user node owns it
RUN mkdir -p /home/node/app/dist && chown -R node:node /home/node/app

# Set CWD
WORKDIR /home/node/app

# Install PM2
RUN npm i -g pm2

# Copy package.json, package-lock.json and process.yml
COPY ./codebase/package.json ./codebase/yarn.lock ./codebase/process.yml ./codebase/app/clients/prisma/schema.prisma ./   

# Switch to user node
USER node

# Install libraries as user node
# RUN npm i --only=production
RUN yarn install --production --prefer-offline

# Copy js files and change ownership to user node
COPY --chown=node:node --from=builder /app/dist ./dist

# Open desired port
EXPOSE ${PORT}

RUN ls -la && sleep 10

# Generate prisma client
RUN yarn prisma generate --schema=./schema.prisma

# Use PM2 to run the application as stated in config file
ENTRYPOINT ["pm2-runtime", "./process.yml"] 