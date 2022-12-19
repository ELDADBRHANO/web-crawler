import fetch from "node-fetch";
import  cheerio from "cheerio";
import  fs from "fs";
import  path from "path";
import  urlParser from "url";

let results = [{}]
const seenUrls = {};
const getUrl = (link, host, protocol) => {
  if (link.includes("http")) {
    return link;
  } else if (link.startsWith("/")) {
    return `${protocol}//${host}${link}`;
  } else {
    return `${protocol}//${host}${link}`;
  }
};

const crawl = async ({ url, ignore ,depth}) => {
  if (seenUrls[url]) return;
  
  seenUrls[url] = true;
  const { host, protocol } = urlParser.parse(url);

  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);
  let links = $("a")
    .map((i, link) => link.attribs.href)
    .get();
  
  const newList = links.slice(0,depth)
  const imageUrls = $("img")
    .map((i, link) => link.attribs.src)
    .get();
  
  // console.log("crawling", url);
  imageUrls.forEach((imageUrl) => {
    fetch(imageUrl).then((response) => {
      const filename = path.resolve(imageUrl);
      console.log("image", imageUrl);
      // const dest = fs.createWriteStream(`${filename}`)
      // dest.once('error',()=>{
      //   return filename+1;
      // })
      // response.body.pipe(dest);
      
      results.push({
        "imageUrl": `${filename}`,
        "sourceUrl" : `${url}`,
        "depth": depth
    })
    console.log("res",results)

    // writeJsonToFile(results)
  });
});

newList
.filter((link) => link.includes(host) && !link.includes(ignore))
.forEach((link) => {
    crawl({
      url: getUrl(link, host, protocol),
      ignore,
      depth : Object.keys(seenUrls).length
    });
});

}
  crawl({
  url: "https://www.sdpgroups.com",
  depth : 3
  
});

const writeJsonToFile = (jsonContent) => {
  fs.appendFile(`./results.json`, JSON.stringify(jsonContent), () => {
  });
};

