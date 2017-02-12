# MultiRegExp2

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