import * as fs from 'fs';
import * as readline from 'readline';

const outputFilePath = '../consts/required_names.ts';
const ENNameIndex = 1;
const JPNameIndex = 10;

// If № starts from 1, set this to 1;
const indexAdjustment = 1;

export class RuleReader {
  private filePath: string = '';
  private ENNames: string[] = [];
  private JPNames: string[] = [];

  private requiredENames: string[] = [];
  private requiredJPNames: string[] = [];
  private requiredNameIndices: Number[] = [];

  execute(filePath: string) {
    this.filePath = filePath;
    // const csvReader = new CsvLineReader('../files/testRule.csv');
    this.generateRequiredNames();
  };

  parseLineIntoItems(line: string): Array<string> {
    const items = line.split(',');
    return items;
  }

  processItems(items: Array<string>, line: string): void {
    if (!isNaN(parseInt(items[0]))) {
      this.ENNames.push(items[ENNameIndex]);
      this.JPNames.push(items[JPNameIndex]);

      // Set requireds
      if (line.includes('●')) {
        this.requiredENames.push(items[1]);
        this.requiredJPNames.push(items[10]);
        this.requiredNameIndices.push(parseInt(items[0]) - indexAdjustment);
      }
    }
  }

  processLines(lines: Array<string>): void {
    for (const line of lines) {
      const items = this.parseLineIntoItems(line);
      this.processItems(items, line);
    }
  }

  async readLines(): Promise<Array<string>> {
    const fileStream = fs.createReadStream(this.filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });
    const lines = [];
    for await (const line of rl) {
      lines.push(line);
    }
    return lines;
  }

  writeProcessedDataToConstantsFile(): void {
    let dataToWrite = `export const requiredENames = ['${this.requiredENames.join("','")}'];`;

    // all names
    dataToWrite = dataToWrite + `\nexport const names = ['${this.ENNames.join("','")}'];`;
    // all JPNames
    dataToWrite = dataToWrite + `\nexport const JPNames = ['${this.JPNames.join("','")}'];`;
    // requiredNameIndices
    dataToWrite = dataToWrite + `\nexport const indicesOfRequiredJPNames = [${this.requiredNameIndices.join(",")}];`;
    // requiredJPNames
    dataToWrite = dataToWrite + `\nexport const requiredJPNames = ['${this.requiredJPNames.join("','")}'];`;
    // map
    dataToWrite = dataToWrite + `\nexport const requiredJPNameMap = new Map<string, number>(${this.generateKeyValueString(this.requiredJPNames, this.requiredNameIndices)});`;

    fs.writeFileSync(outputFilePath, dataToWrite);
  }

  generateKeyValueString(names: Array<string>, indices: Array<Number>): string {
    let keyPairString = '[';
    for (let i = 0; i < names.length; i++) {
      keyPairString = keyPairString + '[\'' + names[i] + '\',' + indices[i] + '],';
    };
    keyPairString = keyPairString.slice(0, -1);
    keyPairString = keyPairString + ']';
    return keyPairString;
  }

  async generateRequiredNames(): Promise<void> {
    // Read lines
    const lines = await this.readLines();
    // Process lines
    this.processLines(lines);
    // Write processed data to const file
    this.writeProcessedDataToConstantsFile();
  }
}

// // Example usage
// const csvReader = new CsvLineReader('../files/testRule.csv');
// csvReader.generateRequiredNames();