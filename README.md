# MultiRegExp2

This class gets all matches, with start and end position, within the string, for a given regexp.

From high level the source code is:
 
 1. Ensuring that each character is captured by a group: eg. /ab(cd)ef/ => /(ab)(cd)(ef)/
 2. Calling exec on the converted regexp with a given string
 3. Summing lengths of previous groups for start position of current group, add length of current group for end position 

## API

MultiRegexp2(baseRegExp: Regexp)
---
will setup parsed regexp, returns instance

execForAllGroups(string: string, includeFullMatch: boolean)
---
will find all matching groups, returns array<{match: string, start: Number, end: Number}>

execForGroup(string: string, group: Number)
---
will find match for group number, returns {match: string, start: Number, end: Number}

## Usage
```
let regex = /a(?: )bc(def(ghi)xyz)/g;
let regex2 = new MultiRegExp2(regex);

let matches = regex2.execForAllGroups('ababa bcdefghixyzXXXX');
console.log(matches);
// reset to beginning: regex2.regexp.lastIndex = 0;
```

Will output:
```
[ { match: 'defghixyz', start: 8, end: 17 },
  { match: 'ghi', start: 11, end: 14 } ]
```

If you want to include the full match (group 0) then add true as the second parameter.

Also available:
```
let matches = regex2.execForGroup('ababa bcdefghixyzXXXX', 2);
= { match: 'ghi', start: 11, end: 14 }
```


## Contribution

to compile the module to ES5 run `npm install && npm run build && npm run test`
