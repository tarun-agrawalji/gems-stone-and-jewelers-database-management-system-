/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/dashboard/route";
exports.ids = ["app/api/dashboard/route"];
exports.modules = {

/***/ "(rsc)/./app/api/dashboard/route.ts":
/*!************************************!*\
  !*** ./app/api/dashboard/route.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/prisma */ \"(rsc)/./lib/prisma.ts\");\n\n\nasync function GET() {\n    try {\n        const [totalLots, totalSubLots, totalPurchases, totalSales, subLotsByStatus, recentLedger, purchaseAmount, saleAmount] = await Promise.all([\n            _lib_prisma__WEBPACK_IMPORTED_MODULE_1__.prisma.lot.count(),\n            _lib_prisma__WEBPACK_IMPORTED_MODULE_1__.prisma.subLot.count(),\n            _lib_prisma__WEBPACK_IMPORTED_MODULE_1__.prisma.purchase.count(),\n            _lib_prisma__WEBPACK_IMPORTED_MODULE_1__.prisma.sale.count(),\n            _lib_prisma__WEBPACK_IMPORTED_MODULE_1__.prisma.subLot.groupBy({\n                by: [\n                    \"status\"\n                ],\n                _count: true\n            }),\n            _lib_prisma__WEBPACK_IMPORTED_MODULE_1__.prisma.stockLedger.findMany({\n                orderBy: {\n                    createdAt: \"desc\"\n                },\n                take: 10,\n                include: {\n                    lot: true,\n                    subLot: true\n                }\n            }),\n            _lib_prisma__WEBPACK_IMPORTED_MODULE_1__.prisma.purchase.aggregate({\n                _sum: {\n                    totalCost: true\n                }\n            }),\n            _lib_prisma__WEBPACK_IMPORTED_MODULE_1__.prisma.sale.aggregate({\n                _sum: {\n                    finalBillAmount: true\n                }\n            })\n        ]);\n        const pendingRejections = await _lib_prisma__WEBPACK_IMPORTED_MODULE_1__.prisma.purchase.count({\n            where: {\n                rejectionDate: {\n                    not: null\n                },\n                rejectionStatus: \"PENDING\"\n            }\n        });\n        const mfgRejectionPending = await _lib_prisma__WEBPACK_IMPORTED_MODULE_1__.prisma.manufacturing.count({\n            where: {\n                status: \"REJECTED\",\n                returnToManufacturer: false\n            }\n        });\n        const stats = {\n            totalLots,\n            totalSubLots,\n            totalPurchases,\n            totalSales,\n            subLotsByStatus,\n            recentLedger,\n            totalPurchaseValue: purchaseAmount._sum.totalCost || 0,\n            totalSaleValue: saleAmount._sum.finalBillAmount || 0,\n            pendingRejections: pendingRejections + mfgRejectionPending\n        };\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json(stats);\n    } catch (e) {\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Failed to fetch dashboard data\"\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2Rhc2hib2FyZC9yb3V0ZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7QUFBd0Q7QUFDbEI7QUFFL0IsZUFBZUU7SUFDcEIsSUFBSTtRQUNGLE1BQU0sQ0FDSkMsV0FDQUMsY0FDQUMsZ0JBQ0FDLFlBQ0FDLGlCQUNBQyxjQUNBQyxnQkFDQUMsV0FDRCxHQUFHLE1BQU1DLFFBQVFDLEdBQUcsQ0FBQztZQUNwQlgsK0NBQU1BLENBQUNZLEdBQUcsQ0FBQ0MsS0FBSztZQUNoQmIsK0NBQU1BLENBQUNjLE1BQU0sQ0FBQ0QsS0FBSztZQUNuQmIsK0NBQU1BLENBQUNlLFFBQVEsQ0FBQ0YsS0FBSztZQUNyQmIsK0NBQU1BLENBQUNnQixJQUFJLENBQUNILEtBQUs7WUFDakJiLCtDQUFNQSxDQUFDYyxNQUFNLENBQUNHLE9BQU8sQ0FBQztnQkFBRUMsSUFBSTtvQkFBQztpQkFBUztnQkFBRUMsUUFBUTtZQUFLO1lBQ3JEbkIsK0NBQU1BLENBQUNvQixXQUFXLENBQUNDLFFBQVEsQ0FBQztnQkFDMUJDLFNBQVM7b0JBQUVDLFdBQVc7Z0JBQU87Z0JBQzdCQyxNQUFNO2dCQUNOQyxTQUFTO29CQUFFYixLQUFLO29CQUFNRSxRQUFRO2dCQUFLO1lBQ3JDO1lBQ0FkLCtDQUFNQSxDQUFDZSxRQUFRLENBQUNXLFNBQVMsQ0FBQztnQkFBRUMsTUFBTTtvQkFBRUMsV0FBVztnQkFBSztZQUFFO1lBQ3RENUIsK0NBQU1BLENBQUNnQixJQUFJLENBQUNVLFNBQVMsQ0FBQztnQkFBRUMsTUFBTTtvQkFBRUUsaUJBQWlCO2dCQUFLO1lBQUU7U0FDekQ7UUFFRCxNQUFNQyxvQkFBb0IsTUFBTTlCLCtDQUFNQSxDQUFDZSxRQUFRLENBQUNGLEtBQUssQ0FBQztZQUNwRGtCLE9BQU87Z0JBQUVDLGVBQWU7b0JBQUVDLEtBQUs7Z0JBQUs7Z0JBQUdDLGlCQUFpQjtZQUFVO1FBQ3BFO1FBRUEsTUFBTUMsc0JBQXNCLE1BQU1uQywrQ0FBTUEsQ0FBQ29DLGFBQWEsQ0FBQ3ZCLEtBQUssQ0FBQztZQUMzRGtCLE9BQU87Z0JBQUVNLFFBQVE7Z0JBQVlDLHNCQUFzQjtZQUFNO1FBQzNEO1FBRUEsTUFBTUMsUUFBUTtZQUNackM7WUFDQUM7WUFDQUM7WUFDQUM7WUFDQUM7WUFDQUM7WUFDQWlDLG9CQUFvQmhDLGVBQWVtQixJQUFJLENBQUNDLFNBQVMsSUFBSTtZQUNyRGEsZ0JBQWdCaEMsV0FBV2tCLElBQUksQ0FBQ0UsZUFBZSxJQUFJO1lBQ25EQyxtQkFBbUJBLG9CQUFvQks7UUFDekM7UUFFQSxPQUFPcEMscURBQVlBLENBQUMyQyxJQUFJLENBQUNIO0lBQzNCLEVBQUUsT0FBT0ksR0FBRztRQUNWLE9BQU81QyxxREFBWUEsQ0FBQzJDLElBQUksQ0FBQztZQUFFRSxPQUFPO1FBQWlDLEdBQUc7WUFBRVAsUUFBUTtRQUFJO0lBQ3RGO0FBQ0YiLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcRGVsbFxcRGVza3RvcFxcZ2Vtc3RvbmUxXFxhcHBcXGFwaVxcZGFzaGJvYXJkXFxyb3V0ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZXh0UmVxdWVzdCwgTmV4dFJlc3BvbnNlIH0gZnJvbSBcIm5leHQvc2VydmVyXCI7XHJcbmltcG9ydCB7IHByaXNtYSB9IGZyb20gXCJAL2xpYi9wcmlzbWFcIjtcclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBHRVQoKSB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IFtcclxuICAgICAgdG90YWxMb3RzLFxyXG4gICAgICB0b3RhbFN1YkxvdHMsXHJcbiAgICAgIHRvdGFsUHVyY2hhc2VzLFxyXG4gICAgICB0b3RhbFNhbGVzLFxyXG4gICAgICBzdWJMb3RzQnlTdGF0dXMsXHJcbiAgICAgIHJlY2VudExlZGdlcixcclxuICAgICAgcHVyY2hhc2VBbW91bnQsXHJcbiAgICAgIHNhbGVBbW91bnQsXHJcbiAgICBdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xyXG4gICAgICBwcmlzbWEubG90LmNvdW50KCksXHJcbiAgICAgIHByaXNtYS5zdWJMb3QuY291bnQoKSxcclxuICAgICAgcHJpc21hLnB1cmNoYXNlLmNvdW50KCksXHJcbiAgICAgIHByaXNtYS5zYWxlLmNvdW50KCksXHJcbiAgICAgIHByaXNtYS5zdWJMb3QuZ3JvdXBCeSh7IGJ5OiBbXCJzdGF0dXNcIl0sIF9jb3VudDogdHJ1ZSB9KSxcclxuICAgICAgcHJpc21hLnN0b2NrTGVkZ2VyLmZpbmRNYW55KHtcclxuICAgICAgICBvcmRlckJ5OiB7IGNyZWF0ZWRBdDogXCJkZXNjXCIgfSxcclxuICAgICAgICB0YWtlOiAxMCxcclxuICAgICAgICBpbmNsdWRlOiB7IGxvdDogdHJ1ZSwgc3ViTG90OiB0cnVlIH0sXHJcbiAgICAgIH0pLFxyXG4gICAgICBwcmlzbWEucHVyY2hhc2UuYWdncmVnYXRlKHsgX3N1bTogeyB0b3RhbENvc3Q6IHRydWUgfSB9KSxcclxuICAgICAgcHJpc21hLnNhbGUuYWdncmVnYXRlKHsgX3N1bTogeyBmaW5hbEJpbGxBbW91bnQ6IHRydWUgfSB9KSxcclxuICAgIF0pO1xyXG5cclxuICAgIGNvbnN0IHBlbmRpbmdSZWplY3Rpb25zID0gYXdhaXQgcHJpc21hLnB1cmNoYXNlLmNvdW50KHtcclxuICAgICAgd2hlcmU6IHsgcmVqZWN0aW9uRGF0ZTogeyBub3Q6IG51bGwgfSwgcmVqZWN0aW9uU3RhdHVzOiBcIlBFTkRJTkdcIiB9LFxyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgbWZnUmVqZWN0aW9uUGVuZGluZyA9IGF3YWl0IHByaXNtYS5tYW51ZmFjdHVyaW5nLmNvdW50KHtcclxuICAgICAgd2hlcmU6IHsgc3RhdHVzOiBcIlJFSkVDVEVEXCIsIHJldHVyblRvTWFudWZhY3R1cmVyOiBmYWxzZSB9LFxyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3Qgc3RhdHMgPSB7XHJcbiAgICAgIHRvdGFsTG90cyxcclxuICAgICAgdG90YWxTdWJMb3RzLFxyXG4gICAgICB0b3RhbFB1cmNoYXNlcyxcclxuICAgICAgdG90YWxTYWxlcyxcclxuICAgICAgc3ViTG90c0J5U3RhdHVzLFxyXG4gICAgICByZWNlbnRMZWRnZXIsXHJcbiAgICAgIHRvdGFsUHVyY2hhc2VWYWx1ZTogcHVyY2hhc2VBbW91bnQuX3N1bS50b3RhbENvc3QgfHwgMCxcclxuICAgICAgdG90YWxTYWxlVmFsdWU6IHNhbGVBbW91bnQuX3N1bS5maW5hbEJpbGxBbW91bnQgfHwgMCxcclxuICAgICAgcGVuZGluZ1JlamVjdGlvbnM6IHBlbmRpbmdSZWplY3Rpb25zICsgbWZnUmVqZWN0aW9uUGVuZGluZyxcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHN0YXRzKTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogXCJGYWlsZWQgdG8gZmV0Y2ggZGFzaGJvYXJkIGRhdGFcIiB9LCB7IHN0YXR1czogNTAwIH0pO1xyXG4gIH1cclxufVxyXG4iXSwibmFtZXMiOlsiTmV4dFJlc3BvbnNlIiwicHJpc21hIiwiR0VUIiwidG90YWxMb3RzIiwidG90YWxTdWJMb3RzIiwidG90YWxQdXJjaGFzZXMiLCJ0b3RhbFNhbGVzIiwic3ViTG90c0J5U3RhdHVzIiwicmVjZW50TGVkZ2VyIiwicHVyY2hhc2VBbW91bnQiLCJzYWxlQW1vdW50IiwiUHJvbWlzZSIsImFsbCIsImxvdCIsImNvdW50Iiwic3ViTG90IiwicHVyY2hhc2UiLCJzYWxlIiwiZ3JvdXBCeSIsImJ5IiwiX2NvdW50Iiwic3RvY2tMZWRnZXIiLCJmaW5kTWFueSIsIm9yZGVyQnkiLCJjcmVhdGVkQXQiLCJ0YWtlIiwiaW5jbHVkZSIsImFnZ3JlZ2F0ZSIsIl9zdW0iLCJ0b3RhbENvc3QiLCJmaW5hbEJpbGxBbW91bnQiLCJwZW5kaW5nUmVqZWN0aW9ucyIsIndoZXJlIiwicmVqZWN0aW9uRGF0ZSIsIm5vdCIsInJlamVjdGlvblN0YXR1cyIsIm1mZ1JlamVjdGlvblBlbmRpbmciLCJtYW51ZmFjdHVyaW5nIiwic3RhdHVzIiwicmV0dXJuVG9NYW51ZmFjdHVyZXIiLCJzdGF0cyIsInRvdGFsUHVyY2hhc2VWYWx1ZSIsInRvdGFsU2FsZVZhbHVlIiwianNvbiIsImUiLCJlcnJvciJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./app/api/dashboard/route.ts\n");

/***/ }),

/***/ "(rsc)/./lib/prisma.ts":
/*!***********************!*\
  !*** ./lib/prisma.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   prisma: () => (/* binding */ prisma)\n/* harmony export */ });\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_0__);\n\nconst globalForPrisma = globalThis;\nconst prisma = globalForPrisma.prisma ?? new _prisma_client__WEBPACK_IMPORTED_MODULE_0__.PrismaClient({\n    log: [\n        \"query\"\n    ]\n});\nif (true) globalForPrisma.prisma = prisma;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvcHJpc21hLnRzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUE4QztBQUU5QyxNQUFNQyxrQkFBa0JDO0FBSWpCLE1BQU1DLFNBQ1hGLGdCQUFnQkUsTUFBTSxJQUN0QixJQUFJSCx3REFBWUEsQ0FBQztJQUNmSSxLQUFLO1FBQUM7S0FBUTtBQUNoQixHQUFHO0FBRUwsSUFBSUMsSUFBcUMsRUFBRUosZ0JBQWdCRSxNQUFNLEdBQUdBIiwic291cmNlcyI6WyJDOlxcVXNlcnNcXERlbGxcXERlc2t0b3BcXGdlbXN0b25lMVxcbGliXFxwcmlzbWEudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUHJpc21hQ2xpZW50IH0gZnJvbSBcIkBwcmlzbWEvY2xpZW50XCI7XHJcblxyXG5jb25zdCBnbG9iYWxGb3JQcmlzbWEgPSBnbG9iYWxUaGlzIGFzIHVua25vd24gYXMge1xyXG4gIHByaXNtYTogUHJpc21hQ2xpZW50IHwgdW5kZWZpbmVkO1xyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IHByaXNtYSA9XHJcbiAgZ2xvYmFsRm9yUHJpc21hLnByaXNtYSA/P1xyXG4gIG5ldyBQcmlzbWFDbGllbnQoe1xyXG4gICAgbG9nOiBbXCJxdWVyeVwiXSxcclxuICB9KTtcclxuXHJcbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gXCJwcm9kdWN0aW9uXCIpIGdsb2JhbEZvclByaXNtYS5wcmlzbWEgPSBwcmlzbWE7XHJcbiJdLCJuYW1lcyI6WyJQcmlzbWFDbGllbnQiLCJnbG9iYWxGb3JQcmlzbWEiLCJnbG9iYWxUaGlzIiwicHJpc21hIiwibG9nIiwicHJvY2VzcyIsImVudiIsIk5PREVfRU5WIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./lib/prisma.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fdashboard%2Froute&page=%2Fapi%2Fdashboard%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fdashboard%2Froute.ts&appDir=C%3A%5CUsers%5CDell%5CDesktop%5Cgemstone1%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CDell%5CDesktop%5Cgemstone1&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!***********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fdashboard%2Froute&page=%2Fapi%2Fdashboard%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fdashboard%2Froute.ts&appDir=C%3A%5CUsers%5CDell%5CDesktop%5Cgemstone1%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CDell%5CDesktop%5Cgemstone1&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \***********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_Dell_Desktop_gemstone1_app_api_dashboard_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/dashboard/route.ts */ \"(rsc)/./app/api/dashboard/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/dashboard/route\",\n        pathname: \"/api/dashboard\",\n        filename: \"route\",\n        bundlePath: \"app/api/dashboard/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\Dell\\\\Desktop\\\\gemstone1\\\\app\\\\api\\\\dashboard\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_Dell_Desktop_gemstone1_app_api_dashboard_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZkYXNoYm9hcmQlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmRhc2hib2FyZCUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmRhc2hib2FyZCUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNEZWxsJTVDRGVza3RvcCU1Q2dlbXN0b25lMSU1Q2FwcCZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzJnJvb3REaXI9QyUzQSU1Q1VzZXJzJTVDRGVsbCU1Q0Rlc2t0b3AlNUNnZW1zdG9uZTEmaXNEZXY9dHJ1ZSZ0c2NvbmZpZ1BhdGg9dHNjb25maWcuanNvbiZiYXNlUGF0aD0mYXNzZXRQcmVmaXg9Jm5leHRDb25maWdPdXRwdXQ9JnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQStGO0FBQ3ZDO0FBQ3FCO0FBQ2tCO0FBQy9GO0FBQ0E7QUFDQTtBQUNBLHdCQUF3Qix5R0FBbUI7QUFDM0M7QUFDQSxjQUFjLGtFQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxZQUFZO0FBQ1osQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLFFBQVEsc0RBQXNEO0FBQzlEO0FBQ0EsV0FBVyw0RUFBVztBQUN0QjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQzBGOztBQUUxRiIsInNvdXJjZXMiOlsiIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFJvdXRlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1tb2R1bGVzL2FwcC1yb3V0ZS9tb2R1bGUuY29tcGlsZWRcIjtcbmltcG9ydCB7IFJvdXRlS2luZCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3JvdXRlLWtpbmRcIjtcbmltcG9ydCB7IHBhdGNoRmV0Y2ggYXMgX3BhdGNoRmV0Y2ggfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvcGF0Y2gtZmV0Y2hcIjtcbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCJDOlxcXFxVc2Vyc1xcXFxEZWxsXFxcXERlc2t0b3BcXFxcZ2Vtc3RvbmUxXFxcXGFwcFxcXFxhcGlcXFxcZGFzaGJvYXJkXFxcXHJvdXRlLnRzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS9kYXNoYm9hcmQvcm91dGVcIixcbiAgICAgICAgcGF0aG5hbWU6IFwiL2FwaS9kYXNoYm9hcmRcIixcbiAgICAgICAgZmlsZW5hbWU6IFwicm91dGVcIixcbiAgICAgICAgYnVuZGxlUGF0aDogXCJhcHAvYXBpL2Rhc2hib2FyZC9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIkM6XFxcXFVzZXJzXFxcXERlbGxcXFxcRGVza3RvcFxcXFxnZW1zdG9uZTFcXFxcYXBwXFxcXGFwaVxcXFxkYXNoYm9hcmRcXFxccm91dGUudHNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyB3b3JrQXN5bmNTdG9yYWdlLCB3b3JrVW5pdEFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuZnVuY3Rpb24gcGF0Y2hGZXRjaCgpIHtcbiAgICByZXR1cm4gX3BhdGNoRmV0Y2goe1xuICAgICAgICB3b3JrQXN5bmNTdG9yYWdlLFxuICAgICAgICB3b3JrVW5pdEFzeW5jU3RvcmFnZVxuICAgIH0pO1xufVxuZXhwb3J0IHsgcm91dGVNb2R1bGUsIHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fdashboard%2Froute&page=%2Fapi%2Fdashboard%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fdashboard%2Froute.ts&appDir=C%3A%5CUsers%5CDell%5CDesktop%5Cgemstone1%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CDell%5CDesktop%5Cgemstone1&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "../app-render/after-task-async-storage.external":
/*!***********************************************************************************!*\
  !*** external "next/dist/server/app-render/after-task-async-storage.external.js" ***!
  \***********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/after-task-async-storage.external.js");

/***/ }),

/***/ "../app-render/work-async-storage.external":
/*!*****************************************************************************!*\
  !*** external "next/dist/server/app-render/work-async-storage.external.js" ***!
  \*****************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-async-storage.external.js");

/***/ }),

/***/ "./work-unit-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/app-render/work-unit-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");

/***/ }),

/***/ "@prisma/client":
/*!*********************************!*\
  !*** external "@prisma/client" ***!
  \*********************************/
/***/ ((module) => {

"use strict";
module.exports = require("@prisma/client");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fdashboard%2Froute&page=%2Fapi%2Fdashboard%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fdashboard%2Froute.ts&appDir=C%3A%5CUsers%5CDell%5CDesktop%5Cgemstone1%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CDell%5CDesktop%5Cgemstone1&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();