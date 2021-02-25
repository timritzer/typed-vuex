"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useStore = exports.mapMutations = exports.mapGetters = exports.mapState = exports.mapActions = exports.mapper = exports.createStore = exports.createLogger = void 0;
var tslib_1 = require("tslib");
var vuex = tslib_1.__importStar(require("vuex"));
tslib_1.__exportStar(require("./typedVuexStore"), exports);
tslib_1.__exportStar(require("./ambientTypes"), exports);
var vuex_1 = require("vuex");
Object.defineProperty(exports, "createLogger", { enumerable: true, get: function () { return vuex_1.createLogger; } });
//Infer the store type when creating the store
function createStore(options) {
    return vuex.createStore(options);
}
exports.createStore = createStore;
//Works without declaration merging
function mapper() {
    var mapActions = vuex.mapActions;
    var mapState = vuex.mapState;
    var mapMutations = vuex.mapMutations;
    var mapGetters = vuex.mapGetters;
    return {
        mapActions: mapActions,
        mapState: mapState,
        mapMutations: mapMutations,
        mapGetters: mapGetters,
    };
}
exports.mapper = mapper;
exports.mapActions = vuex.mapActions;
exports.mapState = vuex.mapState;
exports.mapGetters = vuex.mapGetters;
exports.mapMutations = vuex.mapMutations;
exports.useStore = vuex.useStore;
