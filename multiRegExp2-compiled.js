'use strict';

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
	var regexString = regex.toString();
	// regexp is greedy so it should match (? before ( right?
	// brackets may be not quoted by \
	// closing bracket may look like: ), )+, )+?, ){1,}?, ){1,1111}?
	var tester = /((?!\\)\(\?)|((?!\\)\()|((?!\\)\)(?:\{\d+,?\d*}|[*+?])?\??)/g;

	var modifier = regexString.substring(regexString.lastIndexOf(regexString[0]) + 1);
	var strippedString = regexString.substr(1, regexString.lastIndexOf(regexString[0]) - 1);
	var modifiedRegex = strippedString;

	var lastGroupStartPosition = -1;
	var lastGroupEndPosition = -1;
	var groupsAdded = 0;
	var groupCount = 0;
	var matchArr = void 0;
	var nonGroupPositions = [];
	var groupPositions = [];
	var groupNumber = [];
	var currentLengthIndexes = [];
	var groupIndexMapper = {};
	var previousGroupsForGroup = {};
	while ((matchArr = tester.exec(strippedString)) !== null) {
		if (matchArr[1]) {
			// non capturing group
			var index = matchArr.index + matchArr[0].length - 1;
			nonGroupPositions.push(index);
		} else if (matchArr[2]) {
			// capturing group
			var _index = matchArr.index + matchArr[0].length - 1;
			var lastGroupPosition = Math.max(lastGroupStartPosition, lastGroupEndPosition);

			if (lastGroupPosition < _index - 1) {
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
		} else if (matchArr[3]) {
			// closing bracket
			var _index2 = matchArr.index + matchArr[0].length - 1;

			if (groupPositions.length && !nonGroupPositions.length || groupPositions[groupPositions.length - 1] > nonGroupPositions[nonGroupPositions.length - 1]) {
				if (lastGroupStartPosition < lastGroupEndPosition && lastGroupEndPosition < _index2 - 1) {
					modifiedRegex = addGroupToRegexString(modifiedRegex, lastGroupEndPosition + 1, _index2 - 1, groupsAdded);
					groupsAdded++;
					//lastGroupEndPosition = index - 1; will be set anyway
					currentLengthIndexes.push(groupCount + groupsAdded);
				}

				groupPositions.pop();
				lastGroupEndPosition = _index2;
				currentLengthIndexes.push(groupNumber.pop());
			} else if (nonGroupPositions.length) {
				nonGroupPositions.pop();
			}
		}
	}

	return { regexp: new RegExp(modifiedRegex, modifier), groupIndexMapper: groupIndexMapper, previousGroupsForGroup: previousGroupsForGroup };
}

function MultiRegExp2(baseRegExp) {
	var filled = fillGroups(baseRegExp);
	this.regexp = filled.regexp;
	this.groupIndexMapper = filled.groupIndexMapper;
	this.previousGroupsForGroup = filled.previousGroupsForGroup;
}

MultiRegExp2.prototype = new RegExp();
MultiRegExp2.prototype.execForAllGroups = function (string) {
	var _this = this;

	var matches = RegExp.prototype.exec.call(this.regexp, string);
	if (!matches) return matches;
	var firstIndex = matches.index;

	return Object.keys(this.groupIndexMapper).map(function (group) {
		var mapped = _this.groupIndexMapper[group];
		var r = {
			match: matches[mapped],
			start: firstIndex + _this.previousGroupsForGroup[group].reduce(function (sum, i) {
				return sum + (matches[i] ? matches[i].length : 0);
			}, 0)
		};
		r.end = r.start + (matches[mapped] ? matches[mapped].length - 1 : 0);

		return r;
	});
};
MultiRegExp2.prototype.execForGroup = function (string, group) {
	var matches = RegExp.prototype.exec.call(this.regexp, string);
	if (!matches) return matches;
	var firstIndex = matches.index;

	var mapped = this.groupIndexMapper[group];
	var r = {
		match: matches[mapped],
		start: firstIndex + this.previousGroupsForGroup[group].reduce(function (sum, i) {
			return sum + (matches[i] ? matches[i].length : 0);
		}, 0)
	};
	r.end = r.start + (matches[mapped] ? matches[mapped].length - 1 : 0);

	return r;
};

//# sourceMappingURL=multiRegExp2-compiled.js.map