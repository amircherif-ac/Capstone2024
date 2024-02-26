# Study Hero
Capstone project for COEN/ELEC 490 🎉

# How to install node.js

To run most of the required services for this web app, you will need to install node.js on your machine.
Simply follow the instructions on https://nodejs.org/en/ for your platform.

## Running a dev environment version of the application

To run the entire application locally, make sure to have docker installed

For windows: https://docs.docker.com/desktop/install/windows-install/
For Ubuntu (Linux): https://docs.docker.com/engine/install/ubuntu/
For MacOS: https://docs.docker.com/desktop/install/mac-install/

finally, run the following command from the base of the repository
```
docker compose up -d --build
```

You can now access the front-end at http://localhost on your machine

### Accessing the mySQL database running in the docker environment

To access the database container from your host machine:

1) Connect directly via the CLI tool:
```
mysql -h localhost --port=3306 -u root -proot --protocol=tcp
```

2) Connect directly via the CLI inside the database container

```
docker compose exec db bash
```

Once you see the bash prompt:
```
mysql -u root -proot
```

### How to develop the front-end

1. Spin up the docker dev environment: (can take a few minutes)
```
docker compose up -d --build
```

2. In a seperate terminal, spin up a local instance of the websocket server
```
cd websocket-server/
npm run clean
npm i
npm start
```

3. In a seperate terminal, spin up a local instance of the back-end api
```
cd back-end
npm i
npm run server
```

3. In a seperate terminal,  Spin up the front-end dev instance
```
cd front-end
yarn clean
yarn install
yarn dev
```

3. You're ready to go, you can go to localhost:3000 to see the front-end.
