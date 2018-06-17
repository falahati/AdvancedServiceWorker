# AdvancedServiceWorker
A customizable and dynamic, yet simple service worker for your website


# Simple Usage

```html
<script type="text/javascript" src="/asw.min.js" defer></script>
<script type="text/javascript">
    document.addEventListener("DOMContentLoaded", function(event) {
        var options = {
            version: 1,
            storageName: "offline-cache",
            debug: false,
            filePath: "/asw.min.js",
            scope: "/",
            rules: [
                {
                    conditions: [
                        { url: "*Plugins/MediaDirectory/*.jpg" },
                        { url: "*Plugins/MediaDirectory/*.jpeg" },
                        { url: "*Plugins/MediaDirectory/*.webp" }
                    ],
                    strategy: AdvancedServiceWorker.Strategies.CacheFirst
                },
                {
                    conditions: [
                        { url: "*Plugins/MediaDirectory/*.mp4" },
                        { url: "*Plugins/MediaDirectory/*.webm" }
                    ],
                    strategy: AdvancedServiceWorker.Strategies.NetworkOnly
                },
                {
                    conditions: [
                        { url: "*.png" },
                        { url: "*.jpg" },
                        { url: "*.jpeg" },
                        { url: "*.gif" },
                        { url: "*.webp" },
                        { url: "*.ico" },
                        { url: "*.css" },
                        { url: "*.svg" },
                        { url: "*.svg?*" },
                        { url: "*.css?*" },
                        { url: "*.js" },
                        { url: "*.js?*" }
                    ],
                    strategy: AdvancedServiceWorker.Strategies.Race,
                    networkTimeout: 500,
                },
                {
                    conditions: [
                        { url: "/" },
                        { url: "/Video/*" },
                        { url: "/Tag/*" },
                        { url: "/Videos*" },
                        { url: "/Player*" }
                    ],
                    strategy: AdvancedServiceWorker.Strategies.Race,
                    offline: "/Offline",
                    networkTimeout: 3000,
                },
                {
                    conditions: [
                        { url: "*" }
                    ],
                    strategy: AdvancedServiceWorker.Strategies.Race,
                    offline: "/Offline",
                    networkTimeout: 1000,
                }
            ]
        };

        var serviceWorker = new AdvancedServiceWorker.Controller(options);
        serviceWorker.ensureInstalled();
    });
</script>
```