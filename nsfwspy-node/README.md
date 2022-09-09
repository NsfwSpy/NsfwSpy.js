<img src="https://raw.githubusercontent.com/NsfwSpy/NsfwSpy/main/_art/NsfwSpy-Logo.jpg" alt="NsfwSpy Logo" width="400"/>

# Introduction
NsfwSpy.js is a nudity/pornography image classifier built for Node.js, based on our [parent .NET project](https://github.com/NsfwSpy/NsfwSpy), to aid in moderating user-generated content for various different application types, written in TypeScript. The machine learning model has been trained against the MobileNetV2 neural net architecture with 537,000 images (186GB), from 4 different categories:

| Label       | Description | Files |
| ----------- | ----------- | ----- |
| Pornography | Images that depict sexual acts and nudity. | 108,000 |
| Sexy        | Images of people in their underwear and men who are topless. | 76,000 |
| Hentai      | Drawings or animations of sexual acts and nudity. | 83,000 |
| Neutral     | Images that are not sexual in nature. | 268,000 |

<img src="https://raw.githubusercontent.com/NsfwSpy/NsfwSpy/main/_art/Examples.gif" />

# Performance
NsfwSpy isn't perfect, but the accuracy should be good enough to detect approximately 96% of Nsfw images, those being images that are classed as pornography, sexy or hentai.

|     | Pornography | Sexy | Hentai | Neutral |
| --- | --- | --- | --- | --- |
| Is Nsfw <sub><sup>(pornography + sexy + hentai >= 0.5)</sup></sub> | 95.0% | 97.3% | 93.3% | 3.7% | 
| Correctly Predicted Label | 85.0% | 81.0% | 89.8% | 96.4% |

# Quick Start
Want to see how NsfwSpy.js performs? Try it now on our [test site](https://nsfwspy.github.io/NsfwSpy.js).

This project is available as a [npm package](https://www.npmjs.com/package/@nsfwspy/node) and can be installed with the following commands:

```
npm install @nsfwspy/node
```

Import NsfwSpy at the top of your JavaScript or TypeScript file:

**JavaScript**
```javascript
const { NsfwSpy } = require('@nsfwspy/node');
```

**TypeScript**
```typescript
import { NsfwSpy } from '@nsfwspy/node';
```

### Classify an Image File
```javascript
const filePath = "C:\\Users\\username\\Documents\\flower.jpg";
const nsfwSpy = new NsfwSpy();
await nsfwSpy.load();
const result = await nsfwSpy.classifyImageFile(filePath);
```

### Classify an Image from a Byte Array
```javascript
const imageBuffer = await fs.readFileSync(filePath);
const nsfwSpy = new NsfwSpy();
await nsfwSpy.load();
const result = await nsfwSpy.classifyImageFromByteArray(imageBuffer);
```

# Contact Us
Interested to get involved in the project? Whether you fancy adding features, providing images to train NsfwSpy with or something else, feel free to contact us via email at [nsfwspy@outlook.com](mailto:nsfwspy@outlook.com) or find us on Twitter at [@nsfw_spy](https://twitter.com/nsfw_spy).

# Notes
Using NsfwSpy? Let us know! We're keen to hear how the technology is being used and improving the safety of applications.

Got a feature request or found something not quite right? Report it [here](https://github.com/NsfwSpy/NsfwSpy.js/issues) on GitHub and we'll try to help as best as possible.
