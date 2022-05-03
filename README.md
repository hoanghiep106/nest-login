# NestJS Login

A NestJS application with a login endpoint and rate limiter for failed attempts

### Docker setup (Recommended)

#### Prerequisite

1. [Docker](https://www.docker.com/products/docker-desktop)

#### Instruction

1. Create an .env file based on .env.example

2. Change the `MONGO_URI` env to connect to Mongo service in Docker

```
MONGO_URI=mongodb://mongodb/nest-login
```

3. Spin up the container

```
yarn docker:up
```

4. Stop the container

```
yarn docker:down
```

### Manual setup

#### Prerequisite

1. [NodeJS v14](https://nodejs.org/en/download/)
2. [Yarn](https://classic.yarnpkg.com/lang/en/docs/install)
3. [MongoDB](https://www.mongodb.com/try/download/community)

#### Instruction

1. Install dependencies:

```
yarn
```

2. Create an .env file based on .env.example

3. Change the `MONGO_URI` env to connect to your local Mongo server

```
MONGO_URI=mongodb://localhost:27017
```

4. Start the server locally (listening on 3000)

```
yarn start
```

### Test the app

1. Install API testing tool [Postman](https://www.postman.com/downloads/)

2. Import `NestLogin.postman_collection.json` in Postman. [Instruction can be found here](https://learning.postman.com/docs/getting-started/importing-and-exporting-data/)

3. Create a test user using command

```
yarn execute create-user 'YOUR_USER_NAME' 'YOUR_PASSWORD'
```

4. Login using POST /login.

```
{
    "username": "YOUR_USER_NAME",
    "password": "YOUR_PASSWORD"
}
```

Response should look like

```
{
    "accessToken": "...."
}
```

### Unit tests

1. Run the tests

```
yarn test
```

2. Export coverage report

```
yarn test:cov
```

### Integration tests

#### Single command

```
yarn test-e2e
```

#### Step breakdown

1. Spin up test environment

```
yarn test-e2e:up
```

2. Run the tests

```
yarn test-e2e:run
```

3. Shut down the test environment

```
yarn test-e2e:down
```
