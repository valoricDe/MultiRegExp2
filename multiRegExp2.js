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
	start += groupsAdded*2;
	end += groupsAdded*2;
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
	const regexString = regex.toString();
	const tester = /(\(\?)|(\()|([^\\]\))/g; // regexp is greedy so it should match (? before ( right?

	const modifier = regexString.substring(regexString.lastIndexOf(regexString[0])+1);
	const strippedString = regexString.substr(1, regexString.lastIndexOf(regexString[0])-1);
	let modifiedRegex = strippedString;

	let lastGroupStartPosition = -1;
	let lastGroupEndPosition = -1;
	let groupsAdded = 0;
	let groupCount = 0;
	let matchArr;
	const nonGroupPositions = [];
	const groupPositions = [];
	const groupNumber = [];
	const currentLengthIndexes = [];
	const groupIndexMapper = {};
	const previousGroupsForGroup = {};
	while ((matchArr = tester.exec(strippedString)) !== null ) {
		if(matchArr[1]) { // non capturing group
			nonGroupPositions.push(matchArr.index);
		}
		else if(matchArr[2]) { // capturing group
			let index = matchArr.index;
			let lastGroupPosition = Math.max(lastGroupStartPosition, lastGroupEndPosition);
			if(lastGroupPosition < index - 1) {
				modifiedRegex = addGroupToRegexString(modifiedRegex, lastGroupPosition + 1, index - 1, groupsAdded);
				groupsAdded++;
				lastGroupEndPosition = index - 1; // imaginary position as it is not in regex but modifiedRegex
				currentLengthIndexes.push(groupCount + groupsAdded);
			}

			groupCount++;
			lastGroupStartPosition = index;
			groupPositions.push(index);
			groupNumber.push(groupCount + groupsAdded);
			groupIndexMapper[groupCount] = groupCount + groupsAdded;
			previousGroupsForGroup[groupCount] = currentLengthIndexes.slice();
		}
		else if(matchArr[3]) { // closing bracket
			if( (groupPositions.length && !nonGroupPositions.length) ||
				groupPositions[groupPositions.length-1] > nonGroupPositions[nonGroupPositions.length-1]
			) {
				let index = matchArr.index + 1; // +1 as second character of regexp is closing bracket
				if(lastGroupStartPosition < lastGroupEndPosition && lastGroupEndPosition < index - 1) {
					modifiedRegex = addGroupToRegexString(modifiedRegex, lastGroupEndPosition + 1, index - 1, groupsAdded);
					groupsAdded++;
					//lastGroupEndPosition = matchArr.index - 1; will be set anyway
					currentLengthIndexes.push(groupCount + groupsAdded);
				}

				groupPositions.pop();
				lastGroupEndPosition = index;
				currentLengthIndexes.push(groupNumber.pop());
			}
			else if(nonGroupPositions.length) {
				nonGroupPositions.pop();
			}
		}
	}

	return {regexp: new RegExp(modifiedRegex, modifier), groupIndexMapper, previousGroupsForGroup};
}

function MultiRegExp2(baseRegExp) {
	let filled = fillGroups(baseRegExp);
	this.regexp = filled.regexp;
	this.groupIndexMapper = filled.groupIndexMapper;
	this.previousGroupsForGroup = filled.previousGroupsForGroup;
}

MultiRegExp2.prototype = new RegExp();
MultiRegExp2.prototype.execForAllGroups = function(string) {
	let matches = RegExp.prototype.exec.call(this.regexp, string);
	if(!matches) return matches;
	let firstIndex = matches.index;

	return Object.keys(this.groupIndexMapper).map((group) => {
		let mapped = this.groupIndexMapper[group];
		let r = {
			match:  matches[mapped],
			start:  firstIndex + this.previousGroupsForGroup[group].reduce((sum, i) => sum + matches[i].length, 0),
		};
		r.end = r.start + matches[mapped].length - 1;

		return r;
	});
};
MultiRegExp2.prototype.execForGroup = function(string, group) {
	let matches = RegExp.prototype.exec.call(this.regexp, string);
	if(!matches) return matches;
	let firstIndex = matches.index;

	let mapped = this.groupIndexMapper[group];
	let r = {
		match:  matches[mapped],
		start:  firstIndex + this.previousGroupsForGroup[group].reduce((sum, i) => sum + matches[i].length, 0),
	};
	r.end = r.start + matches[mapped].length - 1;

	return r;
};
