/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["testpackage"] = factory();
	else
		root["TEST"] = factory();
})((typeof self!='undefined'?self:this), () => {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./main.ts":
/*!*****************!*\
  !*** ./main.ts ***!
  \*****************/
/***/ (() => {

eval("/*import {clues} from \"./data/clues\";\nimport {type CompassStep} from \"./model/clues\";\n\nexport function export_path(p): string {\n    return export_string(\"path\", 0, p.steps)\n}\n\nfunction path() {\n    if (window) return window.location.origin + window.location.pathname\n    else return \"https://leridon.github.io/rs3scantrainer/\"\n}\n\nexport function to_path(path): string {\n    let url = \"https://leridon.github.io/rs3scantrainer/\" + \"?load_path_editor\"\n    if (path.target) url += `&path_target=${encodeURI(JSON.stringify(path.target))}`\n    if (path.start_state) url += `&path_start_state=${encodeURI(JSON.stringify(path.start_state))}`\n    if (path.steps.length > 0) url += `&path_steps=${encodeURI(export_path(path))}`\n\n    return url\n}\n\nfunction dig_area(spot) {\n    return {\n        topleft: {x: spot.x - 1, y: spot.y + 1},\n        botright: {x: spot.x + 1, y: spot.y - 1},\n        level: spot.level\n    }\n}\n\n{\n    let compass = clues.find(c => c.id == 399) as CompassStep\n\n    let string = \"\"\n    string += \"Compass spots\"\n    string += \"x,y,floor,link\"\n\n    compass.solution.candidates.forEach(spot => {\n        let query_link = to_path({\n            target: dig_area(spot),\n            steps: []\n        })\n\n        string += `${spot.x}, ${spot.y}, ${spot.level}, ${query_link}\\n`\n    })\n\n    console.log(string)\n}\n*/ \n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9tYWluLnRzLmpzIiwibWFwcGluZ3MiOiJBQUFBLFVBQVUsT0FBTztBQUNqQixRQUFRLGtCQUFrQjs7QUFFMUI7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSw0Q0FBNEMsdUNBQXVDO0FBQ25GLHNEQUFzRCw0Q0FBNEM7QUFDbEcscURBQXFELDZCQUE2Qjs7QUFFbEY7QUFDQTs7QUFFQTtBQUNBO0FBQ0Esa0JBQWtCLDZCQUE2QjtBQUMvQyxtQkFBbUIsNkJBQTZCO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7O0FBRVQscUJBQXFCLE9BQU8sSUFBSSxPQUFPLElBQUksV0FBVyxJQUFJLFdBQVc7QUFDckUsS0FBSzs7QUFFTDtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9URVNULy4vbWFpbi50cz80Y2IzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qaW1wb3J0IHtjbHVlc30gZnJvbSBcIi4vZGF0YS9jbHVlc1wiO1xuaW1wb3J0IHt0eXBlIENvbXBhc3NTdGVwfSBmcm9tIFwiLi9tb2RlbC9jbHVlc1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gZXhwb3J0X3BhdGgocCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGV4cG9ydF9zdHJpbmcoXCJwYXRoXCIsIDAsIHAuc3RlcHMpXG59XG5cbmZ1bmN0aW9uIHBhdGgoKSB7XG4gICAgaWYgKHdpbmRvdykgcmV0dXJuIHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4gKyB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWVcbiAgICBlbHNlIHJldHVybiBcImh0dHBzOi8vbGVyaWRvbi5naXRodWIuaW8vcnMzc2NhbnRyYWluZXIvXCJcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRvX3BhdGgocGF0aCk6IHN0cmluZyB7XG4gICAgbGV0IHVybCA9IFwiaHR0cHM6Ly9sZXJpZG9uLmdpdGh1Yi5pby9yczNzY2FudHJhaW5lci9cIiArIFwiP2xvYWRfcGF0aF9lZGl0b3JcIlxuICAgIGlmIChwYXRoLnRhcmdldCkgdXJsICs9IGAmcGF0aF90YXJnZXQ9JHtlbmNvZGVVUkkoSlNPTi5zdHJpbmdpZnkocGF0aC50YXJnZXQpKX1gXG4gICAgaWYgKHBhdGguc3RhcnRfc3RhdGUpIHVybCArPSBgJnBhdGhfc3RhcnRfc3RhdGU9JHtlbmNvZGVVUkkoSlNPTi5zdHJpbmdpZnkocGF0aC5zdGFydF9zdGF0ZSkpfWBcbiAgICBpZiAocGF0aC5zdGVwcy5sZW5ndGggPiAwKSB1cmwgKz0gYCZwYXRoX3N0ZXBzPSR7ZW5jb2RlVVJJKGV4cG9ydF9wYXRoKHBhdGgpKX1gXG5cbiAgICByZXR1cm4gdXJsXG59XG5cbmZ1bmN0aW9uIGRpZ19hcmVhKHNwb3QpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB0b3BsZWZ0OiB7eDogc3BvdC54IC0gMSwgeTogc3BvdC55ICsgMX0sXG4gICAgICAgIGJvdHJpZ2h0OiB7eDogc3BvdC54ICsgMSwgeTogc3BvdC55IC0gMX0sXG4gICAgICAgIGxldmVsOiBzcG90LmxldmVsXG4gICAgfVxufVxuXG57XG4gICAgbGV0IGNvbXBhc3MgPSBjbHVlcy5maW5kKGMgPT4gYy5pZCA9PSAzOTkpIGFzIENvbXBhc3NTdGVwXG5cbiAgICBsZXQgc3RyaW5nID0gXCJcIlxuICAgIHN0cmluZyArPSBcIkNvbXBhc3Mgc3BvdHNcIlxuICAgIHN0cmluZyArPSBcIngseSxmbG9vcixsaW5rXCJcblxuICAgIGNvbXBhc3Muc29sdXRpb24uY2FuZGlkYXRlcy5mb3JFYWNoKHNwb3QgPT4ge1xuICAgICAgICBsZXQgcXVlcnlfbGluayA9IHRvX3BhdGgoe1xuICAgICAgICAgICAgdGFyZ2V0OiBkaWdfYXJlYShzcG90KSxcbiAgICAgICAgICAgIHN0ZXBzOiBbXVxuICAgICAgICB9KVxuXG4gICAgICAgIHN0cmluZyArPSBgJHtzcG90Lnh9LCAke3Nwb3QueX0sICR7c3BvdC5sZXZlbH0sICR7cXVlcnlfbGlua31cXG5gXG4gICAgfSlcblxuICAgIGNvbnNvbGUubG9nKHN0cmluZylcbn1cbiovIFxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./main.ts\n");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval-source-map devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./main.ts"]();
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});