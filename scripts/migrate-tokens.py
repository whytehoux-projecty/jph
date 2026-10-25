"""
Legacy-class → design-token migration for portal screens.

  python scripts/migrate-tokens.py <file-or-dir> [...]      # rewrite in place
  python scripts/migrate-tokens.py --check <file-or-dir>    # list leftovers only

Rewrites class names only (with any variant prefix such as hover:, md:,
group-hover:, and any /opacity suffix kept), following the "Deprecated"
table in docs/DESIGN_SYSTEM.md. Anything it can't map safely — gradients,
arbitrary hex values, inline styles — is reported for a manual pass.
"""
import re
import sys
from pathlib import Path

# Utility prefixes that take a colour.
C = r"(?:bg|text|border|border-[trblxy]|ring|ring-offset|outline|divide|fill|stroke|from|via|to|decoration|accent|caret|placeholder|shadow)"

COLOUR = {
    # legacy paper / ink / brand
    "paper-50": "surface", "paper": "surface-muted", "paper-100": "surface-muted",
    "paper-200": "line", "paper-300": "line-strong",
    "ink-900": "fg", "ink-800": "fg", "ink-700": "fg", "ink": "fg",
    "ink-600": "fg-muted", "ink-500": "fg-muted", "ink-400": "fg-muted",
    "vermilion-600": "action", "vermilion-500": "action", "vermilion": "action",
    "vermilion-700": "action-hover", "vermilion-800": "action-hover",
    "vermilion-100": "action-subtle", "vermilion-50": "action-subtle", "vermilion-400": "action-on-inverse",
    "pine-700": "action", "pine-800": "action-hover", "pine": "action",
    "stone-400": "fg-muted", "stone-500": "fg-muted", "stone-600": "fg-muted", "stone": "fg-muted",
    "petrol": "action", "petrol-700": "action-hover", "chalk": "surface-muted", "shoal": "line", "fog": "fg-muted",
    "heritage-ink": "fg", "shallows": "action-subtle", "alert": "danger",
    # never defined (rendered as nothing before)
    "vintage-gold": "action", "vintage-green": "success", "vintage-navy": "fg",
    "charcoal": "fg", "soft-gold": "warning", "heritage-gold": "action",
    # status aliases
    "error": "danger", "error-bg": "danger-subtle", "success-bg": "success-subtle",
    "warning-bg": "warning-subtle", "info-bg": "info-subtle",
    "white": "surface", "black": "fg",
}
# raw Tailwind palette
for hue, role in {"red": "danger", "rose": "danger", "emerald": "success", "green": "success",
                  "teal": "success", "amber": "warning", "yellow": "warning", "orange": "warning",
                  "blue": "info", "sky": "info", "indigo": "info", "purple": "info", "violet": "info"}.items():
    for shade in ("50", "100"):
        COLOUR[f"{hue}-{shade}"] = f"{role}-subtle"
    for shade in ("200", "300"):
        COLOUR[f"{hue}-{shade}"] = role  # used for borders → strong colour at reduced presence
    for shade in ("400", "500", "600", "700", "800", "900"):
        COLOUR[f"{hue}-{shade}"] = role
for grey in ("slate", "gray", "neutral", "zinc", "stone"):
    COLOUR[f"{grey}-50"] = "surface-muted"
    COLOUR[f"{grey}-100"] = "surface-muted"
    COLOUR[f"{grey}-200"] = "line"
    COLOUR[f"{grey}-300"] = "line-strong"
    COLOUR[f"{grey}-400"] = "fg-muted"
    COLOUR[f"{grey}-500"] = "fg-muted"
    COLOUR[f"{grey}-600"] = "fg-muted"
    for s in ("700", "800", "900", "950"):
        COLOUR[f"{grey}-{s}"] = "fg"

# Border colours from the *-200/300 status shades read better as subtle lines.
BORDER_SOFT = {f"{h}-{s}" for h in ("red", "rose", "emerald", "green", "teal", "amber", "yellow", "orange", "blue", "sky", "indigo", "purple", "violet") for s in ("200", "300")}

# Text-on-ground fixes after mapping (white text means "on a dark/action ground").
TEXT_SPECIAL = {"text-surface": "text-fg-on-action", "text-paper-50": "text-fg-on-action"}

SIZE = {
    "text-xs": "text-caption", "text-sm": "text-small", "text-base": "text-body",
    "text-[9px]": "text-caption", "text-[10px]": "text-caption", "text-[11px]": "text-caption",
    "text-[12px]": "text-caption", "text-[13px]": "text-caption", "text-[14px]": "text-small",
    "text-[15px]": "text-body", "text-[16px]": "text-body",
}

RADIUS = {
    "rounded": "rounded-control", "rounded-sm": "rounded-control", "rounded-md": "rounded-control",
    "rounded-lg": "rounded-surface", "rounded-xl": "rounded-surface", "rounded-2xl": "rounded-surface",
    "rounded-3xl": "rounded-surface", "rounded-none": "rounded-none", "rounded-full": "rounded-round",
}

DROP = re.compile(
    r"^(?:shadow(?:-(?:xs|sm|md|lg|xl|2xl|inner|none|vintage-[a-z]+|navy-glow|gold-glow))?"
    r"|backdrop-blur(?:-[a-z0-9]+)?|hover:shadow(?:-[a-z0-9]+)?|hover:-?translate-y-[\d.]+"
    r"|hover:scale-[\d.]+|group-hover:scale-[\d.]+|active:scale-[\d.]+|drop-shadow(?:-[a-z]+)?"
    r"|animate-in|animate-out|fade-in(?:-\d+)?|fade-out(?:-\d+)?|zoom-in(?:-\d+)?|zoom-out(?:-\d+)?"
    r"|slide-in-from-[a-z0-9\-\[\]%]+|slide-out-to-[a-z0-9\-\[\]%]+)$"
)

CLASS_ATTR = re.compile(r"""(className=|cn\(|cva\(|clsx\()""")
TOKEN = re.compile(r"""(?<![\w\-\[/])((?:[a-z0-9\-\[\]&:_]+:)*)(!?)([a-z][a-z0-9\-]*(?:-\[[^\]\s]+\])?|text-\[\d+px\])(/\d+)?(?![\w\-\[])""")


def map_class(variants: str, bang: str, base: str, alpha: str | None) -> str | None:
    full = variants + bang + base + (alpha or "")
    if DROP.match(base) and not variants.startswith("data-"):
        return ""
    if base in SIZE:
        return variants + bang + SIZE[base]
    if base in RADIUS:
        return variants + bang + RADIUS[base] + (alpha or "")
    m = re.match(rf"^({C})-(.+)$", base)
    if m:
        util, colour = m.groups()
        if util == "shadow":
            return full
        if colour in COLOUR:
            new = COLOUR[colour]
            if util.startswith("border") and colour in BORDER_SOFT:
                new = "line"
            # paper-200 / grey-200 as a ground is a sunken well, not a rule colour.
            if util == "bg" and new == "line":
                new = "surface-sunken"
            if util == "bg" and new == "line-strong":
                new = "surface-sunken"
            # Heavy legacy borders (paper-300) become the standard rule.
            if (util.startswith("border") or util == "divide") and colour in ("paper-300",):
                new = "line"
            out = f"{util}-{new}"
            if util == "text" and colour in ("paper-50", "white"):
                out = "text-fg-on-action"
            return variants + bang + out + (alpha or "")
    return full


def migrate_text(src: str) -> str:
    def fix_string(s: str) -> str:
        def repl(m: re.Match) -> str:
            variants, bang, base, alpha = m.group(1), m.group(2), m.group(3), m.group(4)
            r = map_class(variants, bang, base, alpha)
            return m.group(0) if r is None else r
        out = TOKEN.sub(repl, s)
        return re.sub(r"[ ]{2,}", " ", out)

    # Only touch string literals and template literals (class lists live there).
    pattern = re.compile(r'"(?:[^"\\\n]|\\.)*"|\'(?:[^\'\\\n]|\\.)*\'|`(?:[^`\\]|\\.)*`')

    def lit(m: re.Match) -> str:
        s = m.group(0)
        body = s[1:-1]
        # Heuristic: class lists are lowercase utility words; skip prose and paths.
        if not re.search(r"(?:^|\s)(?:[a-z0-9\-:]+:)?(?:bg|text|border|rounded|shadow|ring|from|to|via|divide|fill|stroke|backdrop|hover|font|p[xytrbl]?|m[xytrbl]?|w|h|gap|flex|grid)-", body):
            return s
        if re.search(r"[A-Z]{2,}|\.\s|/api/|https?:", body) and "className" not in body:
            # Prose or URLs: leave alone unless clearly a class list.
            if not re.fullmatch(r"[\sa-z0-9\-:/\[\]&_!.%()#,${}?=+*'\"<>]+", body):
                return s
        return s[0] + fix_string(body) + s[-1]

    return pattern.sub(lit, src)


LEFTOVER = re.compile(
    r"(#[0-9A-Fa-f]{3,8}\b|bg-linear-to-|bg-gradient-|style=\{\{|\b(?:paper|ink|vermilion|pine|stone|vintage|slate|gray|neutral|zinc|emerald|amber|rose|red|green|blue|yellow|purple|indigo|violet|orange|sky|teal)-\d{2,3}\b|text-\[\d+px\]|\bshadow-(?:sm|md|lg|xl|2xl)\b)"
)


def files(args):
    for a in args:
        p = Path(a)
        if p.is_dir():
            yield from (f for f in p.rglob("*.tsx"))
        elif p.suffix in (".tsx", ".ts"):
            yield p


def main():
    check = "--check" in sys.argv
    targets = [a for a in sys.argv[1:] if a != "--check"]
    total = 0
    for f in files(targets):
        text = f.read_text(encoding="utf8")
        if not check:
            new = migrate_text(text)
            if new != text:
                f.write_text(new, encoding="utf8", newline="\n")
                text = new
        hits = [(i + 1, m.group(0)) for i, line in enumerate(text.splitlines()) for m in LEFTOVER.finditer(line)]
        if hits:
            total += len(hits)
            print(f"{f}: {len(hits)} leftover")
            for ln, h in hits[:12]:
                print(f"   {ln}: {h}")
    print(f"leftovers: {total}")


if __name__ == "__main__":
    main()
