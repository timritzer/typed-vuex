import * as vuex from "vuex";
export * from "./typedVuexStore";
export * from "./ambientTypes";
export { createLogger, ActionContext, ActionTree, Module as ModuleDefinition, } from "vuex";
//Infer the store type when creating the store
export function createStore(options) {
    return vuex.createStore(options);
}
export function useStore(injectKey) {
    return vuex.useStore(injectKey);
}
//Works without declaration merging
export function mapper() {
    const mapActions = vuex.mapActions;
    const mapState = vuex.mapState;
    const mapMutations = vuex.mapMutations;
    const mapGetters = vuex.mapGetters;
    return {
        mapActions,
        mapState,
        mapMutations,
        mapGetters,
    };
}
