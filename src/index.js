import fetch from "node-fetch";
import cheerio from "cheerio";
import urlParser from "url";

const url = process.argv[2];
const { host, protocol } = urlParser.parse(url);
const maxDepth = process.argv[3];
console.log(url);
console.log(maxDepth);
async function crawl(currentPageUrl, currentDepth) {
  if(currentDepth === maxDepth) return;
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
  console.log(currentDepthUrls);
  const urls = filterValidUrls(currentDepthUrls);
  console.log(urls, "urls");

  for (let i = 0; i < urls.length; i++) {
    crawl(urls[i],currentDepth++)

  }
}



const startCrawler = async () => {
  await crawl(url, 0);
};
startCrawler();



const filterValidUrls = (links) => {
  return links
    .filter((link) => {
      return link.includes("http") || link.startsWith("/") || link.startsWith("?");
    })
    .map((link) => {
      if (link.startsWith("/")) {
        return `${protocol}//${host}${link}`;
      } else if (link.startsWith("?")) {
        return `${protocol}//${host}${link}`;
      } else return link;
      // TODO filter visited links;
    });


};
