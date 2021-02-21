import {
    ActionContext,
    CommitOptions,
    DispatchOptions,
    Module as VuexModule,
    Store as VuexStore,
    Getter as VuexGetter,
    Action as VuexAction,
    Mutation as VuexMutation,
    Plugin,
    ActionObject,
    ActionHandler
} from "vuex";
import { ComponentPublicInstance } from "vue";
import {
  UnderlyingString,
  Filter,
  ParametersSkipOne,
  Path,
  Replace,
  PathValue,
  AnyFunction,
    AnyReturn,
  IfDefined
} from "type-helpers";

/// ------------------------------------Mappers------------------------------------------------

//#region any facades

//These likely need to die, but until then.
export type AnyTypedStore = TypedStore<any, any>; //eslint-disable-line @typescript-eslint/no-explicit-any
type AnyArguments = any[]; //eslint-disable-line @typescript-eslint/no-explicit-any
type AnyStringRecord = Record<string, any>; //eslint-disable-line @typescript-eslint/no-explicit-any
export type AnyTypedModule<TState> = TypedModule<
  TState,
  any,
  any,
  any,
  any,
  string
>; //eslint-disable-line @typescript-eslint/no-explicit-any

//#endregion

//#region Supporting types
type InlineComputed<T extends AnyFunction> = T extends (
  ...args: Parameters<T>
) => ReturnType<T>
  ? () => ReturnType<T>
  : never;

type InlineMethod<
  T extends (fn: AnyFunction, ...args: AnyArguments) => AnyReturn
> = T extends (fn: T, ...args: infer Args) => infer R
  ? (...args: Args) => R
  : never;

type CustomVue = ComponentPublicInstance & AnyStringRecord;

type unwrapKeyForNamespace<
  K,
  TStore extends AnyTypedStore,
  TProp extends keyof TStore & string,
  TNamespace extends string
> = K extends keyof propsForNamespace<TStore, TProp, TNamespace>
  ? K extends `${TNamespace}/${infer TPropname}`
    ? TPropname
    : never
  : never;

type wrapKeyForNamespace<
  K,
  TStore extends AnyTypedStore,
  TProp extends keyof TStore & string,
  TNamespace extends string
> = `${TNamespace}/${K extends string
  ? K
  : never}` extends keyof propsForNamespace<TStore, TProp, TNamespace>
  ? `${TNamespace}/${K extends string ? K : never}`
  : never;

type unwrappedKeysInNamespace<
  TStore extends AnyTypedStore,
  TProp extends keyof TStore & string,
  TNamespace extends string
> = keyof propsForNamespace<TStore, TProp, TNamespace> extends infer key
  ? unwrapKeyForNamespace<key, TStore, TProp, TNamespace>
  : never;
//Indexable Types for the store interactions
export type Getters<TStore extends AnyTypedStore> = TStore["getters"];
export type State<TStore extends AnyTypedStore> = TStore["state"];
export type Actions<TStore extends AnyTypedStore> = TStore["actionTypes"];
export type Mutations<TStore extends AnyTypedStore> = TStore["mutationTypes"];

type NamespaceState<
  TStore extends AnyTypedStore,
  TNamespace extends string
> = TypeOfState<
  TStore,
  TNamespace extends isStateNamespace<TStore, TNamespace> ? TNamespace : never
>;
type StatePath<TStore extends AnyTypedStore> = Path<State<TStore>, "."> &
  string;
type TypeOfState<
  TStore extends AnyTypedStore,
  TPath extends StatePath<TStore>
> = PathValue<State<TStore>, TPath, ".">;

//All namespaces in the store in slash notation
export type Namespaces<TStore extends AnyTypedStore> =
  | Path<Getters<TStore>, "/">
  | Path<Actions<TStore>, "/">
  | Path<
      Mutations<TStore>,
      "/"
    > extends `${infer TNamespace}/${string extends `${string}/${string}`
  ? never
  : string}`
  ? TNamespace | StateNamespaces<TStore>
  : never;
type StateNamespaces<TStore extends AnyTypedStore> = Replace<
  Path<State<TStore>, ".">,
  ".",
  "/"
> extends
  | `${infer TNamespace}/${string extends `${string}/${string}`
      ? never
      : string}`
  | `${infer TNamespace extends `${string}/${string}` ? never : string}`
  ? TNamespace
  : never;

type stateKeysInNamespace<
  TStore extends AnyTypedStore,
  TNamespace extends StateNamespaces<TStore>
> = Path<TStore["state"], "."> extends infer TPath
  ? TPath extends `${Replace<TNamespace, "/", ".">}.${infer TRest}`
    ? TRest
    : never
  : never;

//Action keys for a given namespace with no namespace on them
type actionKeysInNamespace<
  TStore extends AnyTypedStore,
  TNamespace extends string
> = Path<Actions<TStore>, "/"> extends infer TPath
  ? TPath extends `${TNamespace}/${infer TRest}`
    ? TRest
    : never
  : never;
type mutationKeysInNamespace<
  TStore extends AnyTypedStore,
  TNamespace extends string
> = Path<Mutations<TStore>, "/"> extends infer TPath
  ? TPath extends `${TNamespace}/${infer TRest}`
    ? TRest
    : never
  : never;

type namespacedActions<TStore extends AnyTypedStore> = TStore["actionTypes"];
type TypedDispatch<
  TStore extends AnyTypedStore,
  TKey extends TStore["actionTypes"]
> = (key: TKey, ...args: Parameters<TStore["dispatch"]>) => void;

type actionsInNamespace<
  TStore extends AnyTypedStore,
  TNamespace extends string
> = {
  [TKey in keyof Actions<TStore> as unwrapKeyForNamespace<
    TKey,
    TStore,
    "actionTypes",
    TNamespace
  >]?: Actions<TStore>[TKey];
};
type actionTypesInNamespace<
  TStore extends AnyTypedStore,
  TNamespace extends string
> = Filter<
  keyof Actions<TStore>,
  `${TNamespace}/${string extends `${string}/${string}` ? never : string}`
> extends `${TNamespace}/${infer TAction}`
  ? TAction
  : never;
type dispatchForNamespace<
  TStore extends AnyTypedStore,
  TNamespace extends string
> = <
  TAction extends keyof actionsInNamespace<TStore, TNamespace>,
  TActionMethod extends Actions<TStore>[wrapKeyForNamespace<
    TAction,
    TStore,
    "actionTypes",
    TNamespace
  >]
>(
  action: TAction,
  ...args: ParametersSkipOne<TActionMethod>
) => ReturnType<TActionMethod>;
type dispatchForAction<
  TStore extends AnyTypedStore,
  TNamespace extends string,
  TAction extends keyof actionsInNamespace<TStore, TNamespace>
> = <
  TActionMethod extends Actions<TStore>[wrapKeyForNamespace<
    TAction,
    TStore,
    "actionTypes",
    TNamespace
  >]
>(
  ...args: ParametersSkipOne<TActionMethod>
) => ReturnType<TActionMethod>;

//Will need to extend to support root state.
type propsForNamespace<
  TStore extends AnyTypedStore,
  TProp extends string & keyof TStore,
  TNamespace extends string,
  TSeperator extends string = "/"
> = {
  [K in keyof TStore[TProp] as K extends `${TNamespace}${TSeperator}${string}`
    ? K
    : never]: TStore[TProp][K];
};

type isNamespace<
  TStore extends AnyTypedStore,
  TProp extends string & keyof TStore,
  TNamespace extends string,
  TSeperator extends string = "/"
> = keyof propsForNamespace<
  TStore,
  TProp,
  TNamespace,
  TSeperator
> extends `${TNamespace}${TSeperator}${string}`
  ? TNamespace
  : never;
type isGetterNamespace<
  TStore extends AnyTypedStore,
  TNamespace extends string
> = isNamespace<TStore, "getters", TNamespace, "/">;
type isActionNamespace<
  TStore extends AnyTypedStore,
  TNamespace extends string
> = isNamespace<TStore, "actionTypes", TNamespace, "/">;
type isMutationNamespace<
  TStore extends AnyTypedStore,
  TNamespace extends string
> = isNamespace<TStore, "mutationTypes", TNamespace, "/">;

type isStateNamespace<
  TStore extends AnyTypedStore,
  TNamespace extends string
> = TNamespace extends StatePath<TStore>
  ? Filter<Path<State<TStore>>, `${TNamespace}.${string}`> extends never
    ? never
    : TNamespace //Filter to only paths that have children state which should be namespaces
  : never; // May falsly include complex objects in state. needs more research

//#endregion

//#region Getters
type TypedGetterMapper<TStore extends AnyTypedStore> = {
  <Map extends Record<string, string & keyof Getters<TStore>>>(map: Map): {
    [K in keyof Map as Map[K] extends keyof Getters<TStore>
      ? K
      : never]: () => Getters<TStore>[Map[K]];
  };
  <Key extends string & keyof Getters<TStore>>(map: Key[]): {
    [K in Key]: () => Getters<TStore>[K];
  };
};

type TypedGetterMapperWithNamespace<TStore extends AnyTypedStore> = {
  <
    Map extends {
      [K in keyof Map as Map[K] extends string
        ? K
        : never]: TMapKeys extends `${TNamespace}/${infer TVal}` ? TVal : never;
    },
    TNamespace extends Namespaces<TStore>,
    TMapKeys extends keyof Getters<TStore>
  >(
    namespace: TNamespace extends isGetterNamespace<TStore, TNamespace>
      ? UnderlyingString<TNamespace>
      : never,
    map: Map
  ): Map extends string[]
    ? {
        [K in Map[number]]: () => Getters<TStore>[`${TNamespace}/${K}` extends keyof Getters<TStore>
          ? `${TNamespace}/${K}`
          : never];
      }
    : {
        [K in keyof Map]: () => Getters<TStore>[`${TNamespace}/${Map[K]}` extends keyof Getters<TStore>
          ? `${TNamespace}/${Map[K]}`
          : never];
      };
};

type TypedGetterMapperWithSpecificNamespace<
  TStore extends AnyTypedStore,
  TNamespace extends Namespaces<TStore>
> = {
  <
    Map extends {
      [K in keyof Map as Map[K] extends string
        ? K
        : never]: TMapKeys extends `${TNamespace}/${infer TVal}` ? TVal : never;
    },
    TMapKeys extends keyof Getters<TStore>
  >(
    map: Map
  ): Map extends string[]
    ? {
        [K in Map[number]]: () => Getters<TStore>[`${TNamespace}/${K}` extends keyof Getters<TStore>
          ? `${TNamespace}/${K}`
          : never];
      }
    : {
        [K in keyof Map]: () => Getters<TStore>[`${TNamespace}/${Map[K]}` extends keyof Getters<TStore>
          ? `${TNamespace}/${Map[K]}`
          : never];
      };
};
//#endregion

//#region State
type TypedStateMapper<TStore extends AnyTypedStore> = {
  //Object based mapping (with names)
  <Map extends Record<string, string & keyof State<TStore>>>(map: Map): {
    [K in keyof Map as Map[K] extends keyof State<TStore>
      ? K
      : never]: State<TStore>[Map[K]];
  };
  //Array based mapping (as original names)
  <Key extends string & keyof State<TStore>>(map: Key[]): {
    [K in Key]: State<TStore>[K];
  };
};
type TypedStateMapperWithNamespace<TStore extends AnyTypedStore> = {
  //Object based mapping (with names)
  <
    TNamespace extends StateNamespaces<TStore>,
    TProvidedKeys extends string,
    Map extends {
      [key: string]: TProvidedKeys extends infer TKey
        ? TKey & stateKeysInNamespace<TStore, TNamespace>
        : never;
    }
  >(
    namespace: TNamespace extends isStateNamespace<TStore, TNamespace>
      ? UnderlyingString<TNamespace>
      : never,
    map: Map
  ): {
    [K in keyof Map]: TypeOfState<
      TStore,
      `${TNamespace}.${Map[K]}` extends StatePath<TStore>
        ? `${TNamespace}.${Map[K]}`
        : never
    >;
  };
  //Array based mapping (as original names)
  <
    TProvidedKeys extends string[] extends infer TKey
      ? TKey & stateKeysInNamespace<TStore, TNamespace>[]
      : never,
    TNamespace extends StateNamespaces<TStore>
  >(
    namespace: TNamespace extends isStateNamespace<TStore, TNamespace>
      ? UnderlyingString<TNamespace>
      : never,
    map: [...TProvidedKeys]
  ): {
    [Path in TProvidedKeys[number]]: TypeOfState<
      TStore,
      `${TNamespace}.${Path}` extends StatePath<TStore>
        ? `${TNamespace}.${Path}`
        : never
    >;
  };
};

type TypedStateMapperWithSpecificNamespace<
  TStore extends AnyTypedStore,
  TNamespace extends StateNamespaces<TStore>
> = {
  //Object based mapping (with names)
  <
    TProvidedKeys extends string,
    Map extends {
      [key: string]: TProvidedKeys extends infer TKey
        ? TKey & stateKeysInNamespace<TStore, TNamespace>
        : never;
    }
  >(
    map: Map
  ): {
    [K in keyof Map]: TypeOfState<
      TStore,
      `${TNamespace}.${Map[K]}` extends StatePath<TStore>
        ? `${TNamespace}.${Map[K]}`
        : never
    >;
  };
  //Array based mapping (as original names)
  <
    TProvidedKeys extends string[] extends infer TKey
      ? TKey & stateKeysInNamespace<TStore, TNamespace>[]
      : never,
    TNamespace extends StateNamespaces<TStore>
  >(
    namespace: TNamespace extends isStateNamespace<TStore, TNamespace>
      ? UnderlyingString<TNamespace>
      : never,
    map: [...TProvidedKeys]
  ): {
    [Path in TProvidedKeys[number]]: TypeOfState<
      TStore,
      `${TNamespace}.${Path}` extends StatePath<TStore>
        ? `${TNamespace}.${Path}`
        : never
    >;
  };
};

type TypedFunctionMapperForState<TStore extends AnyTypedStore> = {
  <
    Map extends Record<
      string,
      (
        this: CustomVue,
        state: State<TStore>,
        getters: Getters<TStore>
      ) => unknown extends infer TReturn ? TReturn : never
    >
  >(
    map: Map
  ): { [K in keyof Map]: InlineComputed<Map[K]> };
};

type TypedFunctionMapperForStateWithNamespace<TStore extends AnyTypedStore> = {
  <
    Map extends Record<
      string,
      (
        this: CustomVue,
        state: NamespaceState<TStore, UnderlyingString<TNamespace>>,
        getters: Getters<TStore>
      ) => unknown extends infer TReturn ? TReturn : never
    >,
    TNamespace extends StatePath<TStore> & string
  >(
    namespace: TNamespace,
    map: Map
  ): { [K in keyof Map]: InlineComputed<Map[K]> };
};

type TypedFunctionMapperForStateWithSpecificNamespace<
  TStore extends AnyTypedStore,
  TNamespace extends StateNamespaces<TStore>
> = {
  <
    Map extends Record<
      string,
      (
        this: CustomVue,
        state: NamespaceState<TStore, UnderlyingString<TNamespace>>,
        getters: Getters<TStore>
      ) => unknown extends infer TReturn ? TReturn : never
    >
  >(
    map: Map
  ): { [K in keyof Map]: InlineComputed<Map[K]> };
};
//#endregion

//#region Actions
interface TypedMapperForAction<TStore extends AnyTypedStore> {
  //Object based mapping (with names)
  <
    Map extends Record<string, keyof Actions<TStore>> //Only supports string based mappings
  >(
    map: Map
  ): {
    [K in keyof Map]: Map[K] extends AnyFunction
      ? InlineMethod<Map[K]>
      : Map[K] extends keyof Actions<TStore>
      ? (
          ...args: ParametersSkipOne<Actions<TStore>[Map[K]]>
        ) => ReturnType<Actions<TStore>[Map[K]]>
      : never;
  };
  //Array based mapping (as original names)
  <Key extends string & keyof Actions<TStore>>(map: Key[]): {
    [K in Key]: K extends keyof Actions<TStore>
      ? (
          ...args: ParametersSkipOne<Actions<TStore>[K]>
        ) => ReturnType<Actions<TStore>[K]>
      : never;
  };
}

//Discrimination is better in a joined conditional type than on overloads. If any other types become problematic, this is a better way to represent the method
type TypedMapperForActionWithNamespace<TStore extends AnyTypedStore> = {
  <
    Map extends {
      [K in keyof Map as Map[K] extends string
        ? K
        : never]: TMapKeys extends `${TNamespace}/${infer TVal}` ? TVal : never;
    },
    TNamespace extends Namespaces<TStore>,
    TMapKeys extends keyof Actions<TStore>
  >(
    namespace: TNamespace extends isActionNamespace<TStore, TNamespace>
      ? UnderlyingString<TNamespace>
      : never,
    map: Map
  ): Map extends string[]
    ? {
        [Path in Map[number]]: `${TNamespace}/${Path}` extends keyof Actions<TStore>
          ? (
              ...args: ParametersSkipOne<
                Actions<TStore>[`${TNamespace}/${Path}`]
              >
            ) => ReturnType<Actions<TStore>[`${TNamespace}/${Path}`]>
          : never;
      }
    : {
        [K in keyof Map]: Map[K] extends string
          ? `${TNamespace}/${Map[K]}` extends keyof Actions<TStore>
            ? (
                ...args: ParametersSkipOne<
                  Actions<TStore>[`${TNamespace}/${Map[K]}`]
                >
              ) => ReturnType<Actions<TStore>[`${TNamespace}/${Map[K]}`]>
            : never
          : never;
      };
};

type TypedMapperForActionWithSpecificNamespace<
  TStore extends AnyTypedStore,
  TNamespace extends Namespaces<TStore>
> = {
  <
    Map extends {
      [K in keyof Map as Map[K] extends string
        ? K
        : never]: TMapKeys extends `${TNamespace}/${infer TVal}` ? TVal : never;
    },
    TMapKeys extends keyof Actions<TStore>
  >(
    map: Map
  ): Map extends string[]
    ? {
        [Path in Map[number]]: `${TNamespace}/${Path}` extends keyof Actions<TStore>
          ? (
              ...args: ParametersSkipOne<
                Actions<TStore>[`${TNamespace}/${Path}`]
              >
            ) => ReturnType<Actions<TStore>[`${TNamespace}/${Path}`]>
          : never;
      }
    : {
        [K in keyof Map]: Map[K] extends string
          ? `${TNamespace}/${Map[K]}` extends keyof Actions<TStore>
            ? (
                ...args: ParametersSkipOne<
                  Actions<TStore>[`${TNamespace}/${Map[K]}`]
                >
              ) => ReturnType<Actions<TStore>[`${TNamespace}/${Map[K]}`]>
            : never
          : never;
      };
};
//#endregion

//#region Mutations
interface TypedMapperForMutation<TStore extends AnyTypedStore> {
  //Object based mapping (with names)
  <
    Map extends Record<string, keyof Mutations<TStore>> //Only supports string based mappings
  >(
    map: Map
  ): {
    [K in keyof Map]: Map[K] extends AnyFunction
      ? InlineMethod<Map[K]>
      : Map[K] extends keyof Mutations<TStore>
      ? (
          ...args: ParametersSkipOne<Mutations<TStore>[Map[K]]>
        ) => ReturnType<Mutations<TStore>[Map[K]]>
      : never;
  };
  //Array based mapping (as original names)
  <Key extends string & keyof Mutations<TStore>>(map: Key[]): {
    [K in Key]: K extends keyof Mutations<TStore>
      ? (
          ...args: ParametersSkipOne<Mutations<TStore>[K]>
        ) => ReturnType<Mutations<TStore>[K]>
      : never;
  };
}

type TypedMapperForMutationWithNamespace<TStore extends AnyTypedStore> = {
  //Both in one function
  <
    Map extends {
      [K in keyof Map as Map[K] extends string
        ? K
        : never]: TMapKeys extends `${TNamespace}/${infer TVal}` ? TVal : never;
    },
    TNamespace extends Namespaces<TStore>,
    TMapKeys extends keyof Mutations<TStore>
  >(
    namespace: TNamespace extends isMutationNamespace<TStore, TNamespace>
      ? UnderlyingString<TNamespace>
      : never,
    map: Map
  ): Map extends string[]
    ? {
        [Path in Map[number]]: `${TNamespace}/${Path}` extends keyof Mutations<TStore>
          ? (
              ...args: ParametersSkipOne<
                Mutations<TStore>[`${TNamespace}/${Path}`]
              >
            ) => ReturnType<Mutations<TStore>[`${TNamespace}/${Path}`]>
          : never;
      }
    : {
        [K in keyof Map]: Map[K] extends string
          ? `${TNamespace}/${Map[K]}` extends keyof Mutations<TStore>
            ? (
                ...args: ParametersSkipOne<
                  Mutations<TStore>[`${TNamespace}/${Map[K]}`]
                >
              ) => ReturnType<Mutations<TStore>[`${TNamespace}/${Map[K]}`]>
            : never
          : never;
      };
};

type TypedMapperForMutationWithSpecificNamespace<
  TStore extends AnyTypedStore,
  TNamespace extends Namespaces<TStore>
> = {
  //Both in one function
  <
    Map extends {
      [K in keyof Map as Map[K] extends string
        ? K
        : never]: TMapKeys extends `${TNamespace}/${infer TVal}` ? TVal : never;
    },
    TMapKeys extends keyof Mutations<TStore>
  >(
    map: Map
  ): Map extends string[]
    ? {
        [Path in Map[number]]: `${TNamespace}/${Path}` extends keyof Mutations<TStore>
          ? (
              ...args: ParametersSkipOne<
                Mutations<TStore>[`${TNamespace}/${Path}`]
              >
            ) => ReturnType<Mutations<TStore>[`${TNamespace}/${Path}`]>
          : never;
      }
    : {
        [K in keyof Map]: Map[K] extends string
          ? `${TNamespace}/${Map[K]}` extends keyof Mutations<TStore>
            ? (
                ...args: ParametersSkipOne<
                  Mutations<TStore>[`${TNamespace}/${Map[K]}`]
                >
              ) => ReturnType<Mutations<TStore>[`${TNamespace}/${Map[K]}`]>
            : never
          : never;
      };
};
//#endregion

//Top level types
export type MapGetters<
  TStore extends AnyTypedStore
> = TypedGetterMapper<TStore> & TypedGetterMapperWithNamespace<TStore>;

export type MapState<TStore extends AnyTypedStore> = TypedStateMapper<TStore> &
  TypedStateMapperWithNamespace<TStore> &
  TypedFunctionMapperForState<TStore> &
  TypedFunctionMapperForStateWithNamespace<TStore>;

export type MapActions<
  TStore extends AnyTypedStore
> = TypedMapperForAction<TStore> & TypedMapperForActionWithNamespace<TStore>;

export type MapMutations<
  TStore extends AnyTypedStore
> = TypedMapperForMutation<TStore> &
  TypedMapperForMutationWithNamespace<TStore>;

export type MappersForNamespace<
  TStore extends AnyTypedStore,
  TNamespace extends Namespaces<TStore>
> = {
  mapState: TypedStateMapperWithSpecificNamespace<TStore, TNamespace> &
    TypedFunctionMapperForStateWithSpecificNamespace<TStore, TNamespace>;
  mapMutations: TypedMapperForMutationWithSpecificNamespace<TStore, TNamespace>;
  mapGetters: TypedGetterMapperWithSpecificNamespace<TStore, TNamespace>;
  mapActions: TypedMapperForActionWithSpecificNamespace<TStore, TNamespace>;
};

//Broken, avoiding function based for now
//interface TypedMapperForAction<TStore extends AnyTypedStore> {
//	<
//		Map extends
//		{
//			[TKey in keyof TStore["actionTypes"]]:
//			((this: CustomVue, dispatch: TStore["dispatch"], ...args: ParametersSkipOne<TStore["actionTypes"][TKey]>) => unknown extends infer TReturn ? TReturn : void) | keyof TStore["actionTypes"]
//		} //Name matches an action, infer arguments
//		| Record<string, ((this: CustomVue, dispatch: TStore["dispatch"]) => AnyReturn) | keyof TStore["actionTypes"]> //Name doesn't match an action, just a raw function
//	>(
//		map: Map
//	): { [K in keyof Map]: Map[K] extends AnyFunction ? InlineMethod<Map[K]> : Map[K] extends keyof TStore["actionTypes"] ? (...args: ParametersSkipOne<TStore["actionTypes"][Map[K]]>) => ReturnType<TStore["actionTypes"][Map[K]]> : never };
//}

//#region Typed Store types
export type Dispatch<TActions extends FunctionObject<TActions>> = <
  K extends keyof TActions & string
>(
  key: K,
  payload?: Parameters<TActions[K]>[1],
  options?: DispatchOptions
) => ReturnType<TActions[K]>;

export type NamespacedGetters<
  TGetters extends FunctionObject<TGetters>,
  TNamespace extends string
> = {
  [K in keyof TGetters & string as `${TNamespace}/${K}`]: ReturnType<
    TGetters[K]
  >;
};

export type NamespacedDispatch<
  TActions extends FunctionObject<TActions>,
  TNamespace extends string
> = <
  TNamespacedAction extends `${TNamespace}/${keyof TActions & string}`,
  TKey extends TNamespacedAction extends `${TNamespace}/${infer K}` ? K : never
>(
  key: TNamespacedAction,
  payload?: Parameters<TActions[TKey]>[1],
  options?: DispatchOptions
) => ReturnType<TActions[TKey]>;

export type FunctionObject<T> = {
  [K in keyof T]: AnyFunction;
};
export type Commit<TMutations extends FunctionObject<TMutations>> = <
  K extends keyof TMutations
>(
  key: K,
  payload?: Parameters<TMutations[K]>[1],
  options?: CommitOptions
) => ReturnType<TMutations[K]>;

export type NamespacedCommit<
  TMutations extends FunctionObject<TMutations>,
  TNamespace extends string
> = <
  TNamespacedAction extends `${TNamespace}/${keyof TMutations & string}`,
  TKey extends TNamespacedAction extends `${TNamespace}/${infer K}` ? K : never
>(
  key: TNamespacedAction,
  payload?: Parameters<TMutations[TKey]>[1],
  options?: DispatchOptions
) => ReturnType<TMutations[TKey]>;

export type TypedModule<
  TRootState,
  TState,
  TActions extends FunctionObject<TActions>,
  TMutations extends FunctionObject<TMutations>,
  TGetters extends FunctionObject<TGetters>,
  TNamespace extends string
> = Omit<
  VuexModule<TRootState, TState>,
  "getters" | "commit" | "mutations" | "dispatch" | "state" | "actions"
> & {
  commit: NamespacedCommit<TMutations, TNamespace>;
  mutations: {
    [K in keyof TMutations & string as `${TNamespace}/${K}`]: TMutations[K];
  };
} & {
  dispatch: NamespacedDispatch<TActions, TNamespace>;
  actions: {
    [K in keyof TActions & string as `${TNamespace}/${K}`]: TActions[K];
  };
} & {
  getters: NamespacedGetters<TGetters, TNamespace>;
};

//Will need to extend to support root state. Likely just needs more generics, and types anded/or'd with the non namespaced versions
//Excluding dynamic install/removal of modules, as this is not type safe.
export type TypedStore<
    TState,
    TModules extends { commit: any, dispatch: any, getters: any, actions: any, mutations: any },
    TOptions extends StoreOptions<TState> = {}> = Omit<
  VuexStore<TState>,
  | "getters"
  | "commit"
  | "dispatch"
  | "state"
  | "registerModule"
  | "unregisterModule"
> & {
        state: TState;
        commit: TModules["commit"] & Commit<IfDefined<TOptions["mutations"]>>;
        dispatch: TModules["dispatch"] & Dispatch<RootActions<TState, TOptions>>;
        getters: TModules["getters"] & TOptions["getters"];
        actionTypes: TModules["actions"] & TOptions["actions"];
        mutationTypes: TModules["mutations"] & TOptions["mutations"];
};

type RootActions<TState, TOptions extends StoreOptions<TState>> = IfDefined<TOptions["actions"]> &
    {
    [K in keyof TOptions["actions"]]:
    TOptions["actions"][K] extends ActionObject<TState, TState> ?
    TOptions["actions"][K]["handler"] :
    TOptions["actions"][K] & ActionHandler<TState, TState> }

export interface StoreOptions<TState> {
    state?: TState | (() => TState);
    getters?: {
        [key: string]: VuexGetter<TState, TState> extends infer TRootGetters
        ? TRootGetters
        : never;
    };
    actions?: {
        [key: string]: VuexAction<
            TState,
            TState
        > extends infer TRootActions
        ? TRootActions
        : never;
    };
    mutations?: {
        [key: string]: VuexMutation<TState> extends infer TRootMutations
        ? TRootMutations
        : never;
    };
    modules?: {
        [key: string]: unknown extends infer TModule
        ? TModule
        : never;
    };
    plugins?: Plugin<AnyTypedStore>[];
    strict?: boolean;
    devtools?: boolean;
}

export type AugmentedActionContext<
  TMutations extends FunctionObject<TMutations>,
  State,
  RootState
> = {
  commit<Key extends keyof TMutations>(
    key: Key,
    payload: Parameters<TMutations[Key]>[1]
  ): ReturnType<TMutations[Key]>;
} & Omit<ActionContext<State, RootState>, "commit">;

//#endregion
