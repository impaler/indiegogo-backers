# indiegogo-backers

A simple [nightmare](https://github.com/segmentio/nightmare) scraper to parse the indiegogo backers in a json format.
This is useful to create a thankyou page about a campaign on a custom site.

Just provide the Indiegogo project name ans an env var eg:

```
PROJECT_NAME=haxeflixel-games-software node index.js
```

This creates a backers.json file with an array sorted by pledge amount with data like the following:

```
[
    {
        "amount": "$1000",
        "imgSrc": "https://g0.iggcdn.com/assets/individuals/missing/cubepeep-3c70b9b8bef12ca70a38d32e7c635576ae8a66bc7cfff10612ba6876fd7c68c7.png",
        "name": "Blue Bottle Games, LLC"
    },
    {
        "amount": "$500",
        "imgSrc": "https://c1.iggcdn.com/indiegogo-media-prod-cld/image/upload/c_fill,f_auto,h_50,w_50/v1470131024/ka0bt0vx1idui18cbzxq.jpg",
        "name": "Solar Powered Games , e.K.",
        "url": "https://www.indiegogo.com/individuals/14713654"
    },
    ...
]
```

Since this is scraping script that is coupled to the DOM of indiegogo today, it is subject to changes in indiegogo updating their website.
To update the script, you can make use of debug mode and figure out the changes in chrome dev tools, eg:

```
DEBUG=true PROJECT_NAME=haxeflixel-games-software node index.js
```