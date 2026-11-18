(() => {
    "use strict";

    const $ = selector => document.querySelector(selector);
    const $$ = selector => Array.from(document.querySelectorAll(selector));
    const TAU = Math.PI * 2;
    const clamp = (n, low = 0, high = 1) => Math.min(high, Math.max(low, n));
    const lerp = (a, b, t) => a + (b - a) * t;
    const smooth = t => t * t * (3 - 2 * t);
    const pad = n => String(n).padStart(2, "0");
    const worlds = [
        { name: "Mercury", type: "Terrestrial", radius: "2,440", period: "88 d", rotation: "58.6 days", distance: "0.39 AU", days: 87.97, eccentricity: .206, color: "#b7afa3", feature: "Impact craters",
          intro: "Sunlight rakes across a battered, airless landscape. This small, swift world circles the Sun in only 88 Earth days.",
          note: "Impact craters record billions of years of collisions on Mercury. With only a thin exosphere to move heat around, the surface swings between searing sunlight and frigid darkness." },
        { name: "Venus", type: "Terrestrial", radius: "6,052", period: "225 d", rotation: "243 days", distance: "0.72 AU", days: 224.7, eccentricity: .007, color: "#e5b975", feature: "Cloud deck",
          intro: "Pale clouds wrap a rocky world almost the size of Earth. Beneath them lies the hottest planetary surface in our solar system.",
          note: "Sulfuric acid clouds hide Venus beneath a brilliant veil. Its thick carbon dioxide atmosphere traps heat, and its slow backward rotation takes longer than its journey around the Sun." },
        { name: "Earth", type: "Terrestrial", radius: "6,371", period: "365.25 d", rotation: "23 h 56 min", distance: "1.00 AU", days: 365.26, eccentricity: .017, color: "#7baae0", feature: "Cloud bands",
          intro: "White clouds curl over blue oceans and shifting continents. Our home is the only world where life has been confirmed.",
          note: "Earth’s oceans cover about 71 percent of its surface. Water moves between sea, ice, air, and land beneath a thin atmosphere, while the Moon helps steady the tilt of Earth’s axis." },
        { name: "Mars", type: "Terrestrial", radius: "3,390", period: "687 d", rotation: "24 h 37 min", distance: "1.52 AU", days: 686.98, eccentricity: .093, color: "#d48b6c", feature: "Dust plains",
          intro: "Rust-red dust stretches from ancient riverbeds to the slopes of giant volcanoes. Frozen water endures at the poles.",
          note: "Iron minerals give the Martian dust its red color. Dried river channels and ancient lake beds preserve evidence that liquid water once flowed across this cold desert world." },
        { name: "Jupiter", type: "Gas giant", radius: "69,911", period: "11.9 yr", rotation: "9.9 hours", distance: "5.20 AU", days: 4332.6, eccentricity: .049, color: "#d2ad91", feature: "Cloud belts",
          intro: "Storms churn through ribbons of cream and ochre. The largest planet in our solar system turns in less than ten hours.",
          note: "Jupiter’s rapid rotation helps organize its clouds into belts and zones. The Great Red Spot is a vast, long-lived storm in the southern hemisphere of this hydrogen-rich giant." },
        { name: "Saturn", type: "Gas giant", radius: "58,232", period: "29.4 yr", rotation: "10.7 hours", distance: "9.58 AU", days: 10759, eccentricity: .057, color: "#e1c9a1", feature: "A ring",
          intro: "A pale gold giant encircled by billions of fragments of ice and rock. The sixth planet from our Sun.",
          note: "Saturn’s rings consist mostly of water ice. The dark Cassini Division separates the bright B ring from the outer A ring. Far below the rings, winds sweep through the planet’s banded clouds." },
        { name: "Uranus", type: "Ice giant", radius: "25,362", period: "84 yr", rotation: "17.2 hours", distance: "19.2 AU", days: 30687, eccentricity: .046, color: "#98d8da", feature: "Methane haze",
          intro: "Methane softens this distant world to blue-green. Uranus travels around the Sun tipped almost onto its side.",
          note: "Uranus has an axial tilt of about 98 degrees. For part of its long orbit, one pole faces the Sun while the other lies in darkness. Methane in its atmosphere absorbs red light." },
        { name: "Neptune", type: "Ice giant", radius: "24,622", period: "165 yr", rotation: "16.1 hours", distance: "30.1 AU", days: 60190, eccentricity: .009, color: "#7b9adf", feature: "High clouds",
          intro: "Fast winds sweep clouds through a cold blue atmosphere. Sunlight takes more than four hours to reach this outermost planet.",
          note: "Neptune was found after astronomers calculated where an unseen planet might be tugging on Uranus. Bright clouds and dark storms trace motion in its distant atmosphere." }
    ];
    const sourceURL = world => "https://science.nasa.gov/" + world.name.toLowerCase() + "/";
    const groupOf = world => world.type === "Terrestrial" ? "rocky" : "giant";

    // A repeatable noise field keeps the same geography at every magnification.
    function randomSequence(seed) {
        let state = seed >>> 0;
        return () => {
            state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
            return state / 4294967296;
        };
    }
    const random = randomSequence(14061997);
    const noiseTable = Float32Array.from({ length: 65536 }, () => random());
    function noise(x, y) {
        const ix = Math.floor(x), iy = Math.floor(y);
        const fx = smooth(x - ix), fy = smooth(y - iy);
        const a = ((iy & 255) << 8), b = (((iy + 1) & 255) << 8);
        const l = ix & 255, r = (ix + 1) & 255;
        return lerp(lerp(noiseTable[a + l], noiseTable[a + r], fx), lerp(noiseTable[b + l], noiseTable[b + r], fx), fy);
    }
    function fractal(x, y) {
        return noise(x, y) * .52 + noise(x * 2.08 + 38, y * 2.08 - 17) * .27
            + noise(x * 4.25 - 71, y * 4.25 + 23) * .14 + noise(x * 8.6, y * 8.6) * .07;
    }
    function makeCanvas(width, height) {
        if (typeof document === "undefined") return new OffscreenCanvas(width, height);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }

    // Latitude palettes give the gas giants separate cloud belts and polar colors.
    const gasColors = {
        4: [[0,110,108,105],[.13,163,149,131],[.24,197,181,155],[.3,177,139,110],[.37,233,216,184],[.41,169,115,87],[.46,194,142,104],[.48,236,217,187],[.55,226,210,183],[.58,154,103,81],[.64,195,144,110],[.67,233,214,182],[.74,184,154,128],[.83,182,167,150],[1,119,125,127]],
        5: [[0,119,145,151],[.11,143,157,154],[.19,179,176,152],[.25,198,188,159],[.29,181,166,141],[.34,214,196,160],[.38,199,177,145],[.43,226,207,172],[.47,214,190,154],[.51,239,218,179],[.57,226,199,159],[.62,198,170,136],[.69,218,192,160],[.75,180,159,145],[.85,144,143,146],[1,110,127,136]],
        6: [[0,174,221,217],[.23,161,218,216],[.4,143,203,204],[.6,154,213,214],[.78,126,194,200],[1,146,207,208]],
        7: [[0,102,139,181],[.22,116,159,203],[.4,91,137,187],[.5,112,156,204],[.67,88,133,185],[.83,104,149,194],[1,82,125,173]]
    };
    function latitudePalette(stops) {
        const palette = new Uint8ClampedArray(2048 * 3);
        let segment = 0;
        for (let i = 0; i < 2048; i++) {
            const t = i / 2047;
            while (segment < stops.length - 2 && t > stops[segment + 1][0]) segment++;
            const a = stops[segment], b = stops[segment + 1];
            const mix = smooth(clamp((t - a[0]) / (b[0] - a[0])));
            for (let c = 0; c < 3; c++) palette[i * 3 + c] = lerp(a[c + 1], b[c + 1], mix);
        }
        return palette;
    }

    // Equirectangular continental outlines anchor the cloud and terrain synthesis.
    const continents = [
        [[-168,68],[-150,71],[-130,69],[-124,74],[-100,73],[-83,68],[-78,60],[-65,63],[-54,52],[-61,47],[-70,43],[-76,36],[-81,31],[-81,25],[-86,30],[-97,26],[-97,20],[-90,18],[-87,22],[-86,16],[-82,9],[-79,8],[-84,10],[-94,16],[-105,20],[-110,27],[-115,28],[-119,34],[-124,40],[-125,49],[-134,57],[-147,61],[-162,55],[-166,59],[-160,64]],
        [[-81,12],[-73,11],[-68,9],[-60,9],[-51,4],[-49,-1],[-42,-3],[-35,-6],[-38,-14],[-39,-19],[-46,-24],[-51,-30],[-54,-34],[-58,-38],[-63,-42],[-65,-50],[-68,-55],[-74,-51],[-74,-44],[-72,-38],[-71,-30],[-70,-19],[-75,-15],[-81,-5],[-79,1],[-77,6]],
        [[-17,15],[-17,22],[-13,28],[-9,32],[-6,36],[2,37],[11,37],[12,33],[20,32],[25,32],[33,30],[35,24],[42,13],[51,12],[49,5],[44,-1],[41,-5],[40,-11],[35,-18],[35,-24],[29,-31],[21,-35],[17,-32],[15,-25],[12,-17],[13,-12],[9,-5],[9,3],[3,6],[-4,5],[-10,6],[-15,10]],
        [[-10,36],[-9,43],[-2,44],[-5,48],[1,51],[6,54],[8,54],[9,58],[5,59],[6,62],[14,68],[25,71],[32,69],[34,65],[40,66],[50,69],[62,69],[72,73],[82,74],[96,78],[105,76],[114,73],[126,72],[138,73],[152,70],[166,69],[179,67],[179,61],[170,60],[160,55],[162,60],[155,59],[145,53],[139,53],[140,48],[134,43],[130,42],[129,36],[126,35],[124,40],[121,39],[122,31],[118,25],[111,21],[106,20],[110,13],[106,10],[103,12],[100,14],[103,2],[99,7],[97,16],[92,21],[88,21],[80,9],[77,8],[73,15],[71,21],[67,25],[59,25],[58,23],[54,17],[44,12],[40,18],[34,28],[35,32],[36,36],[31,36],[27,37],[26,40],[22,39],[23,35],[19,41],[16,42],[17,39],[15,38],[12,42],[8,44],[5,43],[2,41],[-1,38]],
        [[112,-22],[114,-15],[123,-13],[130,-12],[136,-13],[139,-17],[142,-10],[145,-15],[147,-19],[153,-26],[152,-32],[148,-38],[143,-39],[138,-35],[132,-32],[124,-33],[116,-35],[113,-29]],
        [[-73,60],[-60,65],[-52,68],[-49,75],[-44,83],[-25,83],[-18,76],[-22,70],[-32,68],[-42,61],[-48,59]],
        [[43,-12],[50,-13],[49,-20],[45,-26],[43,-23]], [[-10,50],[-6,58],[-3,59],[1,52]], [[129,31],[132,34],[140,41],[145,44],[143,39],[137,35]],
        [[95,5],[102,1],[106,-6],[103,-5]], [[108,1],[114,5],[119,4],[117,-4],[110,-4]], [[130,-3],[139,-3],[151,-8],[146,-10],[136,-7]],
        [[166,-47],[172,-40],[175,-37],[178,-37],[175,-42],[169,-47]]
    ];
    const TEX_W = 1024, TEX_H = 512;
    function landMask() {
        const ctx = makeCanvas(TEX_W, TEX_H).getContext("2d");
        ctx.fillStyle = "white";
        for (const outline of continents) {
            ctx.beginPath();
            outline.forEach(([lon, lat], i) => {
                const x = (lon + 180) / 360 * TEX_W, y = (90 - lat) / 180 * TEX_H;
                if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            });
            ctx.closePath();
            ctx.fill();
        }
        return ctx.getImageData(0, 0, TEX_W, TEX_H).data;
    }
    function addImpactCraters(ctx) {
        const rand = randomSequence(5886);
        for (let i = 0; i < 3400; i++) {
            const x = rand() * TEX_W, y = rand() * TEX_H;
            const r = .45 + Math.pow(rand(), 5) * 10.5;
            const stretch = Math.min(2.6, 1 / Math.max(.2, Math.sin(Math.PI * y / TEX_H)));
            ctx.save();
            ctx.translate(x, y);
            ctx.scale(stretch, 1);
            const bowl = ctx.createLinearGradient(-r, -r, r, r);
            bowl.addColorStop(0, "rgba(30,27,27,.46)");
            bowl.addColorStop(.53, "rgba(81,77,76,.26)");
            bowl.addColorStop(1, "rgba(227,219,203,.28)");
            ctx.fillStyle = bowl;
            ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
            ctx.lineWidth = Math.max(.55, r * .13);
            ctx.strokeStyle = "rgba(236,225,204,.48)";
            ctx.beginPath(); ctx.arc(0, 0, r, 2.75, 5.45); ctx.stroke();
            ctx.strokeStyle = "rgba(36,32,33,.32)";
            ctx.beginPath(); ctx.arc(0, 0, r, -.4, 2.48); ctx.stroke();
            ctx.restore();
        }
    }
    const textures = new Map();
    function surfaceTexture(index) {
        if (textures.has(index)) return textures.get(index);
        const ctx = makeCanvas(TEX_W, TEX_H).getContext("2d", { willReadFrequently: true });
        const pixels = ctx.createImageData(TEX_W, TEX_H);
        const data = pixels.data, land = index === 2 ? landMask() : null;
        const palette = gasColors[index] ? latitudePalette(gasColors[index]) : null;
        const seed = index * 71;
        for (let y = 0; y < TEX_H; y++) {
            const lat = y / TEX_H;
            for (let x = 0; x < TEX_W; x++) {
                const k = (y * TEX_W + x) * 4;
                const broad = noise(x * .008 + seed, y * .012);
                const detail = noise(x * .125, y * .15 + seed);
                const grain = noiseTable[((y & 255) << 8) + (x & 255)] - .5;
                let r, g, b;
                if (palette) {
                    const turbulent = index === 4 ? 1 : index === 5 ? .29 : .48;
                    const wave = (broad - .5) * .022 + (noise(x * .022 + broad * 3, y * .035) - .5) * .018;
                    const band = clamp(lat + turbulent * wave);
                    const row = Math.min(2047, Math.floor(band * 2047)) * 3;
                    const wisps = noise(x * .013 + broad * 8, y * .22 + broad * 5);
                    const stripe = Math.sin(band * 628) * 2.7 + Math.sin(band * 1030 + wisps) * 1.8;
                    const value = stripe + (wisps - .5) * (index === 4 ? 26 : 11) + (detail - .5) * 4 + grain * 3;
                    r = palette[row] + value; g = palette[row + 1] + value; b = palette[row + 2] + value;
                    if (index === 4) {
                        const dx = (x / TEX_W - .477) / .045, dy = (lat - .619) / .034;
                        const d = Math.sqrt(dx * dx + dy * dy) + (wisps - .5) * .18;
                        const storm = smooth(clamp((1.12 - d) * 5));
                        const curl = Math.sin(d * 21 + Math.atan2(dy, dx) + broad * 2) * 9;
                        r = lerp(r, 202 + curl, storm); g = lerp(g, 126 + curl, storm); b = lerp(b, 95 + curl, storm);
                    }
                } else if (index === 2) {
                    const ground = fractal(x * .028, y * .031);
                    const px = (Math.floor(x + (detail - .5) * 3) + TEX_W) & (TEX_W - 1);
                    const py = clamp(Math.floor(y + (broad - .5) * 4), 0, TEX_H - 1);
                    const coast = land[(py * TEX_W + px) * 4 + 3] / 255;
                    const desert = smooth(clamp(1 - Math.abs(lat - .36) * 10)) * (.65 + broad * .35);
                    r = lerp(25 + broad * 14, 54 + desert * 139 + ground * 43, coast);
                    g = lerp(67 + broad * 28, 85 + desert * 75 + ground * 40, coast);
                    b = lerp(106 + broad * 49, 66 + desert * 47 + ground * 20, coast);
                    const curl = noise(x * .009, y * .013) * 8;
                    const cloud = fractal(x * .021 + curl, y * .039 + 2.8 * Math.sin(curl));
                    const ice = clamp((Math.abs(lat - .5) - .412) * 19 + (broad - .5) * 1.35);
                    const cover = Math.max(ice, smooth(clamp((cloud - .44) * 3.8)) * .97);
                    r = lerp(r, 234 + detail * 12, cover); g = lerp(g, 239 + detail * 10, cover); b = lerp(b, 242 + detail * 10, cover);
                } else if (index === 1) {
                    const curl = broad * 9 + Math.sin(lat * 12) * 2;
                    const cloud = fractal(x * .012 + curl, y * .037 + Math.sin(curl) * 3);
                    const streak = Math.sin(lat * 30 + curl * 1.6 + cloud * 7);
                    const light = cloud * 64 + streak * 10 + detail * 5;
                    r = 177 + light; g = 132 + light; b = 78 + light * 1.18;
                } else {
                    const terrain = fractal(x * .018 + broad, y * .025 + seed);
                    if (index === 0) {
                        const dust = 74 + terrain * 102 + broad * 27 + detail * 18 + grain * 18;
                        r = dust * 1.035; g = dust; b = dust * .965;
                    } else {
                        const basalt = smooth(clamp((.55 - terrain) * 4));
                        const dust = broad * 22 + detail * 17 + grain * 8;
                        const ice = clamp((Math.abs(lat - .5) - .433) * 24 + (terrain - .5) * 1.8);
                        r = lerp(186 - basalt * 72 + dust, 219, ice);
                        g = lerp(100 - basalt * 43 + dust, 206, ice);
                        b = lerp(66 - basalt * 19 + dust * .83, 195, ice);
                    }
                }
                data[k] = r; data[k + 1] = g; data[k + 2] = b; data[k + 3] = 255;
            }
        }
        let result = data;
        if (index === 0) {
            ctx.putImageData(pixels, 0, 0);
            addImpactCraters(ctx);
            result = ctx.getImageData(0, 0, TEX_W, TEX_H).data;
        }
        // Match both edges of the longitude wrap, including craters and clouds.
        for (let y = 0; y < TEX_H; y++) {
            for (let x = 0; x < 22; x++) {
                const left = (y * TEX_W + x) * 4, right = (y * TEX_W + TEX_W - 1 - x) * 4;
                const amount = (1 - smooth(x / 22)) * .5;
                for (let c = 0; c < 3; c++) {
                    const difference = (result[right + c] - result[left + c]) * amount;
                    result[left + c] += difference; result[right + c] -= difference;
                }
            }
        }
        textures.set(index, result);
        return result;
    }

    // The same source also runs as a texture worker when served over HTTP.
    // Local file previews and browsers without workers use the same renderer inline.
    if (typeof document === "undefined") {
        self.onmessage = ({ data: index }) => {
            // Transfer a standalone buffer, independent of the canvas backing store.
            const pixels = surfaceTexture(index).slice();
            textures.delete(index);
            self.postMessage({ index, pixels }, [pixels.buffer]);
        };
        return;
    }
    let textureWorker = null;
    const textureJobs = new Map();
    if (/^https?:$/.test(location.protocol) && window.Worker && window.OffscreenCanvas) {
        try {
            textureWorker = new Worker(document.currentScript?.src || "orbit.js");
            textureWorker.onmessage = ({ data }) => {
                textures.set(data.index, data.pixels);
                textureJobs.get(data.index)?.resolve(); textureJobs.delete(data.index);
            };
            textureWorker.onerror = () => {
                textureWorker.terminate(); textureWorker = null;
                for (const job of textureJobs.values()) job.resolve();
                textureJobs.clear();
            };
        } catch { textureWorker = null; }
    }
    function pendingTexture(index) {
        if (textures.has(index) || !textureWorker) return null;
        if (!textureJobs.has(index)) {
            let resolve;
            const promise = new Promise(done => { resolve = done; });
            textureJobs.set(index, { promise, resolve }); textureWorker.postMessage(index);
        }
        return textureJobs.get(index).promise;
    }

    // Optical depth across the C, B, and A rings, including the Cassini Division.
    const ringTable = new Float32Array(4096 * 4);
    const ringIntegral = new Float64Array(4097 * 4);
    for (let i = 0; i < 4096; i++) {
        const r = 1.2 + i / 4095 * 1.13;
        const line = noise(r * 370, 59) * .57 + noise(r * 1230, 13) * .28 + noise(r * 78, 4) * .15;
        let density = .19 + .19 * line, light = .62 + line * .32;
        if (r > 1.52 && r < 1.955) {
            density = .84 + line * .16;
            light = .73 + .21 * line + .12 * Math.sin((r - 1.52) * 4) + .06 * Math.sin(r * 46) + .035 * Math.sin(r * 94);
        } else if (r >= 1.955 && r < 2.023) {
            density = .07 + .21 * line;
            light = .49 + line * .16;
        } else if (r >= 2.023) {
            density = (.74 + line * .19) * clamp((2.276 - r) * 180);
            light = .69 + .22 * line + .047 * Math.sin(r * 57);
            if (r > 2.209 && r < 2.217) density *= .18;
            if (r > 2.313 && r < 2.32) density = .34;
        }
        density *= clamp((r - 1.225) * 48);
        const k = i * 4;
        ringTable[k] = 230 * light;
        ringTable[k + 1] = 213 * light;
        ringTable[k + 2] = 192 * light;
        ringTable[k + 3] = density;
        for (let c = 0; c < 3; c++) ringIntegral[k + c + 4] = ringIntegral[k + c] + ringTable[k + c] * density;
        ringIntegral[k + 7] = ringIntegral[k + 3] + density;
    }
    const ringIndex = r => Math.min(4095, Math.floor((r - 1.2) / 1.13 * 4095)) * 4;
    const modelSizes = new WeakMap();
    function projectPlanet(canvas, index, rotatable = false) {
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;
        const width = canvas.clientWidth, height = canvas.clientHeight;
        if (!width || !height) return null;
        const hero = canvas.id === "heroModel";
        const ringed = index === 5, widthUnits = ringed ? 4.68 : 2.18, heightUnits = ringed ? 2.39 : 2.14;
        const density = Math.min(window.devicePixelRatio || 1, 1.45);
        const displayedRadius = Math.min(width / widthUnits, height / heightUnits);
        if (hero) {
            const compact = innerWidth <= 740;
            const px = width / 2 + (ringed ? (compact ? -1.74 : -1.36) : .42) * displayedRadius;
            const py = height / 2 + (ringed ? (compact ? .24 : .91) : .30) * displayedRadius;
            canvas.parentElement.style.setProperty("--feature-x", px + "px");
            canvas.parentElement.style.setProperty("--feature-y", py + "px");
        }
        const r = clamp(Math.round(displayedRadius * density / 4) * 4, 20, rotatable ? 340 : 160);
        const key = index + "/" + r + "/" + rotatable;
        const last = modelSizes.get(canvas);
        if (last && last.key === key) return last.turn;
        const tex = surfaceTexture(index);
        const w = Math.ceil(widthUnits * r), h = Math.ceil(heightUnits * r);
        canvas.width = w; canvas.height = h;
        const image = ctx.createImageData(w, h), out = image.data;
        const angle = [-.13,-.17,-.28,.19,-.11,-.34,-1.13,.17][index];
        const cos = Math.cos(angle), sin = Math.sin(angle);
        const tilt = ringed ? .286 : .18, co = Math.sqrt(1 - tilt * tilt);
        const flatten = ringed ? .915 : index === 4 ? .94 : .994;
        const startLon = index === 2 ? .10 : index === 3 ? .37 : .04;
        const lx = hero ? -.784 : -.723, ly = hero ? -.524 : -.504, lz = hero ? .332 : .472;
        const lu = lx * cos + ly * sin, lv = -lx * sin + ly * cos;
        const planeLight = -lv * co + lz * tilt;
        // Only visible surface pixels change during rotation. Keep their projection
        // and the light scattered by the foreground rings for inexpensive redraws.
        const capacity = rotatable ? Math.ceil(4 * (r + 2) ** 2) : 0;
        const positions = new Int32Array(capacity), samples = new Int32Array(capacity);
        const scales = new Float32Array(capacity), additions = new Uint8ClampedArray(capacity * 3);
        let count = 0;
        for (let y = 0; y < h; y++) {
            const sy = (y + .5 - h / 2) / r;
            for (let x = 0; x < w; x++) {
                const sx = (x + .5 - w / 2) / r;
                const u = sx * cos + sy * sin, v = -sx * sin + sy * cos;
                const nv = v / flatten, radial = u * u + nv * nv;
                const k = (y * w + x) * 4;
                let red = 0, green = 0, blue = 0, alpha = 0, light = 0, sample = 0, z = -4;
                if (radial <= 1) {
                    z = Math.sqrt(1 - radial);
                    const latitude = Math.asin(clamp(z * tilt - nv * co, -1, 1));
                    const longitude = Math.atan2(u, z * co + nv * tilt) + startLon;
                    const tx = Math.floor((longitude / TAU + .5) * TEX_W) & (TEX_W - 1);
                    const ty = clamp(Math.floor((.5 - latitude / Math.PI) * TEX_H), 0, TEX_H - 1);
                    sample = ty * TEX_W + tx;
                    const illumination = Math.max(0, u * lu + nv * lv + z * lz);
                    light = (hero ? .049 : .075) + Math.pow(illumination, .73) * 1.015;
                    if (ringed) {
                        const t = (v * co - z * tilt) / planeLight;
                        if (t > 0) {
                            const along = u + t * lu, across = (v + t * lv) / tilt;
                            const shadowR = Math.sqrt(along * along + across * across);
                            if (shadowR > 1.2 && shadowR < 2.33) light *= 1 - ringTable[ringIndex(shadowR) + 3] * .61;
                        }
                    }
                    const rim = Math.pow(1 - z, hero ? 2.8 : 3.25) * (.19 + .81 * illumination);
                    const atmosphere = index === 2 || index > 5 ? 1 : index === 0 ? .16 : hero ? .82 : .49;
                    const t = sample * 4;
                    red = tex[t] * light + 4 + rim * 74 * atmosphere;
                    green = tex[t + 1] * light + 4 + rim * 99 * atmosphere;
                    blue = tex[t + 2] * light + (hero ? 13 : 9) + rim * 144 * atmosphere;
                    alpha = clamp((1 - Math.sqrt(radial)) * r + .5);
                } else if (radial < 1.105 && index !== 0) {
                    const edge = Math.sqrt(radial) - 1;
                    const sunward = clamp(sx * lx + sy * ly + .24);
                    alpha = Math.exp(-edge * (hero ? 98 : 175)) * sunward * (hero ? .53 : .37);
                    red = index === 2 || index > 5 ? 116 : 233;
                    green = index === 2 || index > 5 ? 181 : 207; blue = 213;
                }
                if (ringed) {
                    const rr = Math.sqrt(u * u + v * v / (tilt * tilt));
                    const rz = v * co / tilt;
                    if (rr > 1.2 && rr < 2.33 && rz > z) {
                        // Integrate ringlets over the projected pixel footprint;
                        // even the thin outer ring stays continuous in a thumbnail.
                        const footprint = Math.hypot(u, v / (tilt * tilt)) / (r * rr);
                        const scale = 4095 / 1.13;
                        const lo = clamp(Math.floor((rr - footprint * .5 - 1.2) * scale), 0, 4095) * 4;
                        const hi = clamp(Math.ceil((rr + footprint * .5 - 1.2) * scale), lo / 4 + 1, 4096) * 4;
                        const total = ringIntegral[hi + 3] - ringIntegral[lo + 3];
                        const a = total * 4 / (hi - lo);
                        const towardsLight = u * lu + v * lv + rz * lz;
                        const near = u * u + v * v + rz * rz - towardsLight * towardsLight;
                        const shadow = towardsLight < 0 ? smooth(clamp((1.055 - near) / .14)) : 0;
                        const brightness = (.98 - (hero ? .17 : .095) * u / rr) * (1 - shadow * .84);
                        const combined = a + alpha * (1 - a);
                        const body = combined ? alpha * (1 - a) / combined : 0;
                        const reflectance = total > 0 ? brightness / total : 0;
                        red = red * body + (1 - body) * ((ringIntegral[hi] - ringIntegral[lo]) * reflectance + shadow * 3);
                        green = green * body + (1 - body) * ((ringIntegral[hi + 1] - ringIntegral[lo + 1]) * reflectance + shadow * 5);
                        blue = blue * body + (1 - body) * ((ringIntegral[hi + 2] - ringIntegral[lo + 2]) * reflectance + shadow * 10);
                        light *= body; alpha = combined;
                    }
                }
                if (alpha <= .001) continue;
                out[k] = red; out[k + 1] = green; out[k + 2] = blue; out[k + 3] = alpha * 255;
                if (rotatable && light > .005) {
                    positions[count] = k; samples[count] = sample; scales[count] = light;
                    const t = sample * 4, a = count * 3;
                    additions[a] = red - tex[t] * light; additions[a + 1] = green - tex[t + 1] * light; additions[a + 2] = blue - tex[t + 2] * light;
                    count++;
                }
            }
        }
        ctx.putImageData(image, 0, 0);
        canvas.parentElement.classList.add("has-model");
        let lastColumn = 0;
        const turn = rotatable ? fraction => {
            const column = Math.round(fraction * TEX_W) & (TEX_W - 1);
            if (column === lastColumn) return;
            lastColumn = column;
            for (let p = 0; p < count; p++) {
                const base = samples[p], k = positions[p], a = p * 3;
                const t = ((base & ~(TEX_W - 1)) + ((base + column) & (TEX_W - 1))) * 4;
                const light = scales[p];
                out[k] = tex[t] * light + additions[a];
                out[k + 1] = tex[t + 1] * light + additions[a + 1];
                out[k + 2] = tex[t + 2] * light + additions[a + 2];
            }
            const size = Math.ceil(r * 2 + 4);
            ctx.putImageData(image, 0, 0, Math.floor((w - size) / 2), Math.floor((h - size) / 2), size, size);
        } : null;
        modelSizes.set(canvas, { key, turn });
        return turn;
    }

    function paintSky() {
        const canvas = $("#starfield"), ctx = canvas.getContext("2d");
        if (!ctx) return;
        const { width, height } = canvas.getBoundingClientRect();
        if (!width || !height) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 1.35, Math.sqrt(2200000 / (width * height)));
        canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const fog = makeCanvas(Math.min(620, Math.ceil(width / 2.8)), Math.min(290, Math.ceil(height / 2.8)));
        const fogCtx = fog.getContext("2d"), image = fogCtx.createImageData(fog.width, fog.height);
        for (let y = 0; y < fog.height; y++) {
            for (let x = 0; x < fog.width; x++) {
                const u = x / fog.width, v = y / fog.height;
                const dust = fractal(u * 6.5 + 42, v * 3.7 + 35);
                const wisps = fractal(u * 25 + dust * 5, v * 13 + dust * 7);
                const spine = v - (.99 - .82 * u + Math.sin(u * 6.2) * .12 + (dust - .5) * .43);
                const ribbon = Math.exp(-spine * spine * 17);
                const gas = ribbon * (.24 + .76 * u) * Math.pow(clamp(dust * .96 + wisps * .75 - .37), 1.7);
                const halo = Math.exp(-((u - .70) ** 2 * 11 + (v - .44) ** 2 * 5));
                const blueCloud = Math.exp(-((u - .48) ** 2 * 18 + (v - .70) ** 2 * 9)) * dust;
                const i = (y * fog.width + x) * 4;
                image.data[i] = 5 + gas * 83 + halo * 6 + blueCloud * 4;
                image.data[i + 1] = 8 + gas * 53 + halo * 7 + blueCloud * 14;
                image.data[i + 2] = 17 + gas * 117 + halo * 14 + blueCloud * 28;
                image.data[i + 3] = 255;
            }
        }
        fogCtx.putImageData(image, 0, 0);
        ctx.drawImage(fog, 0, 0, width, height);
        const rand = randomSequence(241105);
        const stars = Math.min(1450, Math.floor(width * height / 630));
        for (let i = 0; i < stars; i++) {
            const x = rand() * width, y = rand() * height;
            const luminous = rand(), size = .21 + luminous ** 5 * 1.12;
            const alpha = (.18 + luminous * .6) * (.52 + .48 * x / width);
            const rgb = i % 7 === 0 ? "232,211,187" : i % 4 === 0 ? "168,190,244" : "213,226,242";
            if (luminous > .991) {
                const aura = ctx.createRadialGradient(x, y, 0, x, y, 8);
                aura.addColorStop(0, "rgba(" + rgb + ",.3)"); aura.addColorStop(1, "rgba(" + rgb + ",0)");
                ctx.fillStyle = aura; ctx.fillRect(x - 8, y - 8, 16, 16);
                ctx.fillStyle = "rgba(" + rgb + ",.26)";
                ctx.fillRect(x - 3.8, y - .33, 7.6, .66); ctx.fillRect(x - .33, y - 3.8, .66, 7.6);
            }
            ctx.fillStyle = "rgba(" + rgb + "," + alpha + ")";
            ctx.beginPath(); ctx.arc(x, y, size, 0, TAU); ctx.fill();
        }
    }

    const svgNS = "http://www.w3.org/2000/svg";
    const semiAxes = [34, 57, 82, 110, 149, 187, 230, 276];
    const initialAngles = [2.8, .8, 4.45, 1.76, 3.55, 5.48, 2.5, .29];
    const orbitLines = [], orbitButtons = [];
    function orbitPoint(index, anomaly) {
        const e = worlds[index].eccentricity, a = semiAxes[index];
        const x = a * (Math.cos(anomaly) - e);
        const y = a * Math.sqrt(1 - e * e) * Math.sin(anomaly) * .48;
        const angle = -.19 + Math.sin(index) * .035;
        return [319 + x * Math.cos(angle) - y * Math.sin(angle), 172 + x * Math.sin(angle) + y * Math.cos(angle)];
    }
    function createOrbitMap() {
        const svg = $("#orbitPaths");
        svg.innerHTML = '<defs><radialGradient id="sunGlow"><stop stop-color="#ffe9b4" stop-opacity=".85"/><stop offset=".22" stop-color="#edbf77" stop-opacity=".55"/><stop offset="1" stop-color="#e9a95f" stop-opacity="0"/></radialGradient></defs><circle cx="319" cy="172" r="24" fill="url(#sunGlow)"/><circle cx="319" cy="172" r="5" fill="#ffe8b2"/>';
        worlds.forEach((world, index) => {
            const line = document.createElementNS(svgNS, "path");
            const path = Array.from({ length: 100 }, (_, step) => orbitPoint(index, step / 100 * TAU).map(n => n.toFixed(2)).join(" "));
            line.setAttribute("d", "M" + path.join("L") + "Z");
            line.setAttribute("fill", "none");
            line.setAttribute("vector-effect", "non-scaling-stroke");
            svg.append(line); orbitLines.push(line);
            const button = document.createElement("button"), label = document.createElement("span");
            button.type = "button"; button.className = "map-node";
            button.setAttribute("aria-label", "Select " + world.name);
            button.style.setProperty("--node-size", [6,8,9,7,16,14,11,10][index] + "px");
            button.style.setProperty("--node-color", world.color);
            label.textContent = world.name; button.append(label);
            button.addEventListener("click", () => selectWorld(index));
            $("#mapMarkers").append(button); orbitButtons.push(button);
        });
    }
    function positionOrbits(days) {
        worlds.forEach((world, index) => {
            // Kepler's equation keeps the Sun at a focus and speeds up perihelion.
            const mean = (initialAngles[index] + TAU * days / world.days) % TAU;
            const e = world.eccentricity;
            let anomaly = mean;
            for (let step = 0; step < 4; step++) anomaly -= (anomaly - e * Math.sin(anomaly) - mean) / (1 - e * Math.cos(anomaly));
            const [x, y] = orbitPoint(index, anomaly);
            orbitButtons[index].style.left = x / 6.4 + "%";
            orbitButtons[index].style.top = y / 3.4 + "%";
        });
    }

    let selected = 5, mapVisible = false, simulationDays = 0;
    let spin = 0, turnHero = null, heroVisible = true;
    let frame = 0, lastTime = 0, lastPaint = 0, draggingHero = false;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
    const forcedColors = matchMedia("(forced-colors: active)");
    const lifetime = new AbortController();
    const observers = [];
    let moving = !reducedMotion.matches, pageActive = true, mainVisible = true;
    const dialog = $("#fieldNotes");
    let noted = 5, noteSpin = 0, turnNote = null, noteOpener = null;
    const portraitRequests = new WeakMap();

    function listen(target, type, handler, options = {}) {
        target.addEventListener(type, handler, { ...options, signal: lifetime.signal });
    }
    function canDecorate() {
        return moving && !reducedMotion.matches && !forcedColors.matches;
    }

    function createPointerEffects() {
        const halo = $("#cursorOrbit");
        const pointer = { active: false, x: 0, y: 0 };
        const buttons = ".action, .icon-button, .sound-control, .filters button, .view-switch button";
        const interactive = "a, button, summary, [tabindex='0']";
        let target = null, bounds = null, card = false, dirty = false;
        let haloX = 0, haloY = 0, wave = null;

        function releaseTarget() {
            if (!target) return;
            target.classList.remove("is-aimed");
            for (const name of ["--tilt-x", "--tilt-y", "--hot-x", "--hot-y", "--mag-x", "--mag-y"]) {
                target.style.removeProperty(name);
            }
            target = bounds = null;
        }
        function reset() {
            pointer.active = false; dirty = false;
            halo.classList.remove("is-visible", "is-engaged");
            releaseTarget();
        }
        function track(event) {
            if (!(event.target instanceof Element)) return;
            if (!canDecorate() || !finePointer.matches || event.pointerType === "touch" ||
                !pageActive || document.hidden || dialog.open || event.target.closest("input, textarea, [contenteditable='true']")) {
                if (pointer.active) reset();
                return;
            }
            pointer.x = event.clientX; pointer.y = event.clientY;
            if (!pointer.active) {
                haloX = pointer.x; haloY = pointer.y;
                halo.style.transform = "translate3d(" + haloX + "px," + haloY + "px,0)";
                pointer.active = true; halo.classList.add("is-visible");
                syncAnimation();
            }
            const hit = event.target.closest(interactive);
            const enabled = hit && !hit.matches(":disabled, [aria-disabled='true']");
            halo.classList.toggle("is-engaged", Boolean(enabled));
            const face = enabled && hit.matches(".planet-card, " + buttons) ? hit : null;
            if (face !== target) {
                releaseTarget(); target = face;
                if (target) {
                    bounds = target.getBoundingClientRect();
                    card = target.classList.contains("planet-card");
                    if (card) target.classList.add("is-aimed");
                }
            }
            dirty = true;
        }
        function update(elapsed) {
            if (!pointer.active) return;
            const follow = 1 - Math.exp(-elapsed * 23);
            if (Math.abs(haloX - pointer.x) + Math.abs(haloY - pointer.y) > .12) {
                haloX = lerp(haloX, pointer.x, follow); haloY = lerp(haloY, pointer.y, follow);
                halo.style.transform = "translate3d(" + haloX.toFixed(2) + "px," + haloY.toFixed(2) + "px,0)";
            }
            if (!dirty || !target || !bounds) return;
            dirty = false;
            const x = clamp((pointer.x - bounds.left) / Math.max(1, bounds.width));
            const y = clamp((pointer.y - bounds.top) / Math.max(1, bounds.height));
            if (card) {
                target.style.setProperty("--hot-x", (x * 100).toFixed(1) + "%");
                target.style.setProperty("--hot-y", (y * 100).toFixed(1) + "%");
                target.style.setProperty("--tilt-x", ((.5 - y) * 4.6).toFixed(2) + "deg");
                target.style.setProperty("--tilt-y", ((x - .5) * 5.4).toFixed(2) + "deg");
            } else {
                target.style.setProperty("--mag-x", ((x - .5) * 6).toFixed(2) + "px");
                target.style.setProperty("--mag-y", ((y - .5) * 4.6).toFixed(2) + "px");
            }
        }
        function ripple(event) {
            if (!canDecorate() || !(event.target instanceof Element)) return;
            const control = event.target.closest(buttons + ", .answer");
            if (!control || control.matches(":disabled, [aria-disabled='true']")) return;
            const rect = control.getBoundingClientRect();
            const x = event.detail ? event.clientX - rect.left : rect.width / 2;
            const y = event.detail ? event.clientY - rect.top : rect.height / 2;
            wave?.remove();
            wave = document.createElement("span"); wave.className = "click-wave";
            wave.setAttribute("aria-hidden", "true");
            wave.style.setProperty("--wave-size", (2.1 * Math.hypot(rect.width, rect.height)) + "px");
            wave.style.setProperty("--wave-x", x + "px"); wave.style.setProperty("--wave-y", y + "px");
            control.append(wave);
        }
        listen(document, "pointermove", track, { passive: true });
        listen(document, "pointerout", event => { if (!event.relatedTarget) reset(); }, { passive: true });
        listen(document, "pointerdown", event => { if (event.pointerType === "touch") reset(); }, { passive: true });
        listen(document, "pointercancel", reset);
        listen(document, "keydown", reset);
        listen(window, "blur", reset);
        listen(window, "scroll", reset, { passive: true });
        listen(document, "click", ripple, { capture: true });
        listen(document, "animationend", event => {
            if (event.target === wave) { wave.remove(); wave = null; }
        });
        return { pointer, update, reset, clear() { reset(); wave?.remove(); wave = null; } };
    }

    function createDustField(pointer) {
        const canvas = $("#spaceDust"), ctx = canvas.getContext("2d");
        const grains = [], trail = [];
        const rand = randomSequence(78351);
        let width = 0, height = 0, pixelRatio = 0, clock = 0, carry = 0;
        let lastX = null, lastY = 0, meteor = null, untilMeteor = 9;
        function resize() {
            if (!ctx) return;
            const w = canvas.clientWidth, h = canvas.clientHeight;
            if (!w || !h) return;
            const ratio = Math.min(devicePixelRatio || 1, finePointer.matches ? 1.35 : 1,
                Math.sqrt(2000000 / (w * h)));
            const count = finePointer.matches ? clamp(Math.round(w * h / 15500), 28, 76) : clamp(Math.round(w * h / 22000), 12, 23);
            if (width === w && height === h && ratio === pixelRatio && grains.length === count) return;
            width = w; height = h; pixelRatio = ratio;
            canvas.width = Math.round(w * ratio); canvas.height = Math.round(h * ratio);
            ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
            const seed = randomSequence(349019);
            grains.length = trail.length = 0; meteor = null; lastX = null;
            for (let i = 0; i < count; i++) {
                grains.push({ u: seed(), v: seed(), depth: .24 + seed() * .76, phase: seed() * TAU,
                    x: 0, y: 0, vx: 0, vy: 0, color: i % 4 ? "#a8c9e5" : "#b9abde" });
            }
        }
        function clear() {
            if (ctx) ctx.clearRect(0, 0, width, height);
            trail.length = 0; lastX = null; meteor = null; carry = 0;
            for (const grain of grains) grain.x = grain.y = grain.vx = grain.vy = 0;
        }
        function drawTrail(dt) {
            if (pointer.active && lastX !== null) {
                const dx = pointer.x - lastX, dy = pointer.y - lastY, distance = Math.hypot(dx, dy);
                const count = distance < 160 ? Math.min(3, Math.floor(distance / 6)) : 0;
                for (let i = 0; i < count; i++) {
                    const along = (i + rand() * .7) / count;
                    trail.push({ x: lastX + dx * along + (rand() - .5) * 3, y: lastY + dy * along,
                        vx: (rand() - .5) * 11 - dx * .035, vy: (rand() - .5) * 12 - dy * .035,
                        age: 0, life: .22 + rand() * .19, size: .65 + rand() * .65 });
                }
                if (trail.length > 16) trail.splice(0, trail.length - 16);
            }
            lastX = pointer.active ? pointer.x : null; lastY = pointer.y;
            ctx.fillStyle = "#c6daff";
            for (let i = trail.length - 1; i >= 0; i--) {
                const p = trail[i]; p.age += dt;
                if (p.age >= p.life) { trail.splice(i, 1); continue; }
                p.x += p.vx * dt; p.y += p.vy * dt;
                ctx.globalAlpha = .7 * (1 - p.age / p.life) ** 2;
                ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, TAU); ctx.fill();
            }
        }
        function drawMeteor(dt) {
            if (!heroVisible || mapVisible) { meteor = null; return; }
            untilMeteor -= dt;
            if (!meteor && untilMeteor <= 0) {
                meteor = { x: width * (.22 + rand() * .52), y: height * (.05 + rand() * .14), age: 0 };
                untilMeteor = 22 + rand() * 19;
            }
            if (!meteor) return;
            meteor.age += dt;
            if (meteor.age >= .95) { meteor = null; return; }
            const t = meteor.age / .95, span = Math.min(width * .19, 220);
            const x = meteor.x + t * span, y = meteor.y + t * span * .35;
            const length = Math.min(67, span * .4) * Math.sin(Math.PI * t);
            const tail = ctx.createLinearGradient(x - length, y - length * .35, x, y);
            tail.addColorStop(0, "rgba(151,179,226,0)"); tail.addColorStop(1, "#deeaff");
            ctx.globalAlpha = .67 * Math.sin(Math.PI * t);
            ctx.strokeStyle = tail; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(x - length, y - length * .35); ctx.lineTo(x, y); ctx.stroke();
        }
        function paint(elapsed) {
            if (!ctx || !width) return;
            carry += elapsed;
            if (carry < 1 / (finePointer.matches ? 30 : 20)) return;
            const dt = Math.min(carry, .085); carry = 0; clock += dt;
            ctx.clearRect(0, 0, width, height);
            const damping = Math.exp(-dt * 8.7);
            for (const p of grains) {
                const spanX = width + 32, spanY = height + 32;
                const x = (p.u * spanX + clock * (1.2 + p.depth * 3.1)) % spanX - 16;
                const travel = p.v * spanY + clock * (.4 + p.depth) - scrollY * p.depth * .045;
                const y = ((travel % spanY) + spanY) % spanY - 16 + Math.sin(p.phase + clock * .09) * 3;
                const dx = pointer.x - x, dy = pointer.y - y, range = 95 + p.depth * 64;
                const proximity = pointer.active ? clamp(1 - (dx * dx + dy * dy) / (range * range)) : 0;
                const pull = proximity * proximity * (.29 + p.depth * .21);
                p.vx = (p.vx + (dx * pull - p.x) * 45 * dt) * damping;
                p.vy = (p.vy + (dy * pull - p.y) * 45 * dt) * damping;
                p.x += p.vx * dt; p.y += p.vy * dt;
                ctx.globalAlpha = .17 + p.depth * .31 + proximity * .22;
                ctx.fillStyle = p.color;
                ctx.beginPath(); ctx.arc(x + p.x, y + p.y, .4 + p.depth * .88, 0, TAU); ctx.fill();
            }
            drawTrail(dt); drawMeteor(dt); ctx.globalAlpha = 1;
        }
        return { resize, paint, clear, supported: Boolean(ctx) };
    }
    const cursor = createPointerEffects();
    const dust = createDustField(cursor.pointer);
    let updateScroll = () => {};

    function preparePortrait(canvas, index, ready) {
        const request = {};
        portraitRequests.set(canvas, request);
        const draw = () => {
            if (lifetime.signal.aborted || portraitRequests.get(canvas) !== request) return;
            ready(projectPlanet(canvas, index, true));
            canvas.classList.remove("is-loading");
        };
        const waiting = pendingTexture(index);
        if (waiting) {
            canvas.classList.add("is-loading");
            canvas.parentElement.classList.remove("has-model");
            waiting.then(draw);
        }
        else draw();
    }
    function renderHero() {
        turnHero = null;
        preparePortrait($("#heroModel"), selected, turn => { turnHero = turn; if (turn) turn(spin); });
    }
    function renderNote() {
        turnNote = null;
        preparePortrait($("#noteModel"), noted, turn => { turnNote = turn; if (turn) turn(noteSpin); });
    }

    function tick(now) {
        frame = 0;
        const elapsed = lastTime ? Math.min(.15, (now - lastTime) / 1000) : 0;
        lastTime = now;
        if (heroVisible) {
            if (mapVisible) simulationDays += elapsed * 2.8;
            else if (!draggingHero) spin += elapsed / 245 * (selected === 1 || selected === 6 ? -1 : 1);
            if (now - lastPaint >= (mapVisible ? 33 : 80)) {
                if (mapVisible) positionOrbits(simulationDays);
                else if (turnHero) turnHero(spin);
                lastPaint = now;
            }
        }
        if (canDecorate()) {
            cursor.update(elapsed);
            if (mainVisible) dust.paint(elapsed);
        }
        syncAnimation();
    }
    function syncAnimation() {
        const fieldVisible = canDecorate() && ((mainVisible && dust.supported) || cursor.pointer.active);
        if (pageActive && moving && !document.hidden && !dialog.open && (heroVisible || fieldVisible)) {
            if (!frame) frame = requestAnimationFrame(tick);
        } else {
            cancelAnimationFrame(frame); frame = 0; lastTime = 0;
        }
    }
    function setMotion(enabled) {
        moving = enabled;
        document.documentElement.classList.toggle("motion-off", !enabled);
        const button = $("#motionToggle"), label = enabled ? "Pause motion" : "Resume motion";
        button.setAttribute("aria-label", label); button.title = label;
        button.querySelector("use").setAttribute("href", enabled ? "#i-pause" : "#i-play");
        if (canDecorate()) dust.resize();
        else { cursor.clear(); dust.clear(); resetParallax(); }
        updateScroll();
        syncAnimation();
    }
    function resetParallax() {
        const stage = $("#portraitStage");
        stage.style.removeProperty("--look-x"); stage.style.removeProperty("--look-y");
    }
    function numberWithUnit(element, number, unit) {
        const small = document.createElement("small");
        small.textContent = unit; element.replaceChildren(number + " ", small);
    }
    function selectWorld(index, announce = true) {
        selected = (index + worlds.length) % worlds.length;
        const world = worlds[selected], number = pad(selected + 1);
        $("#featureName").textContent = world.name; $("#featureIntro").textContent = world.intro;
        $("#featureClass").textContent = world.type;
        numberWithUnit($("#featureRadius"), world.radius, "km");
        numberWithUnit($("#featurePeriod"), ...world.period.split(" "));
        const link = $("#exploreFeature");
        link.firstElementChild.textContent = "Explore " + world.name; link.href = sourceURL(world);
        $("#sceneNumber").textContent = number;
        $(".scene-number").setAttribute("aria-label", "Planet " + (selected + 1) + " of 8");
        $("#figureLabel").textContent = world.feature;
        $("#heroModel").setAttribute("aria-label", "Illustrated view of " + world.name + (selected === 5 ? " and its rings" : ""));
        $("#portraitStage").dataset.world = selected;
        $("#viewport").classList.toggle("no-moon", selected < 2);
        spin = 0;
        if (!mapVisible) renderHero();
        orbitButtons.forEach((button, i) => {
            const active = i === selected;
            button.setAttribute("aria-pressed", String(active));
            orbitLines[i].setAttribute("stroke", active ? "#8bd0e4" : "#4a5a72");
            orbitLines[i].setAttribute("stroke-opacity", active ? ".85" : ".65");
        });
        if (announce) {
            $("#sceneAnnouncement").textContent = world.name + ", planet " + (selected + 1) + " of 8.";
            if (moving && $("#featureText").animate) {
                $("#featureText").animate([{ opacity: .45, transform: "translateY(4px)" }, { opacity: 1, transform: "none" }], { duration: 230, easing: "ease-out" });
                if (!mapVisible) $("#heroModel").animate([{ opacity: .38 }, { opacity: 1 }], { duration: 300 });
            }
        }
    }
    function setView(map) {
        if (mapVisible === map) return;
        mapVisible = map;
        $("#viewport").classList.toggle("in-map", map);
        $("#portraitStage").hidden = map; $("#orbitMap").hidden = !map;
        $("#portraitMode").setAttribute("aria-pressed", String(!map)); $("#mapMode").setAttribute("aria-pressed", String(map));
        if (map) positionOrbits(simulationDays);
        else renderHero();
        $("#sceneAnnouncement").textContent = map ? "Orbit map. Select a planet to observe it." : "Planet view of " + worlds[selected].name + ".";
    }
    function bindRotation(element, readAngle, writeAngle, onDrag) {
        let pointer = null, startX = 0, startAngle = 0, pending = 0, value = 0;
        listen(element, "pointerdown", event => {
            if (!event.isPrimary || event.button !== 0) return;
            pointer = event.pointerId; startX = event.clientX; startAngle = readAngle();
            element.setPointerCapture(pointer); element.classList.add("is-dragging");
            if (onDrag) onDrag(true);
        });
        listen(element, "pointermove", event => {
            if (pointer !== event.pointerId) return;
            value = startAngle - (event.clientX - startX) / Math.max(140, element.clientWidth) * .85;
            if (!pending) pending = requestAnimationFrame(() => { pending = 0; writeAngle(value); });
        });
        const finish = () => {
            if (pointer === null) return;
            pointer = null; element.classList.remove("is-dragging");
            if (onDrag) onDrag(false);
        };
        listen(element, "pointerup", finish);
        listen(element, "lostpointercapture", finish);
        listen(element, "pointercancel", finish);
        lifetime.signal.addEventListener("abort", () => cancelAnimationFrame(pending), { once: true });
        listen(element, "keydown", event => {
            if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
            event.preventDefault(); event.stopPropagation();
            writeAngle(readAngle() + (event.key === "ArrowRight" ? .035 : -.035));
        });
    }

    function displayNote(index) {
        noted = (index + worlds.length) % worlds.length;
        const world = worlds[noted]; noteSpin = 0;
        $("#noteName").textContent = world.name; $("#noteClass").textContent = world.type;
        $("#noteCode").textContent = "SOL / " + pad(noted + 1);
        $("#noteDescription").textContent = world.note; $("#noteSource").href = sourceURL(world);
        const periodText = world.period.replace(" yr", " years").replace(" d", " days");
        const facts = [["Mean radius", world.radius + " km"], ["Rotation period", world.rotation], ["Orbital period", periodText], ["Mean Sun distance", world.distance]];
        $("#noteFacts").replaceChildren(...facts.map(([label, value]) => {
            const row = document.createElement("div"), dt = document.createElement("dt"), dd = document.createElement("dd");
            dt.textContent = label; dd.textContent = value; row.append(dt, dd); return row;
        }));
        $(".dossier-figure").dataset.world = noted;
        $("#noteModel").setAttribute("aria-label", "Illustration of " + world.name);
        renderNote();
        $("#noteAnnouncement").textContent = world.name + " field notes.";
    }
    function openNotes(event, index) {
        if (event.button > 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey || typeof dialog.showModal !== "function") return;
        event.preventDefault();
        noteOpener = event.currentTarget; dialog.showModal(); cursor.clear(); dust.clear();
        displayNote(index); syncAnimation();
    }
    $("#exploreFeature").addEventListener("click", event => openNotes(event, selected));
    $("#closeNotes").addEventListener("click", () => dialog.close());
    $("#previousNote").addEventListener("click", () => displayNote(noted - 1));
    $("#nextNote").addEventListener("click", () => displayNote(noted + 1));
    dialog.addEventListener("click", event => {
        if (event.target !== dialog) return;
        const box = dialog.getBoundingClientRect();
        if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
    });
    dialog.addEventListener("close", () => { noteOpener?.focus({ preventScroll: true }); syncAnimation(); });

    const cards = $$(".planet-card");
    const drawQueue = new Set();
    const idle = window.requestIdleCallback?.bind(window) || (callback => setTimeout(callback, 16));
    const cancelIdle = window.cancelIdleCallback?.bind(window) || clearTimeout;
    let cardIdle = 0, preparingCard = false;
    function scheduleCard() {
        if (cardIdle || preparingCard || !drawQueue.size || !pageActive || document.hidden || lifetime.signal.aborted) return;
        cardIdle = idle(() => {
            cardIdle = 0;
            const item = drawQueue.values().next().value;
            if (!item || !pageActive || document.hidden) return;
            const index = Number(item.dataset.world);
            const nearby = () => {
                const rect = item.getBoundingClientRect();
                return !item.hidden && rect.bottom > -250 && rect.top < innerHeight + 250;
            };
            if (!nearby()) { drawQueue.delete(item); scheduleCard(); return; }
            preparingCard = true;
            const finish = () => {
                preparingCard = false;
                if (lifetime.signal.aborted || !pageActive || document.hidden) return;
                if (nearby()) projectPlanet(item.querySelector("canvas"), index);
                drawQueue.delete(item); scheduleCard();
            };
            const waiting = pendingTexture(index);
            if (waiting) waiting.then(finish); else finish();
        }, { timeout: 220 });
    }
    function queueCard(card) {
        if (!card.hidden) { drawQueue.add(card); scheduleCard(); }
    }
    let category = "all";
    function applyFilters() {
        const query = $("#search").value.toLowerCase().trim();
        let count = 0;
        cards.forEach((card, i) => {
            const world = worlds[i];
            card.hidden = !(world.name.toLowerCase().includes(query) && (category === "all" || groupOf(world) === category));
            if (!card.hidden) { count++; if (card.getBoundingClientRect().top < innerHeight + 250) queueCard(card); }
        });
        $("#indexCount").textContent = pad(count);
        $("#filterStatus").textContent = count + (count === 1 ? " planet" : " planets") + " shown.";
        $("#emptyState").hidden = count > 0;
        $$("[data-filter]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.filter === category)));
    }
    cards.forEach((card, i) => {
        card.setAttribute("aria-label", "Open " + worlds[i].name + " field notes");
        card.addEventListener("click", event => openNotes(event, i));
    });
    $$("[data-filter]").forEach(button => button.addEventListener("click", () => { category = button.dataset.filter; applyFilters(); }));
    $("#search").addEventListener("input", applyFilters);
    $("#clearSearch").addEventListener("click", () => { category = "all"; $("#search").value = ""; applyFilters(); $("#search").focus(); });

    function initNavigation() {
        const nav = $("#mainNav"), toggle = $("#menuToggle"), links = Array.from(nav.querySelectorAll("a"));
        const sections = links.map(link => $(link.hash));
        const header = $(".masthead"), missionList = $(".mission-list");
        function setMenu(open) {
            nav.classList.toggle("is-open", open); toggle.setAttribute("aria-expanded", String(open));
            toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
            toggle.querySelector("use").setAttribute("href", open ? "#i-close" : "#i-menu");
        }
        listen(toggle, "click", () => setMenu(!nav.classList.contains("is-open")));
        links.forEach(link => listen(link, "click", () => setMenu(false)));
        listen(document, "pointerdown", event => {
            if (nav.classList.contains("is-open") && !event.target.closest(".masthead")) setMenu(false);
        });
        listen(document, "keydown", event => {
            if (event.key === "Escape" && nav.classList.contains("is-open")) { setMenu(false); toggle.focus(); }
        });
        listen(matchMedia("(min-width: 741px)"), "change", event => { if (event.matches) setMenu(false); });
        let scheduled = 0;
        function updateNav() {
            scheduled = 0;
            const rects = sections.map(section => section.getBoundingClientRect());
            const headerHeight = header.offsetHeight, line = headerHeight + Math.min(innerHeight * .26, 160);
            let active = 0;
            rects.forEach((rect, i) => { if (rect.top <= line) active = i; });
            if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2) active = links.length - 1;
            links.forEach((link, i) => { if (i === active) link.setAttribute("aria-current", "location"); else link.removeAttribute("aria-current"); });
            // Two different travel distances retain depth during native scrolling.
            const hero = rects[0];
            if (hero.bottom > 0 || !canDecorate()) {
                const progress = canDecorate() ? clamp((headerHeight - hero.top) / hero.height) : 0;
                const travel = innerWidth <= 740 ? 31 : 73;
                sections[0].style.setProperty("--planet-shift", (progress * travel).toFixed(2) + "px");
                sections[0].style.setProperty("--sky-shift", (progress * 23).toFixed(2) + "px");
            }
            const mission = rects[2];
            const flown = canDecorate() ? clamp((innerHeight * .83 - mission.top) / (mission.height * .76)) : 1;
            missionList.style.setProperty("--mission-progress", flown.toFixed(3));
        }
        function schedule() { if (pageActive && !scheduled) scheduled = requestAnimationFrame(updateNav); }
        listen(window, "scroll", schedule, { passive: true });
        lifetime.signal.addEventListener("abort", () => cancelAnimationFrame(scheduled), { once: true });
        updateNav();
        return schedule;
    }
    function initSound() {
        const button = $("#soundToggle"), Audio = window.AudioContext || window.webkitAudioContext;
        if (!Audio) { button.hidden = true; return; }
        let context, volume, enabled = false, sleepTimer;
        function buildAudio() {
            context = new Audio();
            volume = context.createGain(); volume.gain.value = 0; volume.connect(context.destination);
            [55, 82.41, 110.13, 164.81].forEach((frequency, i) => {
                const tone = context.createOscillator(), level = context.createGain();
                tone.type = "sine"; tone.frequency.value = frequency; level.gain.value = [.46,.25,.15,.055][i];
                tone.connect(level); level.connect(volume); tone.start();
            });
        }
        async function sync() {
            clearTimeout(sleepTimer);
            if (enabled && !document.hidden) {
                await context.resume();
                volume.gain.setTargetAtTime(.085, context.currentTime, .45);
            } else if (context) {
                volume.gain.setTargetAtTime(0, context.currentTime, .065);
                sleepTimer = setTimeout(() => { if (!enabled || document.hidden) context.suspend().catch(() => {}); }, 320);
            }
        }
        button.addEventListener("click", async () => {
            button.disabled = true;
            try {
                if (!context) buildAudio();
                enabled = !enabled; await sync();
                button.setAttribute("aria-pressed", String(enabled)); $("#soundState").textContent = enabled ? "Sound on" : "Sound off";
            } catch {
                enabled = false; button.setAttribute("aria-pressed", "false"); $("#soundState").textContent = "Sound unavailable";
            } finally { button.disabled = false; }
        });
        listen(document, "visibilitychange", () => { if (context) sync().catch(() => {}); });
        listen(window, "pagehide", event => {
            clearTimeout(sleepTimer);
            if (context) (event.persisted ? context.suspend() : context.close()).catch(() => {});
        });
        listen(window, "pageshow", () => { if (context && enabled) sync().catch(() => {}); });
    }

    const questions = [
        { text: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Mercury", "Jupiter"], correct: 1, detail: "Iron oxides give the dust on Mars its red color." },
        { text: "Which planet has the most prominent ring system?", options: ["Earth", "Neptune", "Saturn", "Uranus"], correct: 2, detail: "Saturn’s wide, icy rings reflect enough sunlight to stand out even through a small telescope." },
        { text: "Which galaxy contains our solar system?", options: ["Andromeda", "Whirlpool", "Sombrero", "Milky Way"], correct: 3, detail: "The Sun and its planets lie in the Milky Way’s Orion Arm." }
    ];
    function initQuiz() {
        const answers = $("#answers"), next = $("#nextButton"), form = $("#scoreForm"), restart = $("#restartQuiz");
        const section = $("#quiz");
        let step = 0, score = 0, answered = false;
        function eclipse(completed, finished = false) {
            section.style.setProperty("--eclipse-rest", (.72 * (1 - completed / questions.length)).toFixed(2));
            section.classList.toggle("is-complete", finished);
        }
        function showQuestion(focus) {
            const q = questions[step];
            eclipse(step);
            answered = false; next.hidden = false; next.disabled = true; restart.hidden = true; form.hidden = true;
            $("#saveStatus").textContent = ""; $("#feedback").textContent = "";
            $("#questionNumber").textContent = "Question " + pad(step + 1) + " / " + pad(questions.length);
            $$(".quiz-track i").forEach((el, i) => el.classList.toggle("active", i <= step));
            $("#question").textContent = q.text;
            next.querySelector("span").textContent = step === questions.length - 1 ? "View result" : "Next question";
            answers.replaceChildren(...q.options.map((option, index) => {
                const button = document.createElement("button"), letter = document.createElement("span");
                button.type = "button"; button.className = "answer";
                letter.className = "letter"; letter.setAttribute("aria-hidden", "true"); letter.textContent = String.fromCharCode(65 + index);
                button.append(letter, option);
                button.addEventListener("click", () => {
                    if (answered) return;
                    answered = true;
                    eclipse(step + 1);
                    const correct = index === q.correct;
                    if (correct) score++;
                    else button.classList.add("incorrect");
                    answers.children[q.correct].classList.add("correct");
                    for (const choice of answers.children) {
                        choice.setAttribute("aria-disabled", "true");
                        if (choice !== button) choice.disabled = true;
                    }
                    $("#feedback").textContent = (correct ? "Correct. " : "The answer is " + q.options[q.correct] + ". ") + q.detail;
                    next.disabled = false;
                });
                return button;
            }));
            if (focus) $("#question").focus({ preventScroll: true });
        }
        next.addEventListener("click", () => {
            if (!answered) return;
            if (step < questions.length - 1) { step++; showQuestion(true); return; }
            eclipse(questions.length, true);
            $("#questionNumber").textContent = "Quiz complete"; $("#question").textContent = score + " of " + questions.length + " correct.";
            answers.replaceChildren(); next.hidden = true; form.hidden = false; restart.hidden = false;
            $("#scoreInput").value = score;
            $("#feedback").textContent = score === questions.length ? "Every answer correct. Record your result in the flight log." : "Record your result in the flight log, or take another pass through the atlas.";
            $("#question").focus({ preventScroll: true });
        });
        restart.addEventListener("click", () => { score = 0; step = 0; showQuestion(true); });
        form.addEventListener("submit", async event => {
            event.preventDefault();
            const status = $("#saveStatus"), submit = form.querySelector("button");
            if (location.protocol === "file:") {
                status.textContent = "Score saving requires a PHP server. Your result is shown above."; return;
            }
            if (submit.disabled) return;
            submit.disabled = true; restart.disabled = true; status.textContent = "Saving your score…";
            try {
                const response = await fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" }, credentials: "same-origin" });
                if (!response.headers.get("Content-Type")?.includes("application/json")) {
                    status.textContent = "Score saving requires a PHP-enabled server. Your result is shown above."; return;
                }
                const result = await response.json();
                if (response.ok && result.saved) { location.assign(form.action); return; }
                status.textContent = result.message || "Your score could not be saved. Please try again.";
            } catch {
                status.textContent = "The score service could not be reached. Your result is still here.";
            } finally { submit.disabled = false; restart.disabled = false; }
        });
        showQuestion(false);
    }

    document.documentElement.classList.add("enhanced");
    createOrbitMap(); positionOrbits(0);
    updateScroll = initNavigation(); initSound(); initQuiz();
    $("#previousWorld").addEventListener("click", () => selectWorld(selected - 1));
    $("#nextWorld").addEventListener("click", () => selectWorld(selected + 1));
    $("#portraitMode").addEventListener("click", () => setView(false));
    $("#mapMode").addEventListener("click", () => setView(true));
    $("#motionToggle").addEventListener("click", () => setMotion(!moving));
    listen(reducedMotion, "change", event => setMotion(!event.matches));
    listen(finePointer, "change", () => { cursor.clear(); dust.resize(); });
    listen(forcedColors, "change", () => setMotion(moving));
    listen($("#viewport"), "pointermove", event => {
        if (!canDecorate() || !finePointer.matches || mapVisible || draggingHero || event.pointerType !== "mouse") return;
        const rect = event.currentTarget.getBoundingClientRect(), stage = $("#portraitStage");
        stage.style.setProperty("--look-x", ((event.clientX - rect.left) / rect.width - .5) * 7 + "px");
        stage.style.setProperty("--look-y", ((event.clientY - rect.top) / rect.height - .5) * 5 + "px");
    });
    listen($("#viewport"), "pointerleave", resetParallax);
    bindRotation($("#portraitStage"), () => spin, value => { spin = value; if (turnHero) turnHero(spin); }, active => { draggingHero = active; });
    bindRotation($(".dossier-figure"), () => noteSpin, value => { noteSpin = value; if (turnNote) turnNote(noteSpin); });
    const atlas = $("#main"), heroSection = $("#home");
    const root = document.documentElement;
    let openingTimer = 0, resizeTimer = 0;
    if (canDecorate() && (!location.hash || location.hash === "#home")) {
        root.classList.add("hero-opening");
        openingTimer = setTimeout(() => root.classList.remove("hero-opening"), 800);
    }
    selectWorld(selected, false); paintSky(); setMotion(moving);

    function observe(targets, callback, options) {
        const observer = new IntersectionObserver(callback, options);
        targets.forEach(target => observer.observe(target));
        observers.push(observer);
    }
    const sections = [heroSection, $("#missions"), $("#quiz")];
    if ("IntersectionObserver" in window) {
        observe(cards, entries => {
            for (const entry of entries) if (entry.isIntersecting) queueCard(entry.target);
        }, { rootMargin: "240px 0px" });
        observe([atlas, ...sections], entries => {
            for (const { target, isIntersecting } of entries) {
                if (target === atlas) mainVisible = isIntersecting;
                else target.classList.toggle("is-in-view", isIntersecting);
                if (target === heroSection) {
                    heroVisible = isIntersecting;
                    if (heroVisible && !mapVisible) renderHero();
                }
            }
            syncAnimation();
        });
        const entrances = $$(".index-toolbar, .planet-card, .mission-layout > .section-heading, .mission, .quiz-layout > *, .site-footer .shell");
        observe(entrances, (entries, observer) => {
            let sequence = 0;
            for (const { target, isIntersecting } of entries) {
                if (!isIntersecting) continue;
                observer.unobserve(target);
                if (!canDecorate() || document.hidden || target.contains(document.activeElement)) continue;
                target.style.setProperty("--entry-lag", Math.min(sequence++, 3) * 42 + "ms");
                target.classList.add("atlas-reveal");
            }
        }, { threshold: .07 });
        listen(document, "animationend", event => {
            if (event.animationName === "page-arrive") event.target.classList.remove("atlas-reveal");
        });
    } else {
        sections.forEach(section => section.classList.add("is-in-view"));
        cards.forEach(card => projectPlanet(card.querySelector("canvas"), Number(card.dataset.world)));
    }
    listen(window, "resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            paintSky(); cursor.reset(); dust.resize(); updateScroll();
            if (heroVisible && !mapVisible) renderHero();
            if (dialog.open) renderNote();
            cards.forEach(card => { if (!card.hidden && card.getBoundingClientRect().top < innerHeight + 250) queueCard(card); });
        }, 150);
    });
    function updateActivity() {
        root.classList.toggle("page-idle", !pageActive || document.hidden);
        if (!pageActive || document.hidden) {
            cursor.clear(); dust.clear(); cancelIdle(cardIdle); cardIdle = 0;
            clearTimeout(resizeTimer);
        } else {
            if (canDecorate()) dust.resize();
            scheduleCard(); updateScroll();
        }
        syncAnimation();
    }
    listen(document, "visibilitychange", updateActivity);
    listen(window, "pageshow", () => { pageActive = true; updateActivity(); });
    listen(window, "pagehide", event => {
        pageActive = false; updateActivity();
        if (event.persisted) return;
        clearTimeout(openingTimer);
        for (const observer of observers) observer.disconnect();
        lifetime.abort(); drawQueue.clear();
        textureWorker?.terminate();
        for (const job of textureJobs.values()) job.resolve();
        textureJobs.clear();
    });
})();
