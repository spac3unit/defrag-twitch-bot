import https from 'https';
import { parseWR, parseMapInfo } from './parser.js';

// dfcomps api:
// https://dfcomps.ru/api/cup/next_cup_info
// https://dfcomps.ru/api/news/single/596

export function getWorldRecord(mapName, physic = 'cpm') {
  let physicID = physic == 'cpm' ? 1 : 0;

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'www.q3df.org',
      path: `/records/details?map=${mapName}&mode=-1&physic=${physicID}`,
    };

    const req = https.request(options, (res) => {
      let data = '';
      let wrTime = {};
      res.on('data', function (chunk) {
        data += chunk;
      });

      res.on('end', function () {
        try {
          wrTime = { physic, ...parseWR(data) };
        } catch (e) {
          reject(e);
        }
        resolve(wrTime);
      });
    });

    req.on('error', (e) => {
      reject(e.message);
    });

    req.end();
  });
}

export function getMapInfo(mapName) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'ws.q3df.org',
      path: `/map/${mapName}/`,
    };

    const req = https.request(options, (res) => {
      let data = '';
      let mapInfo = '';
      res.on('data', function (chunk) {
        data += chunk;
      });

      res.on('end', function () {
        try {
          mapInfo = parseMapInfo(data);
        } catch (e) {
          reject(e);
        }
        resolve(mapInfo);
      });
    });

    req.on('error', (e) => {
      reject(e.message);
    });

    req.end();
  });
}

export async function getCurrentWarcupId() {
  let url = 'https://dfcomps.ru/api/cup/next_cup_info';
  return new Promise((resolve, reject) => {
    const req = https.get(url, function (res) {
      let body = '';
      let warcupID = '';
      let response = '';
      res.on('data', function (chunk) {
        body += chunk;
      });

      res.on('end', function () {
        try {
          response = JSON.parse(body);
          warcupID = response.newsId;
        } catch (e) {
          reject(e);
        }
        resolve(warcupID);
        // console.log('Got a response: ', response);
      });
    });
    req.on('error', function (e) {
      console.log('Got an error: ', e);
      reject(e.message);
    });
    req.end();
  });
}

// getCurrentWarcup().then((data) => console.log('data', data));

export async function getNewsByWarcupId(id) {
  // const warcupID = await getCurrentWarcup();

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'dfcomps.ru',
      path: `/api/news/single/${id}/`,
    };

    const req = https.request(options, (res) => {
      let body = '';
      let warcupInfo = '';
      res.on('data', function (chunk) {
        body += chunk;
      });

      res.on('end', function () {
        try {
          let response = JSON.parse(body);
          warcupInfo = response.cup;
        } catch (e) {
          reject(e);
        }
        resolve(warcupInfo);
      });
    });

    req.on('error', (e) => {
      reject(e.message);
    });

    req.end();
  });
}
