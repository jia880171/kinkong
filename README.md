# kinkong

## Usage Guide

### 1. Create the Container
To set up the container, use the following command:

```docker-compose up```

### 2. Access the Container
Once the container is running, you can access it using the following command:

```docker exec -it kintone /bin/sh```

### 3. Install Libraries
Inside the container, install the necessary libraries with:
```npm install```

### 4. Intsall ts-node

```npm install -g ts-node```

### 5. Read the rule csv file for generating names

```ts-node RuleReader.ts```