import fetch from "node-fetch";
import cheerio from "cheerio";
import urlParser from "url";
import fs from "fs";

const url = process.argv[2];
const { host, protocol } = urlParser.parse(url);
const maxDepth = parseInt(process.argv[3]);
const seenUrls = {};

async function crawl(currentPageUrl, currentDepth) {
  if (seenUrls[currentPageUrl]) return;
  
  seenUrls[currentPageUrl] = true;
  // console.log(seenUrls);
  let data = {results:[]};
  
  const sourcePage = await fetch(currentPageUrl);
  const html = await sourcePage.text();
  const $ = cheerio.load(html);
  const currentDepthUrls = $("a")
  .map((i, link) => link.attribs.href)
  .get();
  const images = $("img")
    .map((i, link) => link.attribs.src)
    .get();
  for (let i = 0; i < images.length; i++) {
    data.results.push({
      imageUrl: images[i],
      sourceUrl: currentPageUrl,
      depth: currentDepth,
    });
  }

  
  const urls = filterValidUrls(currentDepthUrls);
  for (let i = 0; i < urls.length; i++) {
    // console.log("urls",urls, "currentDepth", currentDepth);
    if(maxDepth===currentDepth){
      writeJsonToFile(data)
      break;
    } ;
    crawl(urls[i], currentDepth++);
    // console.log(urls[i],'45');
  }
  // console.log(seenUrls);
}

const startCrawler = async () => {
  await crawl(url, 0);
};
startCrawler();

const filterValidUrls = (links) => {
  // console.log(links,'56');
  return links
    .filter((link) => {
      return (
        link.includes("http") || link.startsWith("/") || link.startsWith("?")
      );
    })
    .map((link) => {
      if (link.startsWith("/")) {
        return `${protocol}//${host}${link}`;
      } else if (link.startsWith("?")) {
        return `${protocol}//${host}${link}`;
      } else return link;
      // TODO filter visited links;
    })
    
};




const writeJsonToFile =(data)=>{
  fs.appendFile('./results.json',JSON.stringify(data),(err)=>{
    if(err) return console.log(err);
  })
}