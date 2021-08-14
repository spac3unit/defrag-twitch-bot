import nodeparser from 'node-html-parser';

const { parse } = nodeparser;

export function parseWR(html) {
  const root = parse(html);
  const tableBody = root.querySelector('tbody');
  const worldRecordTableRow = tableBody.querySelectorAll('tr')[0];
  const worldRecordHolderName = worldRecordTableRow.querySelectorAll('td')[1].text.trim();
  const worldRecordTime = worldRecordTableRow.querySelectorAll('td')[2].text.trim();

  return {
    name: worldRecordHolderName,
    time: worldRecordTime,
  };
}

export function parseMapInfo(html) {
  const root = parse(html);
  const table = root.querySelector('#mapdetails_data_table');

  const mapNameTableRow = table.querySelectorAll('tr')[1];
  const mapAuthorTableRow = table.querySelectorAll('tr')[2];
  const mapName = mapNameTableRow.querySelectorAll('td')[1].text.trim().replace(/.bsp/i, '');
  const mapAuthor = mapAuthorTableRow.querySelectorAll('td')[1].text.trim();

  let releaseDate = '';
  root
    .querySelectorAll('tr')
    .filter((a) => a.textContent.includes('Release date'))
    .forEach((a) => {
      releaseDate += a.textContent;
    });

  return {
    mapName,
    mapAuthor,
    createdAt: releaseDate,
  };
}
