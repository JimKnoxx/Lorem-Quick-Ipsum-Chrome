const WCAG_CONTRAST = 4.5;
const WHITE_LUMINANCE = 1;

export function hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToRgb(hex) {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function luminance(r, g, b) {
    const a = [r, g, b].map(function (v) {
        v /= 255;
        return v <= 0.03928
            ? v / 12.92
            : Math.pow( (v + 0.055) / 1.055, 2.4 );
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

export function shadeColor(color, amount) {
    color = color.replace(/^#/, '')
    if (color.length === 3) color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2]

    let [r, g, b] = color.match(/.{2}/g);
    ([r, g, b] = [parseInt(r, 16) + amount, parseInt(g, 16) + amount, parseInt(b, 16) + amount])

    r = Math.max(Math.min(255, r), 0).toString(16)
    g = Math.max(Math.min(255, g), 0).toString(16)
    b = Math.max(Math.min(255, b), 0).toString(16)

    const rr = (r.length < 2 ? '0' : '') + r
    const gg = (g.length < 2 ? '0' : '') + g
    const bb = (b.length < 2 ? '0' : '') + b

    return `#${rr}${gg}${bb}`
}

export function hasWCAGContrastToWhite(color) {
    const inputToRGB = hexToRgb(color);
    const inputLuminance = luminance(inputToRGB.r, inputToRGB.g, inputToRGB.b);

    const ratio = inputLuminance > WHITE_LUMINANCE
        ? ((WHITE_LUMINANCE + 0.05) / (inputLuminance + 0.05))
        : ((inputLuminance + 0.05) / (WHITE_LUMINANCE + 0.05));

    return ratio < (1 / WCAG_CONTRAST);
}
