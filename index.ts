import { InjectionKey } from "vue";
import * as vuex from "vuex";

import { IfDefined, Filter } from "type-helpers"
import {
  Namespaces,
  MappersForNamespace,
  MapState,
  MapMutations,
  MapGetters,
  MapActions,
  AnyTypedStore,
  TypedStore,
  TypedModule,
  AnyTypedModule,
} from "./typedVuexStore";

export * from "./typedVuexStore";

export { createLogger, ActionContext, ActionTree, Module as  ModuleDefinition } from "vuex";

export function createStore<
	TOptions extends StoreOptions<any>,
	TModules extends Exclude<TOptions["modules"], undefined>,
	TCombinedModules extends UnionToIntersection<TModules[keyof TModules]> & AnyTypedModule<TRootState>,
	TRootState extends TOptions["state"]
	>(options: TOptions) {
	return vuex.createStore(
		options as vuex.StoreOptions<TRootState>
	) as unknown as TypedStore<TRootState, TCombinedModules>; //TODO: Root Stuff
}

export function useStore<TStore extends AnyTypedStore>(
  injectKey?: InjectionKey<TStore> | string
) {
  return vuex.useStore(injectKey);
}

export function createNamespacedHelpers<
  TStore extends AnyTypedStore,
  TNamespace extends Namespaces<TStore>
>(store: TStore, namespace: TNamespace) {
  return (vuex.createNamespacedHelpers(
	namespace
  ) as unknown) as MappersForNamespace<TStore, TNamespace>;
}
export const mapState = function <TStore extends AnyTypedStore>(
  store: TStore,
  ...args: Parameters<MapState<TStore>>
) {
  return vuex.mapState(...(args as Parameters<typeof vuex.mapState>));
};
export const mapMutations = function <TStore extends AnyTypedStore>(
  store: TStore,
  ...args: Parameters<MapMutations<TStore>>
) {
  return vuex.mapMutations(...(args as Parameters<typeof vuex.mapMutations>));
};
export const mapGetters = function <TStore extends AnyTypedStore>(
  store: TStore,
  ...args: Parameters<MapGetters<TStore>>
) {
  return vuex.mapGetters(...(args as Parameters<typeof vuex.mapGetters>));
};
export const mapActions = function <TStore extends AnyTypedStore>(
  store: TStore,
  ...args: Parameters<MapActions<TStore>>
) {
  return vuex.mapActions(...(args as Parameters<typeof vuex.mapActions>));
};

//From Vue attempt


type ToUnion<Object extends Record<string, any>> = Object extends Record<string, infer TValue> ? TValue : never;
type ToIntersection<Object extends Record<string, any>> = UnionToIntersection<ToUnion<Object>>;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

//export declare class TypedStore2<
//  TState,
//  TModuleMap extends { [key: string]: AnyTypedModule<TState> },
//  TOptions extends StoreOptions<TState, TModuleMap, any, any, any>
//> {
//  constructor(options: TOptions);

//  readonly state: TState;
//  readonly getters: UnionToIntersection<
//    TModuleMap[keyof TModuleMap]["getters"]
//  > &
//    TOptions["getters"];
//  //state: TState;
//  //commit: TModules["commit"];
//  //dispatch: TModules["dispatch"];
//  //getters: TModules["getters"];

//  //Do not use. Only for type inferrence purposes
//  readonly actionTypes: UnionToIntersection<
//    TModuleMap[keyof TModuleMap]["actions"]
//  > &
//    TOptions["actions"];
//  readonly mutationTypes: UnionToIntersection<
//    TModuleMap[keyof TModuleMap]["mutations"]
//  > &
//    TOptions["mutations"];

//  install(app: App, injectKey?: InjectionKey<ThisType<this>> | string): void;

//  replaceState(state: TState): void;

//  dispatch: TModuleMap[keyof TModuleMap]["dispatch"]; // &
//  //Dispatch<TOptions["actions"]>;

//  commit: UnionToIntersection<TModuleMap[keyof TModuleMap]["commit"]> &
//    Commit<TOptions["mutations"]>; // TODO: Fix

//  subscribe<P extends MutationPayload>(
//    fn: (mutation: P, state: TState) => any,
//    options?: SubscribeOptions
//  ): () => void;
//  subscribeAction<P extends ActionPayload>(
//    fn: SubscribeActionOptions<P, TState>,
//    options?: SubscribeOptions
//  ): () => void;
//  watch<T>(
//    getter: (state: TState, getters: any) => T,
//    cb: (value: T, oldValue: T) => void,
//    options?: WatchOptions
//  ): () => void;
//}

///* export interface Dispatch {
//	(type: string, payload?: any, options?: DispatchOptions): Promise<any>;
//	<P extends Payload>(
//		payloadWithType: P,
//		options?: DispatchOptions
//	): Promise<any>;
//} */

//export type Commit<TMutations extends FunctionObject<TMutations>> = <
//  Key extends keyof TMutations
//>(
//  key: Key,
//  payload: Parameters<TMutations[Key]>[1]
//) => ReturnType<TMutations[Key]>;

//export interface ActionContext<TStore extends AnyTypedStore, State, RootState> {
//  dispatch: Dispatch<TStore["actionTypes"]>; //TODO: fix
//  commit: Commit<TStore["mutationTypes"]>;
//  state: State;
//  getters: any;
//  rootState: RootState;
//  rootGetters: any;
//}

//export interface Payload {
//  type: string;
//}

//export interface MutationPayload extends Payload {
//  payload: any;
//}

//export interface ActionPayload extends Payload {
//  payload: any;
//}

//export interface SubscribeOptions {
//  prepend?: boolean;
//}

//export type ActionSubscriber<P, S> = (action: P, state: S) => any;
//export type ActionErrorSubscriber<P, S> = (
//  action: P,
//  state: S,
//  error: Error
//) => any;

//export interface ActionSubscribersObject<P, S> {
//  before?: ActionSubscriber<P, S>;
//  after?: ActionSubscriber<P, S>;
//  error?: ActionErrorSubscriber<P, S>;
//}

//export type SubscribeActionOptions<P, S> =
//  | ActionSubscriber<P, S>
//  | ActionSubscribersObject<P, S>;

//export interface DispatchOptions {
//  root?: boolean;
//}

//export interface CommitOptions {
//  silent?: boolean;
//  root?: boolean;
//}

export interface StoreOptions<TState> {
  state?: TState | (() => TState);
  getters?: {
	[key: string]: vuex.Getter<TState, TState> extends infer TRootGetters
	  ? TRootGetters
	  : never;
  };
  actions?: {
	[key: string]: vuex.Action<
	  TState,
	  TState
	> extends infer TRootActions
	  ? TRootActions
	  : never;
  };
  mutations?: {
	[key: string]: vuex.Mutation<TState> extends infer TRootMutations
	  ? TRootMutations
	  : never;
  };
  modules?: {
	[key: string]: AnyTypedModule<TState> extends infer TModule
	  ? TModule
	  : never;
  };
  plugins?: vuex.Plugin<AnyTypedStore>[];
  strict?: boolean;
  devtools?: boolean;
}

//export type ActionHandler<TStore extends AnyTypedStore, S, RootState> = (
//  this: TStore,
//  injectee: ActionContext<Mutations<TStore>, S, RootState>,
//  payload?: any extends infer TPayload ? TPayload : never
//) => any extends infer TReturn ? TReturn : never;

//export interface ActionObject<TStore extends AnyTypedStore, S, R> {
//  root?: boolean;
//  handler: ActionHandler<TStore, S, R>;
//}

//export type Getter<S, R> = (
//  state: S,
//  getters: any,
//  rootState: R,
//  rootGetters: any
//) => any;
//export type Action<TStore extends AnyTypedStore, S, R> =
//  | ActionHandler<TStore, S, R>
//  | ActionObject<TStore, S, R>;
//export type Mutation<S> = (state: S, payload?: any) => any;
//export type Plugin<TStore extends AnyTypedStore> = (store: TStore) => any;

////export interface Module<S, R> {
////	namespaced?: boolean;
////	state?: S | (() => S);
////	getters?: GetterTree<S, R>;
////	actions?: any; //ActionTree<S, R>;
////	mutations?: MutationTree<S>;
////	modules?: any; //ModuleTree<R>;
////}

//export type Module<
//  TState,
//  TActions extends FunctionObject<TActions>,
//  TMutations extends FunctionObject<TMutations>,
//  TGetters extends FunctionObject<TGetters>,
//  TNamespace extends string
//> =
//  | NamespacedModule<TState, TActions, TMutations, TGetters, TNamespace>
//  | NonNamespacedModule<TState, TActions, TMutations, TGetters>;

//export type NonNamespacedModule<
//  TState,
//  TActions extends FunctionObject<TActions>,
//  TMutations extends FunctionObject<TMutations>,
//  TGetters extends FunctionObject<TGetters>
//> = {
//  namespaced?: false;
//  state?: TState | (() => TState);
//  modules?: ModuleTree<RootState>;
//} & {
//  mutations: TMutations;
//} & {
//  actions: TActions;
//} & {
//  getters: TGetters;
//};

//export type NamespacedModule<
//  TState,
//  TActions extends FunctionObject<TActions>,
//  TMutations extends FunctionObject<TMutations>,
//  TGetters extends FunctionObject<TGetters>,
//  TNamespace extends string
//> = {
//  namespaced: true;
//  state?: TState | (() => TState);
//  modules?: ModuleTree<RootState>;
//} & {
//  mutations: NamespacedObject<TMutations, TNamespace>;
//} & {
//  actions: NamespacedObject<TActions, TNamespace>;
//} & {
//  getters: NamespacedObject<TGetters, TNamespace>;
//};

//export type ModuleDefinition<
//  TState,
//  TActions extends FunctionObject<TActions>,
//  TMutations extends FunctionObject<TMutations>,
//  TGetters extends FunctionObject<TGetters>,
//  TNamespace extends string | undefined
//> = {
//  namespaced?: boolean;
//  state: TState | (() => TState);
//  modules?: ModuleTree<RootState>;
//} & {
//  mutations: TMutations;
//} & {
//  actions: TActions;
//} & {
//  getters: TGetters;
//};

//export type DefinitionToType<
//  TModuleDefinition extends ModuleDefinition<any, any, any, any, TNamespace>,
//  TNamespace extends string
//> = NamespacedModule<
//  TModuleDefinition["state"],
//  TModuleDefinition["actions"],
//  TModuleDefinition["mutations"],
//  TModuleDefinition["getters"],
//  TNamespace
//>;

//export interface ModuleOptions {
//  preserveState?: boolean;
//}

//export interface GetterTree<S, R> {
//  [key: string]: Getter<S, R>;
//}

//export interface ActionTree<S, R> {
//  [key: string]: Action<S, R>;
//}

//export interface MutationTree<S> {
//  [key: string]: Mutation<S>;
//}

//export interface ModuleTree<RootState> {
//  [key: string]: AnyTypedModule<RootState> extends infer TModule
//    ? TModule
//    : never;
//}

//type createNamespacedHelpers = <
//	TStore extends AnyTypedStore,
//	TNamespace extends Namespaces<TStore>
//	>(
//	namespace: TNamespace
//) => MappersForNamespace<TStore, TNamespace>;

//export declare const mapGetters: mapTypedGetters<AnyTypedStore>;
//export declare const mapActions: mapTypedActions<AnyTypedStore>;
//export declare const mapMutations: mapTypedMutations<AnyTypedStore>;
//export declare const mapState: mapTypedState<AnyTypedStore>;

//declare const _default: {
//	mapState: mapTypedState<AnyTypedStore>;
//	mapMutations: mapTypedGetters<AnyTypedStore>;
//	mapGetters: mapTypedGetters<AnyTypedStore>;
//	mapActions: mapTypedActions<AnyTypedStore>;
//	createNamespacedHelpers: createNamespacedHelpers;
//	createLogger: typeof createLogger;
//};
//export default _default;
