/*
var express = require('express'),
    app     = express(),
    morgan  = require('morgan');
    
Object.assign=require('object-assign')

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'))
*/

var WebSocketServer = require('ws').Server;
var http = require('http');

//var ipaddr  = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
//var port      = process.env.OPENSHIFT_NODEJS_PORT || 3000
//var ipaddr = "127.0.0.1";
var ipaddr = "0.0.0.0";
var port = 8080;

CLIENTS = {};
CLIENTS_STATE = {};
CLIENTS_ID = 0;
var server = http.createServer();
var wss = new WebSocketServer({server:server})
console.log(wss);
wss.on('connection', function(ws) {
    console.log('/connection connected');
    ws.id = CLIENTS_ID;
    ws.name = "";
    CLIENTS[CLIENTS_ID] = ws;
    CLIENTS_STATE[CLIENTS_ID] = "check_name";
    CLIENTS[CLIENTS_ID].send("Please input your name:");
    CLIENTS_ID++;        
    ws.on('message', function(data, flags) {
        //if (flags.binary) { return; }
        //console.log('>>> ' + data);
        /*
        if (data == 'test') { console.log('test'); ws.send('got test'); }
        if (data == 'hello') { console.log('hello'); ws.send('WAZZZUP!'); }
        */
        //ws.send(data);

        /*
        wss.clients.forEach(function (client) {
            client.send(data);
        });
        */
       var message= "";
        if (CLIENTS_STATE[ws.id] == "check_name") {
            var isWrongName = false;
            message = "Please use other name. Input your name:";
            console.log(message);            
            for( key in CLIENTS ) {
                if( data == CLIENTS[key].name ) {
                    CLIENTS[ws.id].send(message);
                    isWrongName = true;
                    break;
                }
            }
            if(!isWrongName) {
                message = "Set name sucesseful. Start talking:";
                ws.name = data;
                CLIENTS[ws.id].send(message);
                CLIENTS_STATE[ws.id] = "into_room";         
            }
        }
        else if (CLIENTS_STATE[ws.id] == "into_room") {            
            console.log('CLIENTS_ID: ' + ws.id + ' in the room1');            
            for( key in CLIENTS ) {     
                CLIENTS[key].send(ws.name + " : " + data);                
            }
        }
    });
    ws.on('close', function() {
        delete CLIENTS[ws.id];
        delete CLIENTS_STATE[ws.id];
        console.log('Connection closed!');
    });
    ws.on('error', function(e) {
        delete CLIENTS[ws.id];
        delete CLIENTS_STATE[ws.id];
        console.log(e);
    });
});



var mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL;
var mongoURLLabel = "";

if (mongoURL == null ) {
    //var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
        //mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
        //mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
        //mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
        //mongoPassword = process.env[mongoServiceName + '_PASSWORD']
        //mongoUser = process.env[mongoServiceName + '_USER'];
    var mongoHost = "localhost",
        mongoPort = 27017,
        mongoDatabase = "sampledb",
        mongoPassword = "bdPN8vvFe5HYhLXb",
        mongoUser = "user4KF";

    var connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
        process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
        process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
        process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
        process.env.OPENSHIFT_APP_NAME;

    if (mongoHost && mongoPort && mongoDatabase) {
        mongoURLLabel = mongoURL = 'mongodb://';
        if (mongoUser && mongoPassword) {
            mongoURL += mongoUser + ':' + mongoPassword + '@';
        }
        // Provide UI label that excludes user id and pw
        mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
        mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;
    }
}
var db = null,
    dbDetails = new Object();

var initDb = function(callback) {
console.log('mongoURL == null');
  if (mongoURL == null) return;

  var mongodb = require('mongodb');
console.log('mongodb == null');
  if (mongodb == null) return;

  mongodb.connect(connection_string, function(err, conn) {
    console.log(connection_string);
    if (err) {
        console.log('mongodb err'+ err);        
        callback(err);
        return;
    }

    db = conn;
    dbDetails.databaseName = db.databaseName;
    dbDetails.url = mongoURLLabel;
    dbDetails.type = 'MongoDB';

    console.log('Connected to MongoDB at: %s', connection_string);
  });
};
initDb(function(err){});

console.log('Listening at IP ' + ipaddr +' on port '+port);
server.listen(port,ipaddr);

/*
app.get('/', function (req, res) {
    // try to initialize the db on every request if it's not already
    // initialized.
    if (!db) {
      initDb(function(err){});
    }
    if (db) {
      var col = db.collection('counts');
      // Create a document with request IP and current time of request
      col.insert({ip: req.ip, date: Date.now()});
      col.count(function(err, count){
        if (err) {
          console.log('Error running count. Message:\n'+err);
        }
        res.render('index.html', { pageCountMessage : count, dbInfo: dbDetails });
      });
    } else {
      res.render('index.html', { pageCountMessage : null});
    }
  });
  
  app.get('/pagecount', function (req, res) {
    // try to initialize the db on every request if it's not already
    // initialized.
    if (!db) {
      initDb(function(err){});
    }
    if (db) {
      db.collection('counts').count(function(err, count ){
        res.send('{ pageCount: ' + count + '}');
      });
    } else {
      res.send('{ pageCount: -1 }');
    }
  });
  
  // error handling
  app.use(function(err, req, res, next){
    console.error(err.stack);
    res.status(500).send('Something bad happened!');
  });
  
  initDb(function(err){
    console.log('Error connecting to Mongo. Message:\n'+err);
  });
  
  var appIp   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
  var appPort = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080;
  //app.listen(appPort, appIp);
  console.log('Server running on http://%s:%s', appIp, appPort);
  
  module.exports = app ;
  */