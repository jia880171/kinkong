import * as fs from 'fs';
import * as readline from 'readline';

class CsvLineReader {
  private filePath: string;
  private names: string[] = [];
  private JPNames: string[] = [];

  private requiredENames: string[] = [];
  private requiredJPNames: string[] = [];
  private requiredNameIndices: Number[] = [];

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  async readLines(): Promise<void> {
    const fileStream = fs.createReadStream(this.filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    for await (const line of rl) {
      const items = line.split(',');

      console.table(items);

      // get all names
      if ( !isNaN(parseInt(items[0])) ) {
        this.names.push(items[1]);
        this.JPNames.push(items[10]);
        console.log('===== JP: ', items[10]);
      }

      if (line.includes('●')) {
        this.requiredENames.push(items[1]);
        this.requiredJPNames.push(items[10]);
        // console.log('====== index:', parseInt(items[0]));
        this.requiredNameIndices.push(parseInt(items[0]) - 1);
      }
    }
  }

  writeToConsts(): void {
    const outputFilePath = './consts/required_names.ts';
    let dataToWrite = `export const requiredENames = ['${this.requiredENames.join("','")}'];`;

    // all names
    dataToWrite = dataToWrite + `\nexport const names = ['${this.names.join("','")}'];`;
    // all JPNames
    dataToWrite = dataToWrite + `\nexport const JPNames = ['${this.JPNames.join("','")}'];`;
    // requiredNameIndices
    dataToWrite = dataToWrite + `\nexport const requiredNameIndices = [${this.requiredNameIndices.join(",")}];`;
    // requiredJPNames
    dataToWrite = dataToWrite + `\nexport const requiredJPNames = ['${this.requiredJPNames.join("','")}'];`;

    fs.writeFileSync(outputFilePath, dataToWrite);
  }

  async generateRequiredNames(): Promise<void> {
    await this.readLines();
    this.writeToConsts();
  }
}

// Example usage
const csvReader = new CsvLineReader('./testRule.csv');
csvReader.generateRequiredNames();