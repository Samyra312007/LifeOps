from datetime import datetime, timedelta, timezone
from typing import Optional
from app.services.pattern_service import PatternService
from app.services.alert_service import AlertEngine
from app.models.alert import AlertLogCreate, AlertAction


class PatternDetector:
    def __init__(self):
        self.pattern_service = PatternService()
        self.alert_engine = AlertEngine()

    async def detect_sleep_debt(self, user_id: str, sleep_data: list[dict]) -> Optional[dict]:
        if not sleep_data or len(sleep_data) < 3:
            return None
        recent = sorted(sleep_data, key=lambda x: x.get("date", ""), reverse=True)[:5]
        short_nights = [d for d in recent if (d.get("duration_minutes", 999) or 999) < 360]
        if len(short_nights) >= 3:
            avg_duration = sum(d.get("duration_minutes", 0) for d in short_nights) / len(short_nights)
            pattern_id = await self.pattern_service.upsert_pattern(
                user_id, "health", "sleep_debt",
                {"confidence": min(len(short_nights) / 5, 1.0), "active": True},
            )
            await self.pattern_service.record_occurrence(pattern_id, {
                "start_date": short_nights[0].get("date"),
                "severity": "high" if avg_duration < 300 else "medium",
                "outcome": f"Average sleep: {avg_duration:.0f} min over {len(short_nights)} nights",
            })
            return {"pattern_id": pattern_id, "type": "sleep_debt", "severity": "high" if avg_duration < 300 else "medium"}
        return None

    async def detect_budget_bleed(self, user_id: str, transactions: list[dict]) -> Optional[dict]:
        if not transactions or len(transactions) < 7:
            return None
        recent = sorted(transactions, key=lambda x: x.get("date", ""), reverse=True)[:14]
        weekly_totals = {}
        for t in recent:
            week = t.get("date", "")[:10]
            if week not in weekly_totals:
                weekly_totals[week] = 0
            weekly_totals[week] += abs(t.get("amount", 0))
        weeks = sorted(weekly_totals.keys())
        if len(weeks) >= 2:
            latest = weekly_totals[weeks[-1]]
            prev = weekly_totals[weeks[-2]]
            if prev > 0 and latest > prev * 1.2:
                dining = [t for t in recent if "dining" in (
                    [c.lower() for c in (t.get("category") if isinstance(t.get("category"), list) else [t.get("category", "")])]
                )]
                dining_total = sum(abs(t.get("amount", 0)) for t in dining)
                pattern_id = await self.pattern_service.upsert_pattern(
                    user_id, "finance", "budget_bleed",
                    {"confidence": 0.6, "active": True},
                )
                await self.pattern_service.record_occurrence(pattern_id, {
                    "start_date": weeks[-1],
                    "severity": "medium",
                    "outcome": f"Weekly spend: ${latest:.0f} (${dining_total:.0f} dining)",
                })
                return {"pattern_id": pattern_id, "type": "budget_bleed", "severity": "medium"}
        return None

    async def detect_exercise_gap(self, user_id: str, activities: list[dict]) -> Optional[dict]:
        if not activities:
            return None
        sorted_acts = sorted(activities, key=lambda x: x.get("date", ""), reverse=True)
        if sorted_acts:
            last_activity = sorted_acts[0]
            last_date = last_activity.get("date")
            if isinstance(last_date, str):
                from datetime import date as date_type
                try:
                    last_date = datetime.strptime(last_date, "%Y-%m-%d").date()
                except ValueError:
                    last_date = datetime.now(timezone.utc).date()
            elif isinstance(last_date, datetime):
                last_date = last_date.date()
            days_since = (datetime.now(timezone.utc).date() - last_date).days
            if days_since >= 5:
                pattern_id = await self.pattern_service.upsert_pattern(
                    user_id, "health", "exercise_gap",
                    {"confidence": min(days_since / 14, 1.0), "active": True},
                )
                await self.pattern_service.record_occurrence(pattern_id, {
                    "start_date": (datetime.now(timezone.utc) - timedelta(days=days_since)).isoformat(),
                    "severity": "high" if days_since > 10 else "medium",
                    "outcome": f"No workout in {days_since} days",
                })
                return {"pattern_id": pattern_id, "type": "exercise_gap", "severity": "high" if days_since > 10 else "medium"}
        return None

    async def detect_meeting_overload(self, user_id: str, events: list[dict]) -> Optional[dict]:
        if not events or len(events) < 3:
            return None
        recent = sorted(events, key=lambda x: x.get("start_time", ""), reverse=True)[:20]
        meeting_hours = 0
        for e in recent:
            start = e.get("start_time")
            end = e.get("end_time")
            if start and end:
                if isinstance(start, str):
                    try:
                        start = datetime.fromisoformat(start.replace("Z", "+00:00"))
                        end = datetime.fromisoformat(end.replace("Z", "+00:00"))
                    except ValueError:
                        continue
                duration_h = (end - start).total_seconds() / 3600
                if 0 < duration_h < 8:
                    meeting_hours += duration_h
        if meeting_hours > 20:
            pattern_id = await self.pattern_service.upsert_pattern(
                user_id, "work", "meeting_overload",
                {"confidence": min(meeting_hours / 40, 1.0), "active": True},
            )
            await self.pattern_service.record_occurrence(pattern_id, {
                "start_date": (datetime.now(timezone.utc) - timedelta(days=7)).isoformat(),
                "severity": "high" if meeting_hours > 30 else "medium",
                "outcome": f"{meeting_hours:.1f} meeting hours in recent days",
            })
            return {"pattern_id": pattern_id, "type": "meeting_overload", "severity": "high" if meeting_hours > 30 else "medium"}
        return None

    async def detect_social_isolation(self, user_id: str, social_events: list[dict], emails: list[dict]) -> Optional[dict]:
        recent_social = [e for e in social_events if e.get("type") in ("social", "meeting")]
        recent_emails = [e for e in emails if len(e.get("to_addresses", [])) > 0] if emails else []
        if len(recent_social) < 2 and len(recent_emails) < 5:
            last_social = max([e.get("date") for e in social_events], default=None) if social_events else None
            if last_social:
                if isinstance(last_social, str):
                    try:
                        last_social = datetime.fromisoformat(last_social.replace("Z", "+00:00"))
                    except ValueError:
                        last_social = None
                if last_social and (datetime.now(timezone.utc) - last_social).days > 7:
                    pattern_id = await self.pattern_service.upsert_pattern(
                        user_id, "social", "social_isolation",
                        {"confidence": 0.5, "active": True},
                    )
                    return {"pattern_id": pattern_id, "type": "social_isolation", "severity": "medium"}
        return None

    async def detect_stress_spiral(self, user_id: str, sleep_result: dict, budget_result: dict, exercise_result: dict, meeting_result: dict) -> Optional[dict]:
        active_patterns = [p for p in [sleep_result, budget_result, exercise_result, meeting_result] if p is not None]
        if len(active_patterns) >= 2:
            severity_scores = {"low": 1, "medium": 2, "high": 3}
            total_severity = sum(severity_scores.get(p.get("severity", "low"), 1) for p in active_patterns)
            if total_severity >= 5:
                pattern_id = await self.pattern_service.upsert_pattern(
                    user_id, "health", "stress_spiral",
                    {"confidence": min(total_severity / 8, 1.0), "active": True},
                )
                types = [p["type"] for p in active_patterns]
                await self.pattern_service.record_occurrence(pattern_id, {
                    "start_date": datetime.now(timezone.utc).isoformat(),
                    "severity": "high" if total_severity >= 7 else "medium",
                    "outcome": f"Multi-domain stress: {', '.join(types)}",
                })
                return {"pattern_id": pattern_id, "type": "stress_spiral", "severity": "high" if total_severity >= 7 else "medium"}
        return None

    async def run_all_detections(self, user_id: str, data: dict) -> list[dict]:
        results = []
        sleep_result = await self.detect_sleep_debt(user_id, data.get("sleep_data", []))
        if sleep_result:
            results.append(sleep_result)

        budget_result = await self.detect_budget_bleed(user_id, data.get("transactions", []))
        if budget_result:
            results.append(budget_result)

        exercise_result = await self.detect_exercise_gap(user_id, data.get("activities", []))
        if exercise_result:
            results.append(exercise_result)

        meeting_result = await self.detect_meeting_overload(user_id, data.get("events", []))
        if meeting_result:
            results.append(meeting_result)

        social_result = await self.detect_social_isolation(user_id, data.get("social_events", []), data.get("emails", []))
        if social_result:
            results.append(social_result)

        stress_result = await self.detect_stress_spiral(user_id, sleep_result, budget_result, exercise_result, meeting_result)
        if stress_result:
            results.append(stress_result)

        return results

    async def alert_for_patterns(self, user_id: str, detections: list[dict]):
        for detection in detections:
            has_recent = await self.alert_engine.has_recent_alert(
                user_id, "pattern_alert", detection["type"], cooldown_hours=48
            )
            if has_recent:
                continue

            severity_labels = {"low": "Minor", "medium": "Moderate", "high": "Critical"}
            label = severity_labels.get(detection.get("severity", "medium"), "Moderate")
            type_labels = {
                "sleep_debt": "Sleep Debt",
                "budget_bleed": "Budget Bleed",
                "exercise_gap": "Exercise Gap",
                "meeting_overload": "Meeting Overload",
                "social_isolation": "Social Isolation",
                "stress_spiral": "Stress Spiral",
            }
            type_label = type_labels.get(detection["type"], detection["type"].replace("_", " ").title())

            await self.alert_engine.send_alert(user_id, AlertLogCreate(
                alert_type="pattern_alert",
                domain=detection.get("domain", "general"),
                title=f"{label} Pattern: {type_label}",
                body=f"A {detection['severity']} severity {type_label} pattern has been detected.",
                actions=[
                    AlertAction(label="View Details", action_type="navigate", parameters={"route": f"/insights/patterns/{detection.get('pattern_id', '')}"}),
                    AlertAction(label="Dismiss", action_type="dismiss", parameters={}),
                ],
                delivery_channel="in_app",
                is_critical=detection["severity"] == "high",
            ))
