import * as vuex from "vuex";
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
} from "./typedVuexStore";

export const mapActions: MapActions<StoreType> = vuex.mapActions as any;
export const mapState: MapState<StoreType> = vuex.mapState as any;
export const mapGetters: MapGetters<StoreType> = vuex.mapGetters as any;
export const mapMutations: MapMutations<StoreType> = vuex.mapMutations as any;

export const useStore: <TStore extends AnyTypedStore = StoreType>(...params: Parameters<vuex.useStore>) => ReturnType<vuex.useStore> = vuex.useStore;

export interface StoreType {}
