
const redis = require("redis");
const WebSocket = require('ws');

const redisClient = redis.createClient();
const redisPubClient = redis.createClient();
redisClient.connect();
redisPubClient.connect();

exports.publish = (channel, value) =>{
redisPubClient.publish(channel, value);
}

exports.subscribe = (channelSubscribed, callback) => {
  redisClient.subscribe(channelSubscribed,(message)=>{
    callback(message)
  })
}
exports.connectWebSocket = (server) => {
const wss = new WebSocket.Server({server}); 
wss.on('connection', (ws) => {
  this.subscribe('canalMensagens', (message) =>{
    ws.send(message);
  });

  ws.on("close", () => {
    console.log("WebSocket client disconnected.");
  });

  ws.on("error", (error) => {
    console.error(`WebSocket error: ${error.message}`);
  });
})


}

