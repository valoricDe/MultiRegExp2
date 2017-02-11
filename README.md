# MultiRegExp2

## Usage
```
let regex = /a(?: )bc(def(ghi)xyz)/g;
let regex2 = new MultiRegExp2(regex);

let matches = regex2.execForAllGroups('ababa bcdefghixyzXXXX'));
console.log(matches);
```

Will output:
```
[ { match: 'defghixyz', start: 8, end: 17 },
  { match: 'ghi', start: 11, end: 14 } ]
```