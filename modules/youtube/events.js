var express = require('express');
var app = express();

module.exports = {
    events: {
        async ready(client, db){
            app.get('/logout', function(req, res) {
                req.logout();
                res.redirect('/login');
            });

            app.use(function(req, res, next) {
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
                next();
            });

            app.post('/darkside', function(req, res) {
                console.log(req.body)
            });

            app.get('/test', function(req,res){
                res.send('I welcome our new Scorn overlords')
            })

            app.listen(8080, function() {
                console.log('Request API up and running, sir!');
                client.channels.find(c => c.name === 'error-logs').send('But JOOKKKKEEEEEEER')
            });           
        }
    }
}