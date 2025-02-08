import { chromium, firefox } from "playwright";
import { newInjectedContext } from "fingerprint-injector";
import { checkTz } from "./tz_px.js";

const url = "https://cybertoolhub.space/";
// Threads range
const min = 6; // Minimum threads for task execution.
const max = 11; // Maximum threads for task execution.
let bots;
let views = 0;
function generateRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const locations = [
  "se", // Sweden
  "se", // Sweden
  "se", // Sweden
    "se", // Sweden
  "se", // Sweden
  "se", // Sweden
    "se", // Sweden
  "se", // Sweden
  "se", // Sweden
    "se", // Sweden
  "se", // Sweden
  "se", // Sweden
    "se", // Sweden
  "se", // Sweden
  "se", // Sweden
    "se", // Sweden
  "se", // Sweden
    "se", // Sweden
  "se", // Sweden

  "ua", // Ukraine
  "ua", // Ukraine
  "ua", // Ukraine
  "ua", // Ukraine
  "at", // Austria
  "at", // Austria
  "at", // Austria
  "at", // Austria
  "fr", // France
  "fr", // France
  "fr", // France
  "fr", // France
  "fr", // France
  "fr", // France
  "ca", // Canada
  "ca", // Canada
  "ca", // Canada
  "ca", // Canada
  "us", // United States
  "us", // United States
  "us", // United States
  "us", // United States
  "us", // United States
  "us", // United States
  "us", // United States
  "us", // United States
  "us", // United States
  "us", // United States
  "us", // United States
  "us", // United States
  "us", // United States
  "us", // United States
  "us", // United States
  "us", // United States
  "us", // United States
  "us", // United States
  "us", // United States
  "us", // United States
  "us", // United States
  "us", // United States
  "us", // United States
  "us", // United States
  "us", // United States
  "us", // United States
  "us", // United States


  "fr", // France
  "fr", // France
  "fr", // France
  "uk", // United Kingdom
  "au", // Australia
  "de", // Germany
  "jp", // Japan
  "sg", // Singapore
  "kr", // South Korea
  "it", // Italy
  "es", // Spain
  "in", // India
  "id", // Indonesia
  "ph", // Philippines
  "th", // Thailand
  "my", // Malaysia
  "eg", // Egypt
  "tr", // Turkey
  "pk", // Pakistan (English speakers, strong internet growth)
  "bd", // Bangladesh (growing internet users, relevance to global content)
  "mx", // Mexico (geographical proximity, U.S. ties)
  "lk", // Sri Lanka
  "ml", // Mali
  "bj", // Benin
  "ug", // Uganda
  "mm", // Myanmar
  "no", // Norway
  "pf", // French Polynesia
  "np", // Nepal
  "bf", // Burkina Faso
  "cd", // Congo, The Democratic Republic of the
  "bi", // Burundi

  "cf", // Central African Republic
  "hk", // Hong Kong

];

// Function to select a random user preference
const weightedRandom = (weights) => {
  let totalWeight = weights.reduce((sum, weight) => sum + weight.weight, 0);
  let random = Math.random() * totalWeight;
  for (let i = 0; i < weights.length; i++) {
    if (random < weights[i].weight) return weights[i].value;
    random -= weights[i].weight;
  }
};

// Preferences for user agents and devices
const preferences = [
  {
    value: { device: "desktop", os: "windows", browser: "chrome" },
    weight: 20,
  },

  {
    value: { device: "mobile", os: "android", browser: "chrome" },
    weight: 100,
  },
];

// Sources
const referers = [
  "https://www.google.com",
  "https://www.discord.com",
  "https://twitter.com",
  "https://www.reddit.com",
  "https://www.linkedin.com",
  "https://news.ycombinator.com",
  "https://www.github.com",
  "https://www.bing.com",
  "https://www.youtube.com",
  "https://www.facebook.com",
];

export const generateNoise = () => {
  const shift = {
    r: Math.floor(Math.random() * 5) - 2,
    g: Math.floor(Math.random() * 5) - 2,
    b: Math.floor(Math.random() * 5) - 2,
    a: Math.floor(Math.random() * 5) - 2,
  };
  const webglNoise = (Math.random() - 0.5) * 0.01;
  const clientRectsNoise = {
    deltaX: (Math.random() - 0.5) * 2,
    deltaY: (Math.random() - 0.5) * 2,
  };
  const audioNoise = (Math.random() - 0.5) * 0.000001;

  return { shift, webglNoise, clientRectsNoise, audioNoise };
};

export const noisifyScript = (noise) => `
  (function() {
    const noise = ${JSON.stringify(noise)};

    // Canvas Noisify
    const getImageData = CanvasRenderingContext2D.prototype.getImageData;
    const noisify = function (canvas, context) {
      if (context) {
        const shift = noise.shift;
        const width = canvas.width;
        const height = canvas.height;
        if (width && height) {
          const imageData = getImageData.apply(context, [0, 0, width, height]);
          for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
              const n = ((i * (width * 4)) + (j * 4));
              imageData.data[n + 0] = imageData.data[n + 0] + shift.r;
              imageData.data[n + 1] = imageData.data[n + 1] + shift.g;
              imageData.data[n + 2] = imageData.data[n + 2] + shift.b;
              imageData.data[n + 3] = imageData.data[n + 3] + shift.a;
            }
          }
          context.putImageData(imageData, 0, 0); 
        }
      }
    };
    HTMLCanvasElement.prototype.toBlob = new Proxy(HTMLCanvasElement.prototype.toBlob, {
      apply(target, self, args) {
        noisify(self, self.getContext("2d"));
        return Reflect.apply(target, self, args);
      }
    });
    HTMLCanvasElement.prototype.toDataURL = new Proxy(HTMLCanvasElement.prototype.toDataURL, {
      apply(target, self, args) {
        noisify(self, self.getContext("2d"));
        return Reflect.apply(target, self, args);
      }
    });
    CanvasRenderingContext2D.prototype.getImageData = new Proxy(CanvasRenderingContext2D.prototype.getImageData, {
      apply(target, self, args) {
        noisify(self.canvas, self);
        return Reflect.apply(target, self, args);
      }
    });

    // Audio Noisify
    const originalGetChannelData = AudioBuffer.prototype.getChannelData;
    AudioBuffer.prototype.getChannelData = function() {
      const results = originalGetChannelData.apply(this, arguments);
      for (let i = 0; i < results.length; i++) {
        results[i] += noise.audioNoise; // Smaller variation
      }
      return results;
    };

    const originalCopyFromChannel = AudioBuffer.prototype.copyFromChannel;
    AudioBuffer.prototype.copyFromChannel = function() {
      const channelData = new Float32Array(arguments[1]);
      for (let i = 0; i < channelData.length; i++) {
        channelData[i] += noise.audioNoise; // Smaller variation
      }
      return originalCopyFromChannel.apply(this, [channelData, ...Array.prototype.slice.call(arguments, 1)]);
    };

    const originalCopyToChannel = AudioBuffer.prototype.copyToChannel;
    AudioBuffer.prototype.copyToChannel = function() {
      const channelData = arguments[0];
      for (let i = 0; i < channelData.length; i++) {
        channelData[i] += noise.audioNoise; // Smaller variation
      }
      return originalCopyToChannel.apply(this, arguments);
    };

    // WebGL Noisify
    const originalGetParameter = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function() {
      const value = originalGetParameter.apply(this, arguments);
      if (typeof value === 'number') {
        return value + noise.webglNoise; // Small random variation
      }
      return value;
    };

    // ClientRects Noisify
    const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function() {
      const rect = originalGetBoundingClientRect.apply(this, arguments);
      const deltaX = noise.clientRectsNoise.deltaX; // Random shift between -1 and 1
      const deltaY = noise.clientRectsNoise.deltaY; // Random shift between -1 and 1
      return {
        x: rect.x + deltaX,
        y: rect.y + deltaY,
        width: rect.width + deltaX,
        height: rect.height + deltaY,
        top: rect.top + deltaY,
        right: rect.right + deltaX,
        bottom: rect.bottom + deltaY,
        left: rect.left + deltaX
      };
    };
  })();
`;

// Function to simulate random clicks on a page
const performRandomClicks = async (page) => {
  const numClicks = generateRandomNumber(2, 4); // Random number between 2 and 4
  for (let i = 0; i < 1; i++) {
    const width = await page.evaluate(() => window.innerWidth);
    const height = await page.evaluate(() => window.innerHeight);
    const x = generateRandomNumber(0, width);
    const y = generateRandomNumber(0, height);

    await page.mouse.click(x, y);
    console.log(`Click ${i + 1} performed at position (${x}, ${y})`);
    await page.waitForTimeout(generateRandomNumber(2000, 3000));
  }
};

const blockResources = async (page) => {
  await page.route("**/*", (route) => {
    const resourceType = route.request().resourceType();
    if (["image", "stylesheet", "media", "font"].includes(resourceType)) {
      route.abort();
    } else {
      route.continue();
    }
  });
};

const OpenBrowser = async (link, username) => {
  const userPreference = weightedRandom(preferences);
  console.log(userPreference);
  const timezone = await checkTz(username);
  if (timezone == undefined) {
    return;
  }
  const browser = await chromium.launch({
    headless: true,
    proxy: {
      server: "148.113.161.141:5959",
      username: username,
      password: process.env.JEDI,
    },
  });

  const context = await newInjectedContext(browser, {
    fingerprintOptions: {
      devices: [userPreference.device],
      browsers: [userPreference.browser],
      operatingSystems: [userPreference.os],
      mockWebRTC: true,
    },
    newContextOptions: {
      timezoneId: timezone || "America/New_York",
    },
  });
  try {
    const noise = generateNoise();
    const page = await context.newPage();
    const referer = referers[Math.floor(Math.random() * referers.length)];
    if (referer !== "direct") {
      await page.setExtraHTTPHeaders({ referer });
      console.log(`[+] Using referer: ${referer}`);
    } else {
      console.log(`[+] Using direct access (no referer).`);
    }

    // add media blockers
    await blockResources(page);
    await page.addInitScript(noisifyScript(noise));
    await page.goto(link, { waitUntil: "load" });
    console.log(
      "Browser view from -> ",
      timezone,
      "website -> ",
      url,
      "threads :",
      bots
    );
    await page.waitForTimeout(generateRandomNumber(6500, 7000));
    await performRandomClicks(page);
    await page.waitForTimeout(generateRandomNumber(35000, 40000));
    views++;
  } catch (error) {
    console.log(error);
  } finally {
    await context.close();
    await browser.close();
  }
};

const tasksPoll = async () => {
  bots = Math.floor(Math.random() * (max - min + 1)) + min;
  const tasks = Array.from({ length: bots }).map(() => {
    let location = locations[generateRandomNumber(0, locations.length + 1)];
    const username =
      "qualityser-res-" +
      location +
      "-sid-" +
      String(generateRandomNumber(10000, 10000000));

    return OpenBrowser(url, username);
  });

  await Promise.all(tasks);
};

const RunTasks = async () => {
  for (let i = 0; i < 14534554; i++) {
    try {
      await tasksPoll();
    } catch (error) {
      console.log(error);
    }
    console.log(views);
  }
};

RunTasks();
