const {Client} = require("@googlemaps/google-maps-services-js");
const polyUtil = require('polyline-encoded');

const client = new Client({});



exports.taxiData = [
    {
        name: 'Adams',
        location: [32.075287, 34.833164],
        busy: false,
        id: '1'
    },
    {
        name: 'Baker',
        location: [32.076236, 34.824989],
        busy: false,
        id: '2'
    },
    {
        name: 'Noah',
        location: [32.090611, 34.819228],
        busy: false,
        id: '3'
    },
    {
        name: 'Smith',
        location: [32.081531, 34.807235],
        busy: false,
        id: '4'
    },
    {
        name: 'Jacob',
        location: [32.089271, 34.834437],
        busy: false,
        id: '5'
    },
    {
        name: 'Lopez',
        location: [32.108339, 34.849628],
        busy: false,
        id: '6'
    },
    {
        name: 'Mason',
        location: [32.105059, 34.805794],
        busy: false,
        id: '7'
    }
]


exports.getNearestTaxi = (userLocation, model, callback) => {
    let availableTaxisdist = [];
    let availableTaxis = [];
    let taxisLocation = [];
    model.find((err, taxis) => {
        taxis.forEach((taxi, index) => {
            if (!taxi.busy) {
                availableTaxis.push(taxi);
                taxisLocation.push({ lat: taxi.location[0], lng: taxi.location[1] });
            };
            if (taxis.length -1 === index) {
                client.distancematrix({
                    params: {
                        key: process.env.APIKEY,
                        origins: taxisLocation,
                        destinations: [{ lat: userLocation.lat, lng: userLocation.lng }], 
                    }
                    }).then((dist) => {
                        dist.data.rows.forEach((data) => {
                            availableTaxisdist.push(data.elements[0].distance.value);
                        });
                        let nearest = Math.min.apply(Math, availableTaxisdist);
                        nearest= availableTaxisdist.indexOf(nearest);
                        let nearestTaxi = availableTaxis[nearest];
                        callback(nearestTaxi);
                    });
            };
        });
        });
    };


exports.getDirections = (taxiLocation, userLocation, destenation, callback) => {
    taxiLocation = { lat: taxiLocation[0], lng: taxiLocation[1] }
    client.directions({
        params: {
            origin: taxiLocation,
            destination: destenation,
            key: process.env.APIKEY,
            region: ".il",
            waypoints: [userLocation]
        }
    })
    .then((data) => {
        const poly = data.data.routes[0].overview_polyline.points
        const path = polyUtil.decode(poly);
        let updatedPath = []
        path.forEach((latlng, index) => {
            updatedPath.push({lat: latlng[0], lng: latlng[1]})
        })
        callback(updatedPath)
    });
}


exports.sendDirections = (path, taxi, socket) => {
    socket.emit('taxiPath', {path, taxi})
}


exports.driveTaxi = (path, io, taxiDb, socket, index) => {
    setTimeout(() => {
        latlng = path[index]
        index ++
        taxiDb.location = [latlng.lat, latlng.lng]
        io.emit('updateTaxi', taxiDb)
        if (index % 5 === 0) {
            taxiDb.save()
        }
        if (index < path.length) {
            this.driveTaxi(path, io, taxiDb, socket, index)
        } else {
            // waiting for 2 secs to give time for the prev taxiDb.save() to finnish
            setTimeout(() => { 
                taxiDb.busy = false
                io.emit('updateTaxi', taxiDb)
                socket.emit('finnishedRide')
                taxiDb.save()
        }, 200)
        }
    }, 2000)
}