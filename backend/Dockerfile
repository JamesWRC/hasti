# Builder stage
FROM node:20.5.0-alpine AS builder

ENV NODE_ENV=production
ENV PORT=3000

# Use /app as the CWD
WORKDIR /app            

# Copy package.json and yarn.lock to /app
COPY ./codebase/package.json ./codebase/yarn.lock ./   

# Install all dependencies
RUN yarn install --production --prefer-offline

# Copy the rest of the code
COPY ./codebase/ .                

# Invoke the build script to transpile ts code to js
RUN npm run build    

# Final stage
FROM node:20.5.0-alpine AS final

# Update the system
RUN apk --no-cache -U upgrade

# Prepare destination directory and ensure user node owns it
RUN mkdir -p /home/node/app/dist && chown -R node:node /home/node/app

# Set CWD
WORKDIR /home/node/app

# Install PM2
RUN npm i -g pm2

# Copy package.json, yarn.lock and process.yml
COPY --from=builder /app/package.json ./   
COPY --from=builder /app/yarn.lock ./
COPY --from=builder /app/node_modules/ ./node_modules/
COPY ./codebase/process.yml ./codebase/app/clients/prisma/schema.prisma ./   

# Copy js files and change ownership to user node
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/.next ./.next

# Open desired port
EXPOSE ${PORT}

# Generate prisma client
RUN yarn prisma generate --schema=./schema.prisma

# Switch to user node
USER node

# Use PM2 to run the application as stated in config file
ENTRYPOINT ["pm2-runtime", "./process.yml"]