import MultiRegExp2 from './multiRegExp2'

let testCaseNr = 0;

const assertRegExpConversion = (initial, expected) => {
  const result = new MultiRegExp2(initial).regexp;

  testCaseNr++;
  if(result.source === expected) {
    console.log(`TestCase ${testCaseNr} passed: ${initial.source} => ${result.source} === ${expected}`);
  }
  else {
    console.error(`TestCase ${testCaseNr} failed: Asserting that ${initial.source} => ${result.source} === ${expected}`);
  }
};

const assertRegExpExecution = (func, expected) => {
  const result = func();

  const fStr = func.toString();
  const funcBody = fStr.substring(fStr.indexOf('{')+1, fStr.lastIndexOf('}')).trim();

  testCaseNr++;
  if(JSON.stringify(result) === JSON.stringify(expected)) {
    console.log(`TestCase ${testCaseNr} passed: ${funcBody} => ${JSON.stringify(expected)}`);
  }
  else {
    console.error(`TestCase ${testCaseNr} failed. Asserting that ${JSON.stringify(result)} === ${JSON.stringify(expected)}`);
  }
}

// ### Beginning of TestCases #########################################################################

assertRegExpConversion(/a(?:(b))?/, "(a)(?:(b))?");
assertRegExpConversion(/a(?:c(b))?/, "(a)(?:(c)(b))?");

assertRegExpExecution(
  () => new MultiRegExp2(/\(/).execForAllGroups("a(b"),
  [{match: "(", start: 1, end: 2}]
);
