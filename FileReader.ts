import * as fs from 'fs';
import * as readline from 'readline';
import { requiredNames, requiredNamesIndices, names, JPNames } from './consts/required_names';

class CsvLineReader {
  private filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  async readLines(): Promise<void> {
    const fileStream = fs.createReadStream(this.filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    // Process each line
    for await (const line of rl) {
      const items = line.split(',');

      // this.consoleProduct(items);

      const product: Record<string, string> = {};
      for (let [index, name] of requiredNames.entries()) {
        // console.log(`====== ${name}: ${items[requiredNamesIndices[index]]}`);
        product[name] = items[requiredNamesIndices[index]];
      }

      console.log('====== product: ');
      console.table(product);
    }
  }

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


  async processData(): Promise<void> {
    await this.readLines();
  }
}

// Example usage
const csvReader = new CsvLineReader('./21.csv');
csvReader.processData();