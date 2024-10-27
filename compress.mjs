import { zip, COMPRESSION_LEVEL } from 'zip-a-folder';
import { readFile, writeFile } from 'fs/promises';

console.log("Start zipping folder");

const date = new Date();

const indexHTML = (await readFile('./dist/index.html')).toString();
// console.log('index:', indexHTML);

// const createVariant = async ([replaceStr, name]) => {
const newPokiHTML = indexHTML.replaceAll('// __POKI__BUILD ', '');

await writeFile('./dist/index.html', newPokiHTML, 'utf8');

await zip('./dist', `deployable-zips/poki-${date.toJSON().replaceAll(':', '_')}.zip`, { compression: COMPRESSION_LEVEL.high });

const newItchIOHTML = indexHTML.replaceAll('// __ITCHIO__BUILD ', '');

await writeFile('./dist/index.html', newItchIOHTML, 'utf8');

await zip('./dist', `deployable-zips/itchio-${date.toJSON().replaceAll(':', '_')}.zip`, { compression: COMPRESSION_LEVEL.high });

const newGamejoltHTML = indexHTML.replaceAll('// __GAMEJOLT__BUILD ', '');

await writeFile('./dist/index.html', newGamejoltHTML, 'utf8');

await zip('./dist', `deployable-zips/gamejolt-${date.toJSON().replaceAll(':', '_')}.zip`, { compression: COMPRESSION_LEVEL.high });

await writeFile('./dist/index.html', indexHTML, 'utf8');

await zip('./dist', `deployable-zips/open-${date.toJSON().replaceAll(':', '_')}.zip`, { compression: COMPRESSION_LEVEL.high });

console.log("Done zipping folder! 🙌");
