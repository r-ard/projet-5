const App = require('./src/app');

if(process.argv.length < 3) {
    console.error("Error : You have to pass a config file");
    return;
}

let config = null;

try {
    config = require(`./${process.argv[2]}`);
    if(!config || typeof config !== 'object') {
        console.log(`Error: The config file has not a valid JSON format`);
        throw new Error();
    }
}
catch(err) {
    console.error(`Error : Can not access to the config file (${process.argv[2]})`);
    return;
}

const server = new App(config.port, config);
server.start(err => {
    if(err) {
        console.log(`An error occured while starting the server`);
        console.log(err);
        return;
    }
    console.log(`Listening on ${server.serverPort}...`);
});
