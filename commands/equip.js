var fs = require("fs");
var util = require("../utilities.js");
var json = require('jsonfile');

module.exports = {
    desc:"This is a description",
    alias:["bg"],
    execute(client, message, param){
        var inventory = json.readFileSync("../data/inventory.json");
        var exp = json.readFileSync("../data/exp.json");
        if(exp.badges == undefined) {exp.badges = [];util.save(exp,"exp")}

        if(param.length > 2){
            var slot = parseInt(param[param.length - 1]);
            var name = param.splice(1,param.length - 2).join(" ");

            if(fs.existsSync(`../images/badges/${name}.png`)){
                if(inventory[message.author.id].badges.includes(name)){
                    exp[message.author.id].badges[slot] = code;
                    util.save(exp,"exp");
                    message.channel.send("New badge applied!")
                }else{
                    message.channel.send("Sorry, you dont own this badge ;-;");
                }
            }else{
                message.channel.send(`The background code ${code} doesnt exist. Check https://www.fandomcircle.com/shop-1#PROFILES for more info`)
            }
        }else{
            message.channel.send("You forgot the name of the badge or the number of the slot. Usage: >equip <name> <slot>");
        }
    }
}