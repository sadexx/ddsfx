#############################
# BUILD FOR LOCAL DEVELOPMENT
#############################
# Use Node.js LTS version
FROM node:22.21.1-alpine3.23 AS development

# Install Tini
RUN apk add --no-cache tini

# Set the working directory
WORKDIR /usr/src/app

# Copy only necessary files and directories
COPY package*.json ./
COPY tsconfig.json ./
COPY tsconfig.build.json ./
COPY nest-cli.json ./
COPY typeorm.config.ts ./
COPY custom-typings.d.ts ./
COPY src/ src/

# Set NODE_ENV environment variable
ENV NODE_ENV=development

# Install dependencies
RUN npm ci

# Use Tini to handle PID 1 and start the application
ENTRYPOINT ["/sbin/tini", "--"]

# Command to run the application
CMD ["npm", "run", "start:dev"]

######################
# BUILD FOR PRODUCTION
######################
# Use Node.js LTS version
FROM node:22.21.1-alpine3.23 AS production

# Install Tini
RUN apk add --no-cache tini

# Set the working directory
WORKDIR /usr/src/app

# Set proper ownership for the files and directories
RUN chown -R node:node /usr/src/app

# Switch to the node user
USER node

# Copy only necessary files and directories
COPY --chown=node:node package*.json ./
COPY --chown=node:node tsconfig.json ./
COPY --chown=node:node tsconfig.build.json ./
COPY --chown=node:node nest-cli.json ./
COPY --chown=node:node typeorm.config.ts ./
COPY --chown=node:node custom-typings.d.ts ./
COPY --chown=node:node src/ src/

# Install ALL dependencies first (including devDependencies for types)
RUN npm ci --include=dev

# Set NODE_ENV environment variable
ENV NODE_ENV=production

# Compile TypeScript
RUN npm run build

# Remove devDependencies
RUN npm prune --omit=dev

# Clean npm cache and clean up
RUN npm cache clean --force
RUN rm -rf src
RUN rm -rf tsconfig.json tsconfig.build.json nest-cli.json typeorm.config.ts custom-typings.d.ts

# Use Tini to handle PID 1 and start the application
ENTRYPOINT ["/sbin/tini", "--"]

CMD ["node", "dist/src/main"]
