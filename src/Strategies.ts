namespace AdvancedServiceWorker {
    export enum Strategies {
        Disable = "DISABLE",
        CacheFirst = "CACHE_FIRST",
        NetworkFirst = "NETWORK_FIRST",
        CacheOnly = "CACHE_ONLY",
        NetworkOnly = "NETWORK_ONLY",
        Race = "RACE"
    }
}