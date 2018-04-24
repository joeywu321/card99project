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

if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
    var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
        mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
        mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
        mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
        mongoPassword = process.env[mongoServiceName + '_PASSWORD']
        mongoUser = process.env[mongoServiceName + '_USER'];

    if (mongoHost && mongoPort && mongoDatabase) {
        if (mongoUser && mongoPassword) {
            mongoURL += mongoUser + ':' + mongoPassword + '@';
        }
        // Provide UI label that excludes user id and pw
        mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;
    }
}
var MongoClient = require('mongodb').MongoClient;
 
var findDocuments = function(db, callback) {

    /*
    var collection = db.collection('login');

    collection.find({firstName:"Bill"}).toArray(function(err,docs){
        if (err) throw err;
        console.log(docs);
        callback;
    })

    collection.insert({  firstName: 'Steve', lastName: 'Jobs' });
    collection.insert({  firstName: 'Bill', lastName: 'Gates' });
    collection.insert({  firstName: 'James', lastName: 'Bond' });
    */
    

}

// Connect to the db
MongoClient.connect(mongoURL, function (err, client) {
  if(err) throw err;
  console.log('mongoURL: ' + mongoURL);
  console.log('mongodb is running!');  
  
  findDocuments(client.db('sampledb'), function(){
        console.log('mongodb is OK!');  
        db.close();
    });
});


console.log('Listening at IP ' + ipaddr +' on port '+port);
server.listen(port,ipaddr);