'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by velten on 11.02.17.
 */

/**
 * Adds brackets before and after a part of string
 * @param str string the hole regex string
 * @param start int marks the position where ( should be inserted
 * @param end int marks the position where ) should be inserted
 * @param groupsAdded int defines the offset to the original string because of inserted brackets
 * @return {string}
 */
function addGroupToRegexString(str, start, end, groupsAdded) {
  start += groupsAdded * 2;
  end += groupsAdded * 2;
  return str.substring(0, start) + '(' + str.substring(start, end + 1) + ')' + str.substring(end + 1);
}

/**
 * converts the given regex to a regex where all not captured string are going to be captured
 * it along sides generates a mapper which maps the original group index to the shifted group offset and
 * generates a list of groups indexes (including new generated capturing groups)
 * which have been closed before a given group index (unshifted)
 *
 * Example:
 * regexp: /a(?: )bc(def(ghi)xyz)/g => /(a(?: )bc)((def)(ghi)(xyz))/g
 * groupIndexMapper: {'1': 2, '2', 4}
 * previousGroupsForGroup: {'1': [1], '2': [1, 3]}
 *
 * @param regex RegExp
 * @return {{regexp: RegExp, groupIndexMapper: {}, previousGroupsForGroup: {}}}
 */
function fillGroups(regex) {
  var regexString = void 0;
  var modifier = void 0;
  if (regex.source && regex.flags) {
    regexString = regex.source;
    modifier = regex.flags;
  } else {
    regexString = regex.toString();
    modifier = regexString.substring(regexString.lastIndexOf(regexString[0]) + 1); // sometimes order matters ;)
    regexString = regexString.substr(1, regex.toString().lastIndexOf(regexString[0]) - 1);
  }
  // regexp is greedy so it should match (? before ( right?
  // brackets may be not quoted by \
  // closing bracket may look like: ), )+, )+?, ){1,}?, ){1,1111}?
  var tester = /(\\\()|(\\\))|(\(\?)|(\()|(\)(?:\{\d+,?\d*}|[*+?])?\??)/g;

  var modifiedRegex = regexString;

  var lastGroupStartPosition = -1;
  var lastGroupEndPosition = -1;
  var lastNonGroupStartPosition = -1;
  var lastNonGroupEndPosition = -1;
  var groupsAdded = 0;
  var groupCount = 0;
  var matchArr = void 0;
  var nonGroupPositions = [];
  var groupPositions = [];
  var groupNumber = [];
  var currentLengthIndexes = [];
  var groupIndexMapper = {};
  var previousGroupsForGroup = {};
  while ((matchArr = tester.exec(regexString)) !== null) {
    if (matchArr[1] || matchArr[2]) {// ignore escaped brackets \(, \)

    }
    if (matchArr[3]) {
      // non capturing group (?
      var index = matchArr.index + matchArr[0].length - 1;

      lastNonGroupStartPosition = index;
      nonGroupPositions.push(index);
    } else if (matchArr[4]) {
      // capturing group (
      var _index = matchArr.index + matchArr[0].length - 1;

      var lastGroupPosition = Math.max(lastGroupStartPosition, lastGroupEndPosition);

      // if a (? is found add ) before it
      if (lastNonGroupStartPosition > lastGroupPosition) {
        // check if between ) of capturing group lies a non capturing group
        if (lastGroupPosition < lastNonGroupEndPosition) {
          // add groups for x1 and x2 on (?:()x1)x2(?:...
          if (lastNonGroupEndPosition - 1 - (lastGroupPosition + 1) > 0) {
            modifiedRegex = addGroupToRegexString(modifiedRegex, lastGroupPosition + 1, lastNonGroupEndPosition - 1, groupsAdded);
            groupsAdded++;
            lastGroupEndPosition = lastNonGroupEndPosition - 1; // imaginary position as it is not in regex but modifiedRegex
            currentLengthIndexes.push(groupCount + groupsAdded);
          }

          if (lastNonGroupStartPosition - 1 - (lastNonGroupEndPosition + 1) > 0) {
            modifiedRegex = addGroupToRegexString(modifiedRegex, lastNonGroupEndPosition + 1, lastNonGroupStartPosition - 2, groupsAdded);
            groupsAdded++;
            lastGroupEndPosition = lastNonGroupStartPosition - 1; // imaginary position as it is not in regex but modifiedRegex
            currentLengthIndexes.push(groupCount + groupsAdded);
          }
        } else {
          modifiedRegex = addGroupToRegexString(modifiedRegex, lastGroupPosition + 1, lastNonGroupStartPosition - 2, groupsAdded);
          groupsAdded++;
          lastGroupEndPosition = lastNonGroupStartPosition - 1; // imaginary position as it is not in regex but modifiedRegex
          currentLengthIndexes.push(groupCount + groupsAdded);
        }

        // if necessary also add group between (? and opening bracket
        if (_index > lastNonGroupStartPosition + 2) {
          modifiedRegex = addGroupToRegexString(modifiedRegex, lastNonGroupStartPosition + 2, _index - 1, groupsAdded);
          groupsAdded++;
          lastGroupEndPosition = _index - 1; // imaginary position as it is not in regex but modifiedRegex
          currentLengthIndexes.push(groupCount + groupsAdded);
        }
      } else if (lastGroupPosition < _index - 1) {
        modifiedRegex = addGroupToRegexString(modifiedRegex, lastGroupPosition + 1, _index - 1, groupsAdded);
        groupsAdded++;
        lastGroupEndPosition = _index - 1; // imaginary position as it is not in regex but modifiedRegex
        currentLengthIndexes.push(groupCount + groupsAdded);
      }

      groupCount++;
      lastGroupStartPosition = _index;
      groupPositions.push(_index);
      groupNumber.push(groupCount + groupsAdded);
      groupIndexMapper[groupCount] = groupCount + groupsAdded;
      previousGroupsForGroup[groupCount] = currentLengthIndexes.slice();
    } else if (matchArr[5]) {
      // closing bracket ), )+, )+?, ){1,}?, ){1,1111}?
      var _index2 = matchArr.index + matchArr[0].length - 1;

      if (groupPositions.length && !nonGroupPositions.length || groupPositions[groupPositions.length - 1] > nonGroupPositions[nonGroupPositions.length - 1]) {
        (function () {
          if (lastGroupStartPosition < lastGroupEndPosition && lastGroupEndPosition < _index2 - 1) {
            modifiedRegex = addGroupToRegexString(modifiedRegex, lastGroupEndPosition + 1, _index2 - 1, groupsAdded);
            groupsAdded++;
            //lastGroupEndPosition = index - 1; will be set anyway
            currentLengthIndexes.push(groupCount + groupsAdded);
          }

          groupPositions.pop();
          lastGroupEndPosition = _index2;

          var toPush = groupNumber.pop();
          currentLengthIndexes.push(toPush);
          currentLengthIndexes = currentLengthIndexes.filter(function (index) {
            return index <= toPush;
          });
        })();
      } else if (nonGroupPositions.length) {
        nonGroupPositions.pop();
        lastNonGroupEndPosition = _index2;
      }
    }
  }

  return { regexp: new RegExp(modifiedRegex, modifier), groupIndexMapper: groupIndexMapper, previousGroupsForGroup: previousGroupsForGroup };
}

var MultiRegExp2 = function () {
  function MultiRegExp2(baseRegExp) {
    _classCallCheck(this, MultiRegExp2);

    var _fillGroups = fillGroups(baseRegExp),
        regexp = _fillGroups.regexp,
        groupIndexMapper = _fillGroups.groupIndexMapper,
        previousGroupsForGroup = _fillGroups.previousGroupsForGroup;

    this.regexp = regexp;
    this.groupIndexMapper = groupIndexMapper;
    this.previousGroupsForGroup = previousGroupsForGroup;
  }

  _createClass(MultiRegExp2, [{
    key: 'execForAllGroups',
    value: function execForAllGroups(string, includeFullMatch) {
      var matches = RegExp.prototype.exec.call(this.regexp, string);
      if (!matches) return matches;
      var firstIndex = matches.index;
      var indexMapper = includeFullMatch ? Object.assign({ 0: 0 }, this.groupIndexMapper) : this.groupIndexMapper;
      var previousGroups = includeFullMatch ? Object.assign({ 0: [] }, this.previousGroupsForGroup) : this.previousGroupsForGroup;

      return Object.keys(indexMapper).map(function (group) {
        var mapped = indexMapper[group];
        var r = {
          match: matches[mapped],
          start: firstIndex + previousGroups[group].reduce(function (sum, i) {
            return sum + (matches[i] ? matches[i].length : 0);
          }, 0)
        };
        r.end = r.start + (matches[mapped] ? matches[mapped].length : 0);

        return r;
      });
    }
  }, {
    key: 'execForGroup',
    value: function execForGroup(string, group) {
      var matches = RegExp.prototype.exec.call(this.regexp, string);
      if (!matches) return matches;
      var firstIndex = matches.index;

      var mapped = group == 0 ? 0 : this.groupIndexMapper[group];
      var previousGroups = group == 0 ? [] : this.previousGroupsForGroup[group];
      var r = {
        match: matches[mapped],
        start: firstIndex + previousGroups.reduce(function (sum, i) {
          return sum + (matches[i] ? matches[i].length : 0);
        }, 0)
      };
      r.end = r.start + (matches[mapped] ? matches[mapped].length : 0);

      return r;
    }
  }]);

  return MultiRegExp2;
}();

exports.default = MultiRegExp2;
//# sourceMappingURL=multiRegExp2.js.map