import fetch from "node-fetch";
import cheerio from "cheerio";
import urlParser from "url";
import fs from "fs";

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
    .map((i, link) => link.attribs.src)
    .get();

  for (let i = 0; i < images.length; i++) {
    data.results.push({
      imageUrl: images[i],
      sourceUrl: currentPageUrl,
      depth: currentDepth,
    });
  }

  const urls = filterValidUrls(currentDepthUrls,host,protocol);
  for (let i = 0; i < urls.length; i++) {
    if (currentDepth < maxDepth) {
      crawl(urls[i], currentDepth++);
    } else {
      writeJsonToFile(data);
      return console.log("crawl end.");
    }
    // console.log(urls[i],'-- url[i]');
  }
  // console.log(seenUrls);
}

const startCrawler = async () => {
  const url = process.argv[2];
  const maxDepth = parseInt(process.argv[3]);
  await crawl(url, 0, maxDepth);
};
startCrawler();

const filterValidUrls = (links,host,protocol) => {
  // console.log(links,'links');
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
