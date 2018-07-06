(function () {
    const path    = require('path');
    const fs      = require('fs');
    const rootDir = path.resolve('./');
    const confDir = path.resolve(rootDir, 'consul.json');
    if (!fs.existsSync(confDir)) {
        return console.log('consul.json does not exists in:', confDir);
    }
    const conf = require(confDir);
    const consul = require('consul')({
        host: conf.serverHost || 'localhost',
        port: conf.serverPort || 8500,
        secure: conf.secure || false
    });
    consul.agent.service.register({
        name: conf.name,
        address: conf.host,
        port: conf.port
    }, function(err){
        if(err){
            return console.log(err);
        }
        return console.log("ok");
    });
    function exit(signal) {
        consul.agent.service.deregister({
            id: conf.name
        }, function(err) {
            if(err) {
                return console.log(err);
            }
            return setTimeout(function() {
                process.exit(signal);
            }, 500);
        });
    }
    
    process.on('exit', function () {
        console.log('process.on(exit) !!!!!!!!')
    });

    process.on('SIGTERM', function() {
        console.log('SIGTERM')
        exit(-1);
    });

    process.on('SIGINT', function () {
        console.log('Ctrl-C...');
        exit(2);
    });

    process.on('uncaughtException', function(e) {
        console.log('Uncaught Exception...');
        console.log(e.stack);
        exit(99);
    });
})();