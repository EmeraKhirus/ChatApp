var express = require("express"), 
http = require("http"),
app = express(),
server = http.createServer(app),
path = require("path");
 
app.use(express.static(path.join(__dirname, 'public')));
 
app.set("views",__dirname + "/views");

 
app.get("/", function(req,res){
    res.render("index.jade", {title : "CHAT EMERA"});
});
 
server.listen(3000);
 

var usuariosOnline = {};
 
var io = require("socket.io").listen(server);
 

io.sockets.on('connection', function(socket) 
{
   
    socket.on("loginUser", function(username)
    {
        
        if(usuariosOnline[username])
        {
            socket.emit("userInUse");
            return;
        }
        
        socket.username = username;
        
        usuariosOnline[username] = socket.username;
        
        socket.emit("refreshChat", "yo", "Bienvenido " + socket.username + ", te has conectado.");
        
        socket.broadcast.emit("refreshChat", "conectado", "El usuario " + socket.username + " se ha conectado al chat.");
        
        io.sockets.emit("updateSidebarUsers", usuariosOnline);
    });
 
    
    socket.on('addNewMessage', function(message) 
    {
        
        socket.emit("refreshChat", "msg", "Yo : " + message + ".");
        
        socket.broadcast.emit("refreshChat", "msg", socket.username + " dice: " + message + ".");
    });
 
    
    socket.on("disconnect", function()
    {
        
        if(typeof(socket.username) == "undefined")
        {
            return;
        }
        
        delete usuariosOnline[socket.username];
        
        io.sockets.emit("updateSidebarUsers", usuariosOnline);
        
        socket.broadcast.emit("refreshChat", "desconectado", "El usuario " + socket.username + " se ha desconectado del chat.");
    });
});