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

export const mapActions: MapActions<StoreType>;
export const mapState: MapState<StoreType>;
export const mapGetters: MapGetters<StoreType>;
export const mapMutations: MapMutations<StoreType>;

export const useStore: <TStore extends AnyTypedStore = StoreType>(...params: Parameters<typeof vuex.useStore>) => ReturnType<typeof vuex.useStore>;

export interface StoreType {}
