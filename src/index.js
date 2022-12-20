import fetch from "node-fetch";
import cheerio from "cheerio";

const url = process.argv[2];
const maxDepth = process.argv[3];
console.log(url)
console.log(maxDepth)
async function crawl( currentPageUrl, currentDepth ) {
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

}

const startCrawler = async () => {
  await crawl(url, 0);
};
startCrawler()



// import fetch from "node-fetch";
// import cheerio from "cheerio";
// import fs from "fs";
// import path from "path";
// import urlParser from "url";

// let results = [{}];
// const seenUrls = {};

// const getUrl = (link, host, protocol) => {
//   if (link.includes("http")) {
//     return link;
//   } else if (link.startsWith("/")) {
//     return `${protocol}//${host}${link}`;
//   } else {
//     return `${protocol}//${host}${link}`;
//   }
// };

// const crawl = async ({ url, depth }) => {
//   console.log(depth);
//   if (seenUrls[url]) return;

//   seenUrls[url] = true;
//   const { host, protocol } = urlParser.parse(url);

//   const response = await fetch(url);
//   const html = await response.text();
//   const $ = cheerio.load(html);
//   let links = $("a")
//     .map((i, link) => link.attribs.href)
//     .get();
// console.log(links);
//   const newList = links.slice(0,depth);
//   console.log(newList);
//   const imageUrls = $("img")
//     .map((i, link) => link.attribs.src)
//     .get();

//   console.log("crawling", url);
//   imageUrls.forEach((imageUrl) => {
//     const filename = path.resolve(imageUrl);
//     results.push({
//       imageUrl: `${filename}`,
//       sourceUrl: `${url}`,
//       depth: depth,
//     });
//     writeJsonToFile(results);
//   });

//   newList
//     // .filter((link) => link.includes(host))
//     .forEach((link) => {
//       crawl({
//         url: getUrl(link, host, protocol),
//         depth: Object.keys(seenUrls).length,
//       });
//     });
// };
// crawl({
//   url: "https://www.sdpgroups.com",
//   depth: 3,
// });
// const file = './results.json'

// const writeJsonToFile = (jsonContent) => {

//   if (fs.existsSync(file)) {
//     try {
//       const data = JSON.parse(jsonContent);
//     fs.appendFile(`./results.json`, data, (err) => {
//     if (err) return console.log(err);
//   });
//     } catch (error) {
//       console.log(error, 'error 71');
//     }
//     console.log('file exists');
//   } else {
//     fs.writeFile(`./results.json`, data,'utf-8', (err) => {
//       if (err) return console.log(err);
//     });
//   }
//   fs.appendFile(`./results.txt`, JSON.stringify(jsonContent), (err) => {
//     if (err) return console.log(err);
//   });
//    fs.readFile("./results.json", "utf-8", (err, data) => {
//     if (err) return console.log(err, "err 70");
//     if (data.length == 0) {
//       fs.appendFile(`./results.json`, JSON.stringify(jsonContent), (err) => {
//         if (err) return console.log(err);
//       });
//     } else {
//       return console.log("crawl finished");
//     }
//   });
// };
