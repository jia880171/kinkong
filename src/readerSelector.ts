import * as readline from 'readline';
import { FileReader } from './fileReader';
import { RuleReader } from './ruleReader';



enum ReadersNum {
  'fileReader' = 1,
  'ruleReader'
}
const ReadersMap = new Map<string, number>(
  [['fileReader', 1],
  ['ruleReader', 2]]);

async function main(keys: Array<string>, values: Array<number>) {
  // Ask the question repeatedly
  while (true) {
    const userInput = await askQuestion();
    executeSelectedReaderByUserInput(userInput);
  }
}

function executeSelectedReaderByUserInput(userInput: string): void {
  switch (userInput) {
    case (ReadersNum.fileReader.toString()): {
      const fileReader = new FileReader();
      fileReader.execute('./files/IBBIAZ02BT');
      break;
    }
    case (ReadersNum.ruleReader.toString()): {
      const ruleReader = new RuleReader();
      ruleReader.execute('./files/testRule.csv');
      break;
    }
  }
}

async function askQuestion() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise<string>((resolve) => {
    const listString = createListString(keys, values);
    rl.question(`Which reader do you want to use? ${listString} (Type "exit" to quit) `, (answer) => {
      if (answer.toLowerCase() === 'exit') {
        rl.close();
        console.log('Exiting...');
        process.exit(0);
      }
      resolve(answer);
    });
  });
}

function createListString(keys: Array<string>, values: Array<number>): string {
  let listString = '';
  for (let i = 0; i < keys.length; i++) {
    listString += values[i].toString() + '.' + keys[i] + ' ';
  }
  return listString;
}

const keys = Array.from(ReadersMap.keys());
const values = Array.from(ReadersMap.values());

main(keys, values).catch((error) => {
  console.error('Error:', error);
});
