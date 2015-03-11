# GrammKit

GrammKit is a toll for generating syntax diagrams (also known as railroad diagrams) for parser grammars. Check out the [online version](http://dundalek.com/GrammKit/).

Is uses the [railroad-diagrams](https://github.com/tabatkins/railroad-diagrams) library to generate SVG images.

## Use the library

`npm install grammkit`

```javascript
var grammkit = require('grammkit');

grammkit.diagram('start = left ("+" / "-") right');
// => '<svg>...</svg>'

```

The SVG renders as:

![Diagram Example](example.png)
