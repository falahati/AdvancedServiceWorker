# AdvancedServiceWorker
[![](https://img.shields.io/github/license/falahati/AdvancedServiceWorker.svg?style=flat-square)](https://github.com/falahati/AdvancedServiceWorker/blob/master/LICENSE)
[![](https://img.shields.io/github/commit-activity/y/falahati/AdvancedServiceWorker.svg?style=flat-square)](https://github.com/falahati/AdvancedServiceWorker/commits/master)
[![](https://img.shields.io/github/issues/falahati/AdvancedServiceWorker.svg?style=flat-square)](https://github.com/falahati/AdvancedServiceWorker/issues)

A customizable and dynamic, yet simple service worker for your website

## Where to get
[![](https://img.shields.io/github/downloads/falahati/AdvancedServiceWorker/total.svg?style=flat-square)](https://github.com/falahati/AdvancedServiceWorker/releases)
[![](https://img.shields.io/github/tag-date/falahati/AdvancedServiceWorker.svg?label=version&style=flat-square)](https://github.com/falahati/AdvancedServiceWorker/releases)

To download the latest version of this program, take a look at the [releases page](https://github.com/falahati/AdvancedServiceWorker/releases).

## Donation
Donations assist development and are greatly appreciated; also always remember that [every coffee counts!](https://media.makeameme.org/created/one-simply-does-i9k8kx.jpg) :)

[![](https://img.shields.io/badge/fiat-PayPal-8a00a3.svg?style=flat-square)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=WR3KK2B6TYYQ4&item_name=Donation&currency_code=USD&source=url)
[![](https://img.shields.io/badge/crypto-CoinPayments-8a00a3.svg?style=flat-square)](https://www.coinpayments.net/index.php?cmd=_donate&reset=1&merchant=820707aded07845511b841f9c4c335cd&item_name=Donate&currency=USD&amountf=20.00000000&allow_amount=1&want_shipping=0&allow_extra=1)
[![](https://img.shields.io/badge/shetab-ZarinPal-8a00a3.svg?style=flat-square)](https://zarinp.al/@falahati)

**--OR--**

You can always donate your time by contributing to the project or by introducing it to others.

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
