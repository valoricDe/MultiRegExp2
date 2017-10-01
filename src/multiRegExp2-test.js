import MultiRegExp2 from './multiRegExp2'

let testCaseNr = 0;

const testCase = (initFunc, resultFunc, expected) => {
  const intermediate = initFunc();
  const result = resultFunc(intermediate);

  const fStr = resultFunc.toString();
  const funcBody = fStr.substring(fStr.indexOf('{')+1, fStr.lastIndexOf('}')).trim();

  testCaseNr++;
  if(result === expected) {
    console.log(`TestCase ${testCaseNr} passed: ${funcBody} => ${result} === ${expected}`);
  }
  else {
    console.error(`TestCase ${testCaseNr} failed. Asserting that ${funcBody} => ${result} === ${expected}`);
  }
}

// ### Beginning of TestCases #########################################################################

testCase(
  () => new MultiRegExp2(/\(/),
  r => r.regexp.source,
  "\("
);

testCase(
  () => new MultiRegExp2(/a(?:(b))?/),
  r => r.regexp.source,
  "(a)(?:(b))?"
);
