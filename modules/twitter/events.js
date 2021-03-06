let { stream } = require('./util.js')
let reactions = ['✅', '❎']

module.exports = {
  async reqs (client, db) {
    return new Promise((resolve, reject) => {
      db.prepare('CREATE TABLE IF NOT EXISTS twitter (id TEXT, channel TEXT, PRIMARY KEY (id,channel))').run()
      db.prepare('CREATE TABLE IF NOT EXISTS tweets (id TEXT, url TEXT, channel TEXT, PRIMARY KEY (id))').run()
      resolve()
    })
  },
  events: {
    async ready (client, db) {
      let ids = db.prepare('SELECT id FROM twitter').all().map(r => r.id)

      await client.channels.find(c => c.name === 'tweet-approval').messages.fetch()
      if (ids.length > 0) stream(client, db, ids)
    },

    async messageReactionAdd (client, db, reaction, user) {
      if (reaction.message.channel.name === 'tweet-approval' && !user.bot && reactions.includes(reaction.emoji.name)) {
        let embed = reaction.message.embeds[0]

        switch (reaction.emoji.name) {
          case '✅':
            embed.setFooter(`Accepted by ${user}`)
            let url = ''
            let msgs = db.prepare('SELECT channel,url FROM tweets WHERE id=?').all(reaction.message.id).map(row => {
              url = row.url
              return client.channels.find(c => c.name === row.channel).send(row.url)
            })

            Promise.all(msgs).catch(err => {
              console.log(err)
              client.channels.find(c => c.name === 'tweet-approval-log').send(`A message couldnt be send in some channels. URL: ${url}`)
            })
            break

          case '❎':
            embed.setFooter(`Rejected by ${user}`)
            break
        }
        db.prepare('DELETE FROM tweets WHERE id=?').run(reaction.message.id)

        embed.setTimestamp()
        client.channels.find(c => c.name === 'tweet-approval-log').send(embed)
        reaction.message.delete()
      }
    }
  }
}
