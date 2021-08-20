import https from 'https';
import axios from 'axios';
import { parseWR, parseMapInfo } from './parser.js';
// https://stackoverflow.com/questions/64333057/how-to-merge-parallel-axios-get-requests-and-promise-allsettled-function-with-so
// https://www.twilio.com/blog/2017/08/http-requests-in-node-js.html
// qstat -P -q3s 83.243.73.220:27965
// gamedig --type quake3 83.243.73.220:27961

export async function getNewsById(id) {
  let url = `https://dfcomps.ru/api/news/single/${id}/`;

  return new Promise((resolve, reject) => {
    axios
      .get(url)
      .then((response) => {
        console.log(response.data.cup);
        resolve(response.data.cup);
      })
      .catch((e) => {
        console.error(e);
        reject(e.message);
      });
  });
}

export async function getCurrentWarcupId() {
  let url = 'https://dfcomps.ru/api/cup/next_cup_info';

  return new Promise((resolve, reject) => {
    axios
      .get(url)
      .then((response) => {
        console.log(response.data.newsId);
        resolve(response.data.newsId);
      })
      .catch((e) => {
        console.error(e);
        reject(e.message);
      });
  });
}

export async function getWorldRecord(map, physic = 'cpm') {
  let physicID = physic == 'cpm' ? 1 : 0;
  let url = `https://q3df.org/records/details?map=${map}&mode=-1&physic=${physicID}`;

  return new Promise((resolve, reject) => {
    axios
      .get(url)
      .then((response) => {
        let wr = parseWR(response.data);
        let result = { physic, ...wr };
        resolve(result);
      })
      .catch((e) => {
        console.error(e);
        reject(e.message);
      });
  });
}

export async function getMapInfo(mapName) {
  let url = `https://ws.q3df.org/map/${mapName}/`;

  return new Promise((resolve, reject) => {
    axios
      .get(url)
      .then((response) => {
        const mapInfo = parseMapInfo(response.data);
        resolve(mapInfo);
      })
      .catch((e) => {
        console.error(e);
        reject(e.message);
      });
  });
}
