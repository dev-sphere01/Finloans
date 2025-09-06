// src/utils/DateTimeFormat.js

/**
 * Format a date/time string or object into a custom format.
 *
 * Supported Format Tokens:
 * ------------------------------------------
 * yyyy   - 4-digit year       → 2025
 * yy     - 2-digit year       → 25
 * MMMM   - Full month name    → July
 * MMM    - Short month name   → Jul
 * MM     - 2-digit month      → 07
 * M      - Month (1–12)       → 7
 * dd     - 2-digit day        → 25
 * d      - Day (1–31)         → 5
 * dddd   - Full day name      → Friday
 * ddd    - Short day name     → Fri
 * HH     - 2-digit hour (0–23)→ 08
 * H      - Hour (0–23)        → 8
 * hh     - 2-digit hour (1–12)→ 08
 * h      - Hour (1–12)        → 8
 * mm     - 2-digit minutes    → 04
 * ss     - 2-digit seconds    → 09
 * tt     - AM/PM              → AM
 *
 * Example Usages:
 * ------------------------------------------
 * "dd-MM-yyyy"            → 25-07-2025
 * "yyyy/MM/dd HH:mm:ss"   → 2025/07/25 08:04:09
 * "MMM d, yyyy"           → Jul 25, 2025
 * "dddd, dd MMMM yyyy"    → Friday, 25 July 2025
 * "h:mm tt"               → 8:04 AM
 */

export default function formatDateTime(date, format) {
    if (!date) return "";

    const d = new Date(date);
    if (isNaN(d)) return "";

    const pad = (n) => (n < 10 ? "0" + n : n);

    const map = {
        yyyy: d.getFullYear(),
        yy: String(d.getFullYear()).slice(-2),
        MMMM: d.toLocaleString("en-US", { month: "long" }),
        MMM: d.toLocaleString("en-US", { month: "short" }),
        MM: pad(d.getMonth() + 1),
        M: d.getMonth() + 1,
        dd: pad(d.getDate()),
        d: d.getDate(),
        dddd: d.toLocaleString("en-US", { weekday: "long" }),
        ddd: d.toLocaleString("en-US", { weekday: "short" }),
        HH: pad(d.getHours()),
        H: d.getHours(),
        hh: pad(d.getHours() % 12 || 12),
        h: d.getHours() % 12 || 12,
        mm: pad(d.getMinutes()),
        ss: pad(d.getSeconds()),
        tt: d.getHours() < 12 ? "AM" : "PM"
    };

    return format.replace(/yyyy|yy|MMMM|MMM|MM|M|dddd|ddd|dd|d|HH|H|hh|h|mm|ss|tt/g, (match) => map[match] ?? match);
}
