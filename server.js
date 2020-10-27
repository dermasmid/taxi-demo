const utils = require('./utils')
const socketIO = require('socket.io');
const http = require('http');
const express = require("express");
const mongoose = require('mongoose');
const app = express();


// connect to database (and if there isn't one - it makes it)
mongoose.connect('mongodb://mongo:27017/taxiDemo', {useNewUrlParser: true, useUnifiedTopology: true});

const taxiSchema = new mongoose.Schema({
    name: String, 
    location: Array,
    busy: Boolean
})
const taxiModel = mongoose.model('taxis', taxiSchema);



// check if we already have the taxi data, if not add them
taxiModel.find((err, data) => {
    if (data.length === 0) {
        utils.taxiData.forEach((item, index) => {
            let taxi = new taxiModel({ name: item.name, location: item.location, busy: item.busy});
            taxi.save()
        })
        
    }

})




const server = http.Server(app);

server.listen(3002);

const io = socketIO(server);

io.on('connection',(socket) => {
    socket.on('getTaxis',(message) => { 
        mongoose.model('taxis', taxiSchema).find((err, data) => {
            socket.emit('allTaxis', {data});
    
        });
     });


    socket.on('taxiRequest',(request) => {
        utils.getNearestTaxi(request.from, taxiModel, (taxi) => {
            utils.getDirections(taxi.location, request.from, request.to, (path) => {
                utils.sendDirections(path, taxi, socket);
                taxiModel.findById(taxi._id, (err, taxiDb) => {
                    taxiDb.busy = true
                    taxiDb.save()
                    utils.driveTaxi(path, io, taxiDb, socket, 0)
                })

            })
        })
    })


});

// run webserver
app.set('view engine', 'ejs');
app.use(express.static('taxi-demo'))
app.get('/',(req, res) => {
    res.render('index', {apiKey: process.env.APIKEY})
})
app.listen(3000)


