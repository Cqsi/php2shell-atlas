// Direct source feeds also provide a fallback when the scheduled search is unavailable.
export const feeds=[
  ['PHP.net','https://www.php.net/feed.atom','atom','official'],
  ['CERT-EU','https://cert.europa.eu/publications/security-advisories-rss','rss','official'],
  ['UK NCSC','https://www.ncsc.gov.uk/api/1/services/v1/news-rss-feed.xml','rss','official'],
  ['CISA','https://www.cisa.gov/cybersecurity-advisories/all.xml','rss','official'],
  ['CERT-FR','https://cert.cyber.gouv.fr/feed/','rss','official'],
  ['Ubuntu Security','https://ubuntu.com/security/notices/rss.xml','rss','official'],
  ['IPA Japan','https://www.ipa.go.jp/security/alert-rss.rdf','rss','official'],
  ['Cloudflare','https://blog.cloudflare.com/rss/','rss','company'],
  ['CrowdStrike','https://www.crowdstrike.com/en-us/blog/feed/','rss','company'],
  ['Datadog Security Labs','https://securitylabs.datadoghq.com/rss/feed.xml','rss','company'],
  ['Tenable','https://www.tenable.com/blog/feed','rss','company'],
  ['Check Point Research','https://research.checkpoint.com/feed/','rss','company'],
  ['SentinelOne','https://www.sentinelone.com/blog/feed/','rss','company'],
  ['Rapid7','https://www.rapid7.com/rss.xml','rss','company'],
  ['Unit 42','https://unit42.paloaltonetworks.com/feed/','rss','company'],
  ['Malwarebytes','https://www.malwarebytes.com/blog/feed/index.xml','rss','company'],
  ['Wiz','https://www.wiz.io/feed/rss.xml','rss','company'],
  ['Red Hat','https://www.redhat.com/en/rss/blog/channel/security','rss','company'],
  ['AWS Security','https://aws.amazon.com/blogs/security/feed/','rss','company'],
  ['Imperva','https://www.imperva.com/blog/feed/','rss','company'],
  ['ESET Research','https://www.welivesecurity.com/en/rss/feed/','rss','company'],
  ['Kaspersky Securelist','https://securelist.com/feed/','rss','company'],
  ['Snyk','https://snyk.io/blog/feed/','rss','company'],
  ['GitHub Security','https://github.blog/security/feed/','rss','company'],
  ['WPScan','https://wpscan.com/blog/feed/','rss','company'],
  ['Wordfence','https://www.wordfence.com/blog/feed/','rss','company'],
  ['WordPress','https://wordpress.org/news/feed/','rss','company'],
  ['Drupal Security','https://www.drupal.org/security/rss.xml','rss','official'],
  ['SANS ISC','https://isc.sans.edu/rssfeed.xml','rss','research'],
  ['Schneier on Security','https://www.schneier.com/feed/atom/','atom','research'],
  ['Google Project Zero','https://projectzero.google/feed.xml','atom','research'],
  ['BleepingComputer','https://www.bleepingcomputer.com/feed/','rss','reporting'],
  ['The Register','https://www.theregister.com/security/headlines.atom','atom','reporting'],
  ['Help Net Security','https://www.helpnetsecurity.com/feed/','rss','reporting'],
  ['Dark Reading','https://www.darkreading.com/rss.xml','rss','reporting'],
  ['The Hacker News','https://thehackernews.com/feeds/posts/default','rss','reporting'],
  ['Security Affairs','https://securityaffairs.com/feed','rss','reporting'],
  ['CyberScoop','https://cyberscoop.com/feed/','rss','reporting'],
  ['HackRead','https://hackread.com/feed/','rss','reporting'],
  ['The Record','https://therecord.media/feed','rss','reporting'],
  ['Infosecurity Magazine','https://www.infosecurity-magazine.com/rss/news/','rss','reporting'],
].map(([name,url,type,kind])=>({name,url,type,kind}));

function decodeXml(value=''){
  return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/<[^>]+>/g,'')
    .replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>')
    .replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'")
    .replace(/&#(\d+);/g,(_,number)=>String.fromCodePoint(Number(number)))
    .replace(/&#x([0-9a-f]+);/gi,(_,number)=>String.fromCodePoint(parseInt(number,16)))
    .replace(/\s+/g,' ').trim();
}
function tag(xml,name){return(xml.match(new RegExp('<'+name+'(?:\\s[^>]*)?>([\\s\\S]*?)<\\/'+name+'>','i'))||[,''])[1]}
export function isIncident(text){return /\bphp2shell\b|CVE[-\s]?2026[-\s]?10961[89]\b/i.test(text)}
export function isRelevant(title,description=''){return isIncident(title+' '+description)}
export function safeHttpsUrl(value){try{const url=new URL(value);return url.protocol==='https:'&&url.hostname.includes('.')?url.toString():''}catch{return ''}}
export function canonicalUrl(value){
  try{const url=new URL(value);url.hash='';for(const key of [...url.searchParams.keys()])if(/^utm_|^fbclid$|^gclid$|^ref$/i.test(key))url.searchParams.delete(key);return url.toString().replace(/\/$/,'')}
  catch{return value}
}
export function parseFeed(xml,feed){
  const chunks=xml.match(feed.type==='atom'?/<entry\b[\s\S]*?<\/entry>/gi:/<item\b[\s\S]*?<\/item>/gi)||[];
  return chunks.map(chunk=>{
    const title=decodeXml(tag(chunk,'title'));
    const description=decodeXml(tag(chunk,feed.type==='atom'?'content':'description')||tag(chunk,'summary')).slice(0,190);
    const rawLink=feed.type==='atom'?(chunk.match(/<link\b[^>]*href=["']([^"']+)["']/i)||[,''])[1]:decodeXml(tag(chunk,'link'));
    const timestamp=Date.parse(tag(chunk,feed.type==='atom'?'updated':'pubDate')||tag(chunk,'dc:date'));
    const rawImage=(chunk.match(/<(?:media:content|media:thumbnail|enclosure)\b[^>]*(?:url|href)=["']([^"']+)["']/i)||chunk.match(/<img\b[^>]*src=["']([^"']+)["']/i)||[,''])[1].replace(/&amp;/g,'&');
    return{title,description,source:feed.name,kind:feed.kind,image:safeHttpsUrl(rawImage),timestamp,url:safeHttpsUrl(rawLink.replace(/&amp;/g,'&'))};
  }).filter(item=>item.title&&item.url&&Number.isFinite(item.timestamp)&&isRelevant(item.title,item.description));
}
export function cleanItems(items,now=Date.now(),limit=100){
  const seenUrls=new Set(),seenTitles=new Set();
  return items.filter(item=>item.timestamp>=now-14*86400000&&item.timestamp<=now+86400000)
    .sort((a,b)=>b.timestamp-a.timestamp).filter(item=>{
      const url=canonicalUrl(item.url),title=item.title.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
      if(seenUrls.has(url)||seenTitles.has(title))return false;
      seenUrls.add(url);seenTitles.add(title);return true;
    }).slice(0,limit).map(({timestamp,...item})=>({...item,publishedAt:new Date(timestamp).toISOString(),date:new Date(timestamp).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'})}));
}
export async function fetchDirectFeeds(timeoutMs=7000){
  const results=await Promise.allSettled(feeds.map(async feed=>{
    const response=await fetch(feed.url,{headers:{'user-agent':'PHP2Shell Atlas/1.0'},signal:AbortSignal.timeout(timeoutMs)});
    if(!response.ok)throw Error(`${feed.name}: ${response.status}`);
    const xml=await response.text();
    if(!/<(?:rss|feed|rdf:RDF)\b/i.test(xml.slice(0,1500)))throw Error(`${feed.name}: invalid feed`);
    return parseFeed(xml,feed);
  }));
  return{items:results.flatMap(result=>result.status==='fulfilled'?result.value:[]),feedsAvailable:results.filter(result=>result.status==='fulfilled').length,feedsTotal:feeds.length};
}
export default async function handler(req,res){
  const [snapshotResult,feedResult]=await Promise.allSettled([
    fetch('https://raw.githubusercontent.com/Cqsi/php2shell-atlas/main/data/live-news.json',{signal:AbortSignal.timeout(3500)}).then(async response=>{
      if(!response.ok)throw Error(`Snapshot status ${response.status}`);
      return response.json();
    }),
    fetchDirectFeeds(),
  ]);
  const snapshot=snapshotResult.status==='fulfilled'&&Array.isArray(snapshotResult.value.items)?snapshotResult.value:{items:[]};
  const result=feedResult.status==='fulfilled'?feedResult.value:{items:[],feedsAvailable:0,feedsTotal:feeds.length};
  const snapshotItems=snapshot.items.filter(item=>item&&item.title&&item.url&&isRelevant(item.title,item.description)&&safeHttpsUrl(item.url))
    .map(item=>({...item,timestamp:Date.parse(item.publishedAt||item.date)})).filter(item=>Number.isFinite(item.timestamp));
  const items=cleanItems([...result.items,...snapshotItems]);
  res.setHeader('content-type','application/json; charset=utf-8');
  res.setHeader('cache-control','public, s-maxage=900, stale-while-revalidate=3600');
  res.status(200).send(JSON.stringify({items,checkedAt:new Date().toISOString(),feedsAvailable:result.feedsAvailable,feedsTotal:result.feedsTotal,snapshotCheckedAt:snapshot.checkedAt||null}));
}
