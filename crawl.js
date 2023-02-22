import fetch from "node-fetch";
import cheerio from "cheerio";
import urlParser from "url";
import fs from "fs/promises";

const seenUrls = {};

async function crawl(currentPageUrl, currentDepth, maxDepth) {
  if (seenUrls[currentPageUrl] && currentDepth === maxDepth) return;
  seenUrls[currentPageUrl] = true;
  const { host, protocol } = urlParser.parse(currentPageUrl);

  let data = { results: [] };
  const sourcePage = await fetch(currentPageUrl);
  const html = await sourcePage.text();
  const $ = cheerio.load(html);
  const currentDepthUrls = $("a")
    .map((i, link) => link.attribs.href)
    .get();

  const images = $("img")
    .map((i, link) => {
      if (link.attribs.src?.startsWith("//")) {
        return `${protocol}${link.attribs.src}`;
      } else {
        return link.attribs.src;
      }
    })
    .get();

  for (let i = 0; i < images.length; i++) {
    data.results.push({
      imageUrl: images[i],
      sourceUrl: currentPageUrl,
      depth: currentDepth,
    });
  }

  const urls = await filterValidUrls(currentDepthUrls, host, protocol);
  for (let i = 0; i < urls.length; i++) {
    if (currentDepth < maxDepth) {
      crawl(urls[i], ++currentDepth);
    } else {
      writeJsonToFile(data);
      return console.log("crawl end.");
    }    
  }
}

const startCrawler = async () => {
  const url = process.argv[2];
  const maxDepth = parseInt(process.argv[3]);
  await crawl(url, 0, maxDepth);
};

startCrawler();

const filterValidUrls = async (links, host, protocol) => {
  return links
    .filter((link) => {
      return (
        link.startsWith("http") || link.startsWith("/") || link.startsWith("//")
      );
    })
    .map((link) => {
      if (link.startsWith("/") || link.startsWith("//")) {
        return `${protocol}//${host}${link}`;
      } else return link;
    });
};

const writeJsonToFile = async (data) => {
  const filePath = "./results.json";
  let existingData = [];
  try {
    const fileContent = await fs.readFile(filePath, "utf-8");
    existingData = JSON.parse(fileContent).results;
  } catch (err) {console.log(err);}

  const newData = [...existingData, ...data.results];
  const json = { results: newData };
  json.results.sort((a, b) => a.depth - b.depth);
  await fs.writeFile(filePath, JSON.stringify(json));
};


