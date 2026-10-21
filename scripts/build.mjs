import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
const html=readFileSync('src/index.html','utf8');
const map=readFileSync('data/map-data.json','utf8');
if(!html.includes('__MAP_DATA__'))throw new Error('Map placeholder missing');
mkdirSync('public',{recursive:true});
writeFileSync('public/index.html',html.replace('__MAP_DATA__',map));
console.log('Built public/index.html');
