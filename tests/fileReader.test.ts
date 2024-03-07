import { CsvLineReader } from "../src/csv-reader/src/components/ReaderSelector/fileReader";


const testFilePath = '../files/test'

describe("Math functions", () => {
  it('should parse a line into an array of items', () => {
    const csvReader = new CsvLineReader(testFilePath);

    // Arrange
    const line = '"item1","item2","item3"';

    // Act
    const result = csvReader.parseLineIntoItems(line);

    // Assert
    expect(result).toEqual(['item1', 'item2', 'item3']);
  });

});