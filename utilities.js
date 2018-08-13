var reactionNumbers = ["1⃣","2⃣","3⃣","4⃣","5⃣","6⃣","7⃣","8⃣","9⃣", "🔟"];
var reactions = ["390223211662540800","390223209930424321","390223211637243905","390223211616534577","390223211456888835","390223210240540683"];
var cooldown = {};
var colors = ["pink","d-blue","purple","l-blue","green","red"];
const Discord = require('discord.js');

module.exports = {
	async permCheck(message, commandName, client, db){
		let dbPerms = await db.all(`SELECT item,type FROM perms WHERE command='${commandName}'`)
		let perms = {channel: [], role:[], user:[]};
		dbPerms.forEach(element => {
			perms[element.type].push(element.item);
		})
		if(dbPerms.length == 0 || message.member.roles.some(r=>r.name=="🍬") ||  message.member.roles.some(r=>r.name=="🍬 Master Developer")) return true;
		var allowedChannel = true;
		var allowed = false;

		if(perms.channel.length>0){
			allowedChannel = false;
			if(perms.channel.includes(message.channel.name)) allowedChannel = true;
		}
		if(allowedChannel){
			if(perms.role.length==0 && perms.user.length==0){return true};

			if(perms.role.length>0){
				for(var i=0;i<perms.role.length;i++){
					var role = message.member.guild.roles.find(role=> role.name == perms.role[i]);
					if(role != null && message.member.roles.has(role.id)){
						return true;
						i=perms.role.length;
					}
				}
			}

			if(!allowed && perms.user.length>0){
				for(var i=0;i<perms.user.length;i++){
					if(perms.user[i] == message.author.id){
						return true;
						i=perms.user.length;
					}
				}
			}

		}
		return false;
	},

	react:function(msg){
		reactions.forEach(reaction => {
			msg.react(reaction);
		})
	},

	/*findEmoji:function(emoji){
        for(var i=0;i<10;i++){
            if(reactions[i]==emoji){
                return i+1;
            }
        }
    },*/
	async checkData(client, name, info){
        if(!(await fs.pathExists(`data/${name}.json`))) {
            // file does not exist
            client.data[name] = info;
            fs.writeFileSync(`data/${name}.json`, JSON.stringify(client.data[name], null, 4));
        }
	},

	async save(data,name){
		await fs.writeFile("data/" + name + ".json", JSON.stringify(data, null, 4));
	},


	log:function(client,log){
		console.log(log);
		if(client != null && client.channels.size>0 && client.readyAt != null){			
			client.channels.find(val => val.name === "error-logs").send({embed:new Discord.MessageEmbed().setTimestamp().setDescription(log)});
		}
	}
}

