import {readFileSync,writeFileSync} from 'node:fs';
import {cleanItems,fetchDirectFeeds,isIncident,isRelevant,safeHttpsUrl} from '../lib/news.js';

const output=new URL('../data/live-news.json',import.meta.url);
const query='("php2shell" OR "CVE-2026-109618" OR "CVE-2026-109619")';
const search=new URL('https://api.gdeltproject.org/api/v2/doc/doc');
for(const [key,value] of Object.entries({query,mode:'artlist',maxrecords:'200',timespan:'1week',sort:'datedesc',format:'json'}))search.searchParams.set(key,value);

async function searchCoverage(){
  let response=await fetch(search,{headers:{'user-agent':'PHP2Shell Atlas/1.0'},signal:AbortSignal.timeout(60000)});
  if(response.status===429){
    await new Promise(resolve=>setTimeout(resolve,20000));
    response=await fetch(search,{headers:{'user-agent':'PHP2Shell Atlas/1.0'},signal:AbortSignal.timeout(60000)});
  }
  if(!response.ok)throw Error(`GDELT status ${response.status}`);
  const data=await response.json();
  if(!Array.isArray(data.articles))throw Error('GDELT response has no article list');
  return data.articles.map(article=>{
    const timestamp=Date.parse(String(article.seendate||'').replace(/^(\d{4})(\d\d)(\d\d)T(\d\d)(\d\d)(\d\d)Z$/,'$1-$2-$3T$4:$5:$6Z'));
    const url=safeHttpsUrl(article.url||'');
    return{title:String(article.title||'').replace(/\s+/g,' ').trim(),description:'',source:String(article.domain||(url?new URL(url).hostname:'')).replace(/^www\./,''),kind:'reporting',image:safeHttpsUrl(article.socialimage||''),timestamp,url};
  }).filter(article=>article.title&&article.url&&Number.isFinite(article.timestamp)&&
    (isIncident(article.title)||/\bphp\b/i.test(article.title)&&/critical|vulnerab|security|patch|flaw|exploit|rce|remote code/i.test(article.title)));
}

const prior=JSON.parse(readFileSync(output,'utf8'));
const retained=prior.items.filter(item=>item&&item.title&&safeHttpsUrl(item.url)&&isRelevant(item.title,item.description))
  .map(item=>({...item,timestamp:Date.parse(item.publishedAt||item.date)})).filter(item=>Number.isFinite(item.timestamp));
const [searchResult,feedResult]=await Promise.allSettled([searchCoverage(),fetchDirectFeeds(12000)]);
if(searchResult.status==='rejected')console.warn('Broad search unavailable:',searchResult.reason.message);
if(feedResult.status==='rejected')console.warn('Direct feeds unavailable:',feedResult.reason.message);
const searched=searchResult.status==='fulfilled'?searchResult.value:[];
const direct=feedResult.status==='fulfilled'?feedResult.value:{items:[],feedsAvailable:0,feedsTotal:0};
const items=cleanItems([...direct.items,...searched,...retained]);
if(!items.length)throw Error('No validated incident articles; keeping the previous snapshot');
if(JSON.stringify(prior.items)===JSON.stringify(items)){
  console.log(`No change: ${items.length} articles; ${direct.feedsAvailable}/${direct.feedsTotal} feeds available; ${searched.length} search matches`);
}else{
  writeFileSync(output,JSON.stringify({items,checkedAt:new Date().toISOString(),feedsAvailable:direct.feedsAvailable,feedsTotal:direct.feedsTotal,searchMatches:searched.length},null,2)+'\n');
  console.log(`Updated: ${items.length} articles; ${direct.feedsAvailable}/${direct.feedsTotal} feeds available; ${searched.length} search matches`);
}
