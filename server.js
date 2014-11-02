var config = require('./config.json');
var express = require('express');
var http = require('http');

var app = express();
app.get('/data/prediction/:station',function(req,res) {
    getWMATAData('/StationPrediction.svc/json/GetPrediction/' + encodeURIComponent(req.params.station),function(data) {
        if (data) {
            var sendData = data.Trains.slice(0,3).map(function(row) {
                return {
                    'ln': row.Line,
                    'car': row.Car,
                    'dest': row.Destination,
                    'min': row.Min
                };
            });
            res.json(sendData);
        } else {
            res.send(500);
        }
    });
});
app.get('/data/stations',function(req,res) {
    getWMATAData('/Rail.svc/json/jStations',function(data) {
        if (data) {
            var sendData = data.Stations.map(function(row) {
                return {
                    'name': row.Name,
                    'code': row.Code
                };
            });
            res.json(sendData);
        } else {
            res.send(500);
        }
    });
});
app.use(express.static(__dirname + '/public'));
app.listen(config.port,function() {
    console.log('Ready');
});

function getWMATAData(path,callback) {
    http.request({
        'host': 'api.wmata.com',
        'path': path + '?api_key=' + config.api_key
    },function(response) {
        var str = '';
        response.on('data', function (chunk) {
            str += chunk;
        });
        response.on('end', function () {
            try {
                var json = JSON.parse(str);
                console.log(json);
                callback(json);
            } catch(e) {
                callback(null);
            }
        });
    }).end();
}