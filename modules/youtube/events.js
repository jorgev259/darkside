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

            app.post('darkside', function(req, res) {
                console.log(req.body)
            });

            app.listen(4040, function() {
                console.log('Request API up and running, sir!');
            });           
        }
    }
}