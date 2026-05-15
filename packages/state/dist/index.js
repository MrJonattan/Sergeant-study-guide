"use strict";
/**
 * @nypd-sergeant/state
 *
 * Shared state management for NYPD Sergeant Study Guide.
 * Provides unified interfaces for progress tracking, quiz state, and settings
 * across web (localStorage) and mobile (Hive) platforms.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HiveAdapter = exports.LocalStorageAdapter = void 0;
var localstorage_1 = require("./adapters/localstorage");
Object.defineProperty(exports, "LocalStorageAdapter", { enumerable: true, get: function () { return localstorage_1.LocalStorageAdapter; } });
var hive_1 = require("./adapters/hive");
Object.defineProperty(exports, "HiveAdapter", { enumerable: true, get: function () { return hive_1.HiveAdapter; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsd0RBQThEO0FBQXJELG1IQUFBLG1CQUFtQixPQUFBO0FBQzVCLHdDQUE4QztBQUFyQyxtR0FBQSxXQUFXLE9BQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBueXBkLXNlcmdlYW50L3N0YXRlXG4gKlxuICogU2hhcmVkIHN0YXRlIG1hbmFnZW1lbnQgZm9yIE5ZUEQgU2VyZ2VhbnQgU3R1ZHkgR3VpZGUuXG4gKiBQcm92aWRlcyB1bmlmaWVkIGludGVyZmFjZXMgZm9yIHByb2dyZXNzIHRyYWNraW5nLCBxdWl6IHN0YXRlLCBhbmQgc2V0dGluZ3NcbiAqIGFjcm9zcyB3ZWIgKGxvY2FsU3RvcmFnZSkgYW5kIG1vYmlsZSAoSGl2ZSkgcGxhdGZvcm1zLlxuICovXG5cbmV4cG9ydCB7IExvY2FsU3RvcmFnZUFkYXB0ZXIgfSBmcm9tICcuL2FkYXB0ZXJzL2xvY2Fsc3RvcmFnZSc7XG5leHBvcnQgeyBIaXZlQWRhcHRlciB9IGZyb20gJy4vYWRhcHRlcnMvaGl2ZSc7XG5cbmV4cG9ydCB0eXBlIHtcbiAgU3RhdGVBZGFwdGVyLFxuICBQcm9ncmVzcyxcbiAgQ2hhcHRlclByb2dyZXNzLFxuICBRdWl6U2NvcmUsXG4gIFN0cmVhayxcbiAgUXVpelN0YXRlLFxuICBGbGFzaGNhcmRTdGF0ZSxcbiAgU3R1ZHlTZXR0aW5ncyxcbn0gZnJvbSAnLi90eXBlcyc7XG4iXX0=