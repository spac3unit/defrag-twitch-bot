import tmi from 'tmi.js';
import { getWorldRecord, getMapInfo, getCurrentWarcupId, getNewsById } from './api.js';
import { format } from 'date-fns';

// https://twitchapps.com/ for generating token
// TODO: add typescript

const opts = {
  identity: {
    username: 'defrag_bot',
    password: 'oauth:behcqsx50syx109sieq4pfe8kzseey',
  },
  channels: ['defraglive', 'w00deh', 'ofsyntax', 'defrag_bot'],
};

const client = new tmi.Client(opts);
client.connect();

client.on('message', onMessageHandler);

async function onMessageHandler(channel, ctx, msg, self) {
  // if (self) return;
  const message = msg.trim();

  if (message === '!wr') {
    client.say(channel, `@${ctx.username}, incorrect command. Please, use !wr <map_name>`);
    return;
  }

  if (message.startsWith('!wr') && message != '!wr') {
    const mapName = message.split(' ')[1];
    const physic = message.split(' ')[2] || 'cpm';

    Promise.allSettled([getWorldRecord(mapName, 'vq3'), getWorldRecord(mapName, 'cpm')])
      .then((results) => {
        const fulfilledResults = results
          .filter((result) => result.status === 'fulfilled')
          .map((result) => result.value);

        //means both getWorldRecord cpm and vq3 resolved
        if (fulfilledResults.length == 2) {
          const vq3Time = fulfilledResults[0].time;
          const vq3Player = fulfilledResults[0].name;
          const cpmTime = fulfilledResults[1].time;
          const cpmPlayer = fulfilledResults[1].name;

          client.say(
            channel,
            `@${ctx.username}, CPM - ${cpmTime} by ${cpmPlayer} | VQ3 - ${vq3Time} by ${vq3Player}`
          );
        } else {
          const { physic, time, name } = fulfilledResults[0];
          if (physic === 'cpm') {
            client.say(channel, `@${ctx.username}, CPM - ${time} by ${name} | VQ3 time not found `);
          } else if (physic === 'vq3') {
            client.say(channel, `@${ctx.username}, VQ3 - ${time} by ${name} | CPM time not found `);
          }
        }
      })
      .catch((error) => {
        client.say(channel, `@${ctx.username}, map ${mapName} not found :( `);
        console.log(error);
      });
  }

  if (message.startsWith('!map')) {
    const map = message.trim().split(' ')[1];

    getMapInfo(map)
      .then((result) => {
        console.log('result: ', result);
        const { mapAuthor, createdAt } = result;
        const formattedDate = createdAt.replace(/(?!-)[^0-9.]/g, ''); // replace Release date2009-02-10 to 2009-02-10

        client.say(channel, `@${ctx.username}, ${map} by ${mapAuthor} | ${formattedDate}`);
      })
      .catch((e) => {
        client.say(channel, `@${ctx.username}, wrong map name`);
        console.error(e);
      });
  }

  if (message === '!warcup') {
    const warcupID = await getCurrentWarcupId();

    getNewsById(warcupID)
      .then((data) => {
        const { startDateTime, endDateTime, fullName, shortName, map1 } = data;
        const formattedEndDate = format(new Date(endDateTime), 'dd MMM ');
        const formattedStartDate = format(new Date(startDateTime), 'dd MMM ');
        client.say(
          channel,
          `@${ctx.username}, ${fullName} | ${shortName} | ${formattedStartDate} - ${formattedEndDate} | https://dfcomps.ru/news/${warcupID}`
        );
      })
      .catch((e) => {
        client.say(channel, `@${ctx.username}, smth wrong with warcup`);
        console.error(e);
      });
  }
}
