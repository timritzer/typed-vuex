import { InjectionKey } from "vue";
import * as vuex from "vuex";

import { UnionToIntersection } from "type-helpers"
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
	FunctionObject,
	StoreOptions
} from "./typedVuexStore";

export * from "./typedVuexStore";
export * from "./ambientTypes";

export { createLogger, ActionContext, ActionTree, Module as  ModuleDefinition } from "vuex";

//Infer the store type when creating the store
export function createStore<
	TOptions extends StoreOptions<any>,
	TModules extends Exclude<TOptions["modules"], undefined>,
	TCombinedModules extends UnionToIntersection<TModules[keyof TModules]> extends infer TCombined ? TCombined extends AnyTypedModule<TRootState> ? TCombined : never : never,
	TRootState extends TOptions["state"]
	>(options: TOptions) {
	return vuex.createStore(
		options as vuex.StoreOptions<TRootState>
	) as unknown as TypedStore<TRootState, TCombinedModules, TOptions>;
}

//Will work automatically if you use
export function useStore<TStore extends AnyTypedStore = StoreType>(
  injectKey?: InjectionKey<TStore> | string
) {
  return vuex.useStore(injectKey);
}


//Works without declaration merging
export function mapper<TStore extends AnyTypedStore>() {
	const mapActions = vuex.mapActions as unknown as MapActions<TStore>;
	const mapState = vuex.mapState as unknown as MapState<TStore>;
	const mapMutations = vuex.mapMutations as unknown as MapMutations<TStore>;
	const mapGetters = vuex.mapGetters as unknown as MapGetters<TStore>;
	return {
		mapActions,
		mapState,
		mapMutations,
		mapGetters
	}
}