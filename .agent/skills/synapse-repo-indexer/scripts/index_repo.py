#!/usr/bin/env python3

from __future__ import annotations

import argparse
import ast
import json
import fnmatch
import os
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Iterable

HIGH_PRIORITY_NAMES = {
    "README",
    "README.md",
    "main.py",
    "app.py",
    "index.js",
    "index.ts",
    "index.tsx",
    "server.js",
    "server.ts",
    "package.json",
    "pyproject.toml",
    "requirements.txt",
    "Cargo.toml",
    "go.mod",
    "tsconfig.json",
}

HIGH_PRIORITY_HINTS = {
    "route": "route",
    "routes": "route",
    "controller": "controller",
    "service": "service",
    "component": "component",
    "page": "page",
    "schema": "schema",
    "test": "test",
    "spec": "test",
    "config": "config",
}


@dataclass
class FileEntry:
    path: str
    size: int
    kind: str
    priority: int
    hints: list[str]
    exports: list[str]


@dataclass(frozen=True)
class IgnoreRule:
    source_dir: Path
    pattern: str
    negated: bool
    directory_only: bool


def load_gitignore_rules(directory: Path) -> list[IgnoreRule]:
    gitignore = directory / ".gitignore"
    if not gitignore.exists():
        return []
    rules: list[IgnoreRule] = []
    try:
        for raw_line in gitignore.read_text(encoding="utf-8", errors="ignore").splitlines():
            line = raw_line.strip()
            if not line or line.startswith("#"):
                continue
            negated = line.startswith("!")
            if negated:
                line = line[1:]
            directory_only = line.endswith("/")
            if directory_only:
                line = line.rstrip("/")
            if not line:
                continue
            rules.append(
                IgnoreRule(
                    source_dir=directory,
                    pattern=line,
                    negated=negated,
                    directory_only=directory_only,
                )
            )
    except OSError:
        return []
    return rules


def path_variants(rel_path: Path, is_dir: bool) -> list[str]:
    parts = rel_path.as_posix()
    variants = [parts, rel_path.name]
    if is_dir:
        variants.append(parts + "/")
        variants.append(rel_path.name + "/")
    return variants


def rule_matches(rule: IgnoreRule, target_path: Path, is_dir: bool) -> bool:
    try:
        rel_to_rule = target_path.relative_to(rule.source_dir)
    except ValueError:
        return False
    candidates = path_variants(rel_to_rule, is_dir)
    for candidate in candidates:
        if fnmatch.fnmatch(candidate, rule.pattern) or fnmatch.fnmatch(f"/{candidate}", rule.pattern):
            return True
    return False


def is_ignored(target_path: Path, rules: list[IgnoreRule], is_dir: bool) -> bool:
    ignored = False
    for rule in rules:
        if not rule_matches(rule, target_path, is_dir):
            continue
        if rule.directory_only and not is_dir:
            continue
        ignored = not rule.negated
    return ignored


def file_kind(path: Path) -> str:
    suffix = path.suffix.lower()
    if path.name in {"Dockerfile", "Makefile"}:
        return "config"
    if suffix in {".py"}:
        return "python"
    if suffix in {".js", ".mjs", ".cjs"}:
        return "javascript"
    if suffix in {".ts", ".tsx"}:
        return "typescript"
    if suffix in {".json"}:
        return "json"
    if suffix in {".md"}:
        return "markdown"
    if suffix in {".yml", ".yaml"}:
        return "yaml"
    if suffix in {".toml"}:
        return "toml"
    return suffix.lstrip(".") or "file"


def score_path(path: Path) -> int:
    score = 0
    name = path.name
    stem = path.stem.lower()
    if name in HIGH_PRIORITY_NAMES:
        score += 50
    if any(token in stem for token in HIGH_PRIORITY_HINTS):
        score += 20
    if "test" in stem or "spec" in stem:
        score += 15
    if path.parent == Path("."):
        score += 10
    return score


def extract_python_hints(text: str) -> tuple[list[str], list[str]]:
    hints: list[str] = []
    exports: list[str] = []
    try:
        tree = ast.parse(text)
    except SyntaxError:
        return hints, exports
    for node in tree.body:
        if isinstance(node, ast.ClassDef):
            hints.append("class")
        elif isinstance(node, ast.FunctionDef):
            hints.append("function")
            if node.name.startswith("test_"):
                hints.append("test")
        elif isinstance(node, ast.Import) or isinstance(node, ast.ImportFrom):
            continue
        elif isinstance(node, ast.Assign):
            continue
    for node in tree.body:
        if isinstance(node, ast.FunctionDef):
            exports.append(node.name)
        elif isinstance(node, ast.ClassDef):
            exports.append(node.name)
    return sorted(set(hints)), sorted(set(exports))


def extract_js_hints(text: str) -> tuple[list[str], list[str]]:
    hints: list[str] = []
    exports: list[str] = []
    lower = text.lower()
    if "export default" in lower:
        exports.append("default")
    if "export " in lower:
        hints.append("export")
    if "function " in lower:
        hints.append("function")
    if "class " in lower:
        hints.append("class")
    if "route" in lower:
        hints.append("route")
    if "test(" in lower or "describe(" in lower or "it(" in lower:
        hints.append("test")
    return sorted(set(hints)), sorted(set(exports))


def extract_shallow_hints(path: Path, max_bytes: int) -> tuple[list[str], list[str]]:
    try:
        text = path.read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return [], []
    if len(text) > max_bytes:
        text = text[:max_bytes]
    if path.suffix == ".py":
        return extract_python_hints(text)
    if path.suffix in {".js", ".mjs", ".cjs", ".ts", ".tsx"}:
        return extract_js_hints(text)
    if path.name == "package.json":
        return ["config"], []
    if path.suffix in {".json", ".toml", ".yaml", ".yml"}:
        return ["config"], []
    return [], []


def iter_files(root: Path, max_depth: int | None) -> Iterable[Path]:
    ignore_cache: dict[Path, list[IgnoreRule]] = {root: load_gitignore_rules(root)}

    def rules_for(directory: Path) -> list[IgnoreRule]:
        if directory in ignore_cache:
            return ignore_cache[directory]
        if directory == root:
            ignore_cache[directory] = load_gitignore_rules(directory)
            return ignore_cache[directory]
        parent_rules = rules_for(directory.parent)
        ignore_cache[directory] = [*parent_rules, *load_gitignore_rules(directory)]
        return ignore_cache[directory]

    for current_root, dirnames, filenames in os.walk(root):
        current_path = Path(current_root)
        rel_dir = current_path.relative_to(root)
        if max_depth is not None and len(rel_dir.parts) > max_depth:
            dirnames[:] = []
            continue

        current_rules = rules_for(current_path)

        kept_dirnames = []
        for dirname in dirnames:
            if dirname == ".git":
                continue
            dir_path = current_path / dirname
            rel_path = dir_path.relative_to(root)
            if max_depth is not None and len(rel_path.parts) > max_depth:
                continue
            if is_ignored(dir_path, current_rules, True):
                continue
            kept_dirnames.append(dirname)
        dirnames[:] = kept_dirnames

        for filename in filenames:
            file_path = current_path / filename
            if is_ignored(file_path, current_rules, False):
                continue
            yield file_path


def build_index(root: Path, max_files: int, max_bytes: int, max_depth: int | None) -> list[FileEntry]:
    entries: list[FileEntry] = []
    for path in iter_files(root, max_depth):
        if len(entries) >= max_files:
            break
        rel = path.relative_to(root)
        size = path.stat().st_size
        hints, exports = extract_shallow_hints(path, max_bytes)
        priority = score_path(rel)
        for hint in hints:
            priority += 5
            if hint in HIGH_PRIORITY_HINTS:
                priority += 5
        entries.append(
            FileEntry(
                path=str(rel),
                size=size,
                kind=file_kind(path),
                priority=priority,
                hints=hints,
                exports=exports,
            )
        )
    entries.sort(key=lambda item: (-item.priority, item.path))
    return entries


def render_markdown(root: Path, entries: list[FileEntry]) -> str:
    lines = []
    lines.append(f"# Repo Index: {root.name}")
    lines.append("")
    lines.append(f"- Root: `{root}`")
    lines.append(f"- Files indexed: `{len(entries)}`")
    lines.append("")
    lines.append("## Priority")
    for entry in entries:
        detail_bits = [entry.kind, f"{entry.size} bytes"]
        if entry.hints:
            detail_bits.append("hints=" + ",".join(entry.hints))
        if entry.exports:
            detail_bits.append("exports=" + ",".join(entry.exports[:5]))
        lines.append(f"- `{entry.path}` - {', '.join(detail_bits)}")
    return "\n".join(lines) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description="Build a lightweight repo index.")
    parser.add_argument("--format", choices={"md", "json"}, default="md")
    args = parser.parse_args()

    root = Path.cwd().resolve()
    entries = build_index(root, max_files=5000, max_bytes=4096, max_depth=None)

    if args.format == "json":
        payload = {
            "root": str(root),
            "files_indexed": len(entries),
            "entries": [asdict(entry) for entry in entries],
        }
        output = json.dumps(payload, indent=2, ensure_ascii=False) + "\n"
    else:
        output = render_markdown(root, entries)

    output_path = root / ".agent" / "repo-index.md"
    output_path.write_text(output, encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
