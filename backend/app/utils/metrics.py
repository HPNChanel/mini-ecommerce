"""Simple in-memory metrics collector."""
from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass, field
from typing import DefaultDict, Dict


@dataclass
class MetricsRegistry:
    counts: DefaultDict[str, int] = field(default_factory=lambda: defaultdict(int))
    durations: DefaultDict[str, float] = field(default_factory=lambda: defaultdict(float))

    def observe_request(self, *, route: str, status: int, elapsed: float) -> None:
        key = f"{route}|{status}"
        self.counts[key] += 1
        self.durations[key] += elapsed

    def render_prometheus(self) -> str:
        lines = ["# HELP http_requests_total Total HTTP requests.", "# TYPE http_requests_total counter"]
        for key, count in self.counts.items():
            route, status = key.split("|")
            lines.append(f'http_requests_total{{route="{route}",status="{status}"}} {count}')
        lines.append("# HELP http_request_duration_seconds_total Total duration of HTTP requests in seconds.")
        lines.append("# TYPE http_request_duration_seconds_total counter")
        for key, duration in self.durations.items():
            route, status = key.split("|")
            lines.append(
                f'http_request_duration_seconds_total{{route="{route}",status="{status}"}} {duration}'
            )
        return "\n".join(lines) + "\n"


metrics_registry = MetricsRegistry()
