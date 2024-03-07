import * as fs from 'fs';
import * as readline from 'readline';
import {JPNames, requiredJPNameMap } from './consts/required_names';

/**
 *
 * Represents a generic product interface where the keys are strings and the values are of type T.
 * @typeparam T - The type of the values stored in the product.
 */
interface Product<T> {
  [key: string]: { value: T; };
}
interface ProductsPayload {
  app: string;
  records: Array<Product<string>>;
}

export enum MODES {
  DEBUG = 1,
  REGULAR = 2
}

const MODE: MODES = MODES.DEBUG;

export class FileReader {
  private filePath: string = '';

  execute(filePath: string) {
    this.filePath = filePath;
    // const csvReader = new CsvLineReader('../files/IBBIAZ02BT');
    this.processData();
  };

  async readLines(): Promise<void> {
    const fileStream = fs.createReadStream(this.filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });
    const products: Array<Product<string>> = [];

    // Process each line from the input file
    for await (let line of rl) {

      // Extract individual items from the line
      const items = this.parseLineIntoItems(line);
      // Process the extracted items to create a product object
      const product: Product<string> = this.processProductData(items);

      // Depending on the mode of operation, either log and send individual products
      // or accumulate them and send in batches of 100
      switch (MODE) {
        case MODES.DEBUG:
          // Log the product details and send a POST request for the individual product
          console.table(product);
          const result = await this.sendPostRequest([product]);
          console.log('====== result for product: ', result);
          console.table(result.errors);
          break;

        case MODES.REGULAR:
          // Accumulate products to send in batches of 100
          products.push(product);

          // When the batch size reaches 100, send a POST request and reset the batch
          if (products.length === 100) {

            // Log the batch of products before sending the request
            for (const product of products) {
              console.table(product);
            }

            // Send a POST request for the batch of products
            const result = await this.sendPostRequest(products);
            console.log('====== result for 100: ', result);
            console.table(result.errors);

            // Reset the batch of products for the next iteration
            products.length = 0;
          }
      }


    }
  }

  /**
   * Parses a line of text into an array of items.
   * @param line The line of text to parse.
   * @returns An array of items parsed from the line.
   */
  parseLineIntoItems(line: string): Array<string> {
    // console.log('====== line: ', line);

    // Remove all double quotes in the line
    line = line.replace(/"/g, '');
    // Split the line into an array of items
    const items = line.split(',');
    return items;
  }

  /**
   * Processes an array of items into a Product object.
   * @param items Array of string items representing product data.
   * @returns A Product object containing processed product data.
   */
  processProductData(items: Array<string>): Product<string> {
    // Initialize an empty object to store processed product data
    const product: Record<string, any> = {};

    // Iterate through the required items
    for (const [name, index] of requiredJPNameMap) {

      // Check if the item exists
      if (items[index]) {
        // console.log(`====== ${ name } : `, items[requiredNameIndices[index]]);

        // Apply specific formatting for certain fields
        switch (name) {
          case "発売年月日":
            items[index] = this.formatDate(items[index]);
            break;
          case "終売年月日":
            items[index] = this.formatDate(items[index]);
            break;
          case "リニューアル年月日":
            items[index] = this.formatDate(items[index]);
            break;
          case "パックＪＡＮコード":
            if (items[index] === '0000000000000') {
              items[index] = '';
            }
            break;
          case "ケースＪＡＮコード":
            if (items[index] === '0000000000000') {
              items[index] = '';
            }
            break;
          case "ＩＴＦコード":
            items[index] = items[index].trim();
          default:
            break;
        }
        // Store the processed item in the product object
        product[name] = { value: items[index] };
      }
    }
    return product;
  }

  /**
   * Formats a date string from 'YYYYMMDD' to 'YYYY-MM-DD' format.
   * @param dateString The date string to be formatted.
   * @returns The formatted date string.
   * @throws Error if the input date string is not in the expected format or is invalid.
   */
  formatDate(dateString: string): string {
    // Check if the input date string length is not equal to 8
    if (dateString.length !== 8) {
      throw new Error('Invalid date string format. Expected format: YYYYMMDD');

      // Check if the input date string is '00000000', indicating a null or empty date
    } else if (dateString === '00000000') {
      return '';
    }

    // Extract year, month, and day from the input date string
    const year = dateString.slice(0, 4);
    const month = dateString.slice(4, 6);
    const day = dateString.slice(6, 8);

    // Concatenate the extracted parts to form the formatted date string
    const formattedDate = `${year}-${month}-${day}`;

    return formattedDate;
  }

  /**
   * Generates a payload object for sending products data to the server.
   * @param products An array of products to include in the payload.
   * @returns The generated payload object.
   */
  generateProductsPayload(products: Array<Product<string>>): ProductsPayload {
    // Construct the payload object with the specified application identifier and products array
    const payload = {
      app: '242',
      records: products
    };
    return payload;
  }

  /**
   * Sends a POST request to the specified API endpoint with the provided products.
   * @param products An array of products to send in the request.
   * @returns A Promise that resolves with the response data from the server.
   */
  async sendPostRequest(products: Array<Product<string>>): Promise<any> {
    // Define the API URL and API token
    const apiUrl = 'https://9w3ch4cil9qm.cybozu.com/k/v1/records.json';
    const apiToken = 'S0top1vvVKJK2yIzaynouW0TjbFQV45aya0sSQzQ';

    // Set up headers for the request
    const headers = new Headers({
      'Content-Type': 'application/json',
      'X-Cybozu-API-Token': apiToken,
    });

    // Send the POST request using fetch
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(this.generateProductsPayload(products)),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return error;
    }
  }

  /**
   * Logs the items array in a tabular format to the console.
   * 
   * @param items An array of strings representing the items to be displayed.
   */
  consoleProduct(items: string[]): void {
    const DeomoTable: string[][] = [];
    DeomoTable[0] = JPNames;
    DeomoTable[1] = items;
    const tableWidth = DeomoTable[0].length;
    for (let i = 0; i < tableWidth; i++) {
      if (i % 10 === 0) {
        const chunkData = DeomoTable.map(row => row.slice(i, i + 10));
        console.table(chunkData);
      }
    }
  }
  /**
   * Asynchronously processes the data by reading lines.
   * 
   * @returns A Promise that resolves once the data processing is complete.
   */
  async processData(): Promise<void> {
    await this.readLines();
  }
}

