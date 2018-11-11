const Twitter = require('twit')({
  consumer_key: 'dNRsXzACONSW07UdJQ7Pjdkc6',
  consumer_secret: 'KD0SDdbzb7OrYNCgjJfUWo66dpSgLd8WCrn4fffaPYwo0wig6d',
  access_token: '858864621893058560-KImtTaWcQDMPkhKE6diK6QUQJOIeCt9',
  access_token_secret: 'pBkS7T83E4924krvkigXcHvk2dvitbCq6f2l6BzyDCeOH'
})
let streams = {}
const { log } = require('../../utilities.js')
const { MessageEmbed } = require('discord.js')
const { loadImage, createCanvas } = require('canvas')

module.exports = {
  streams: streams,
  twitter: Twitter,
  stream (client, db, ids) {
    if (Object.keys(streams).some(r => ids.includes(r))) return
    var stream = Twitter.stream('statuses/filter', { follow: ids })
    ids.forEach(id => { streams[id] = stream })

    stream.on('tweet', async function (tweet) {
      let embed = new MessageEmbed()
        .setAuthor(`${tweet.user.name} | ${tweet.user.screen_name}`, tweet.user.profile_image_url)
        .setThumbnail()
        .setColor(tweet.user.profile_background_color)
        .setTimestamp()

      let textArray = tweet.text.split(' ')
      let url = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}/`

      embed.addField('Tweet', textArray.join(' '))
      embed.addField('URL', url)

      if (tweet.extended_entities) {
        let media = tweet.extended_entities.media.filter(e => e.type === 'photo').map(e => loadImage(e.media_url))
        let array = await Promise.all(media)
        let widthTotal = 0
        let x = 0

        array.sort((a, b) => {
          return a.height > b.height ? -1 : b.height > a.height ? 1 : 0
        })

        array.forEach(e => { widthTotal += e.width })
        const canvas = createCanvas(widthTotal, array[0].height)
        let ctx = canvas.getContext('2d')

        array.forEach(e => {
          ctx.drawImage(e, x, 0)
          x += e.width
        })

        embed.attachFiles([{ name: 'images.png', attachment: canvas.toBuffer() }])
          .setImage('attachment://images.png')
      }

      let stmt = db.prepare('SELECT channel FROM twitter')

      for (const row of stmt.iterate()) {
        let newEmbed = embed.addField('Channel', `#${row.channel}`)

        client.channels.find(c => c.name === 'tweet-approval').send(newEmbed).then(m => {
          Promise.all([m.react('✅'), m.react('❎')]).then(reacts => {
            db.prepare('INSERT INTO tweets (id,url,channel) VALUES (?,?,?)').run(m.id, url, row.channel)
          })
        })
      }
    })
    stream.on('error', function (err) {
      log(client, err.message)
    })
  }
}
