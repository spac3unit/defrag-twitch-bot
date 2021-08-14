import https from 'https';
import { parseWR, parseMapInfo } from './parser';
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
          // wrTime = parseWR(data);
          wrTime = { physic, ...parseWR(data) };
          // console.log('wrTime:', wrTime);
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
          // console.log('mapInfo:', mapInfo);
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
