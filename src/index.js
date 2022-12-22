import fetch from "node-fetch";
import cheerio from "cheerio";
import urlParser from "url";
import fs from "fs";

const url = process.argv[2];
const maxDepth = parseInt(process.argv[3]);
const { host, protocol } = urlParser.parse(url);
const seenUrls = {};

async function crawl(currentPageUrl, currentDepth) {
  if (seenUrls[currentPageUrl]) return;
  if (currentDepth === maxDepth) return;
  seenUrls[currentPageUrl] = true;

  let data = { results: [] };
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
    if (currentDepth < maxDepth) {
      crawl(urls[i], currentDepth++);
    } else {
      writeJsonToFile(data);
      return console.log("crawl end.");
    }
    // console.log(urls[i],'42');
  }
  // console.log(seenUrls);
}

const startCrawler = async () => {
  await crawl(url, 0);
};
startCrawler();

const filterValidUrls = (links) => {
  // console.log(links,'53');
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
    });
};

const writeJsonToFile = (data) => {
  const isExist = fs.existsSync("./results.json");
  if (!isExist) {
    return fs.appendFile("./results.json", JSON.stringify(data), (err) => {
      if (err) return console.log(err);
    });
  } else {
    fs.readFile("./results.json", "utf-8", (err, fileContent) => {
      if (err) return console.log(err);
      if (!fileContent) return console.log("no data");
      let obj = JSON.parse(fileContent);
      obj.results.push(...data.results);
      fs.writeFile("./results.json", JSON.stringify(obj), (err) => {
        if (err) return err;
      });
    });
  }
};
