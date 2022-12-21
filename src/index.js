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
  
  console.log(maxDepth);
  seenUrls[currentPageUrl] = true;
  let results = [];

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
    results.push({
      imageUrl: images[i],
      sourceUrl: url,
      depth: currentDepth,
    });
  }

  // console.log(currentDepthUrls);
  const urls = filterValidUrls(currentDepthUrls);

  for (let i = 0; i < urls.length; i++) {
    console.log("urls",urls, "currentDepth", currentDepth);
    if(maxDepth===currentDepth) break;
    crawl(urls[i], currentDepth++);
  }
  // console.log(seenUrls);
}

const startCrawler = async () => {
  await crawl(url, 0);
};
startCrawler();

const filterValidUrls = (links) => {
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


