# Study Hero - Back-end

After doing a git fetch pull
make sure do `npm install`

## How to run the back-end server

make sure you are in studyHero/back-end by `cd studyHero\back-end` inside the terminal
Then you can run `npm run server`

## How to run the back-end and front-end concurrently

Again in the back-end directory run `npm run client-server`

## How to run sequelize-auto

To generate models automatically run
`node_modules\.bin\sequelize-auto sequelize-auto -o "./src/models" -d study_hero -h localhost -u root -p 3306 -x test -e mysql`
[For more info on the properties](https://www.npmjs.com/package/sequelize-auto)
