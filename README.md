# Web Crawler CLI

The Web Crawler CLI is a Node.js application that allows you to crawl a given webpage for images and follow links to other pages to continue the crawl. The crawler can crawl up to a specified depth and saves the results in a JSON file.

## Usage

To use the Web Crawler CLI, navigate to the project directory and run the following command:


Replace `<start_url: string>` with the URL of the webpage you want to crawl, and `<depth: number>` with the maximum depth of pages to crawl. For example, to crawl the webpage at `https://example.com` to a depth of 3 pages, run the following command:

node crawler.js https://example.com 3

## Output

The crawler saves the results in a `results.json` file in the following format:

{
results: [
{
imageUrl: string,
sourceUrl: string, // the page url this image was found on
depth: number // the depth of the source at which this image was found on
}
]
}

Each item in the `results` array contains the URL of an image, the URL of the page where the image was found, and the depth of the page where the image was found.

## Contributing

Contributions to the Web Crawler CLI are welcome. To contribute, please fork the repository, create a new branch, make your changes, and submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
