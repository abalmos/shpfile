# `@oats/shapefile.js

shapefile.js is a simple, light weight shp/dbf (xBase) file reader written in
TypeScript with no external dependencies. Released in both CJS and ESM, the
library should run in any JavaScript environment that [supports
DataView](https://caniuse.com/#feat=mdn-javascript_builtins_dataview) (most
browsers, node.js, deno)

# No zip support?

This library does not have native support for zip files, you must provide the
shp and/or dbf file directly. shapefile.js made this choice because its not 100%
clear exactly how the files with a zip should be treated. That, said there are
several high quality zip library's that support both browsers and node.js that
you can use. For example, to open all `.shp` files in a zip, these few lines
would work:

```

```
