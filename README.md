# typed-vuex
Typed wrapper on vuex 4 to allow easy Typescript usage


## How To Use:
Install and use this wrapper as opposed to vuex directly. This will wrap all the calls, and infer the correct types for your Store.

99% of the API and usage will be the same as vuex, with the exception of the mapState/mapActions/mapX methods, which all require a store instance to operate on. 
Because of the extensive useage of generics to infer the complex tree of a Vuex store, combined with the Typescript limitation of providing all or none of the generics, 
you must pass in your store to discover the structure available to those methods. The store instance itself is only used for type inferrence, and all actual functionality is simply from vuex.

## Missing Features:
- [ ] Dynamic Module Load/Unloading - This is likely never possible in a fully typed store, as unregistering modules changes what is available on the store.
- [ ] Root State/Getters/Mutations/Etc. Currently types are built towards namespaced modules. This will be added, and is in progres.

## Usage Example:
https://github.com/timritzer/typed-vuex-examples
