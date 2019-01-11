# AdvancedServiceWorker
A customizable and dynamic, yet simple service worker for your website

## Donation
[<img width="24" height="24" src="http://icons.iconarchive.com/icons/sonya/swarm/256/Coffee-icon.png"/>**Every coffee counts! :)**](https://www.coinpayments.net/index.php?cmd=_donate&reset=1&merchant=820707aded07845511b841f9c4c335cd&item_name=Donate&currency=USD&amountf=10.00000000&allow_amount=1&want_shipping=0&allow_extra=1)

## Simple Usage

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
