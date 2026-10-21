import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
const html=readFileSync('src/index.html','utf8');
const map=readFileSync('data/map-data.json','utf8');
const detail=readFileSync('data/map-detail.json','utf8');
if(!html.includes('__MAP_DATA__'))throw new Error('Map placeholder missing');
mkdirSync('public',{recursive:true});
// Keep future map labels from being interpreted as HTML inside the JSON script tag.
writeFileSync('public/index.html',html.replace('__MAP_DATA__',map.replace(/</g,'\\u003c')));
writeFileSync('public/map-detail.json',detail);
console.log('Built public/index.html');
