-- dbt model: daily_user_summary
-- Aggregates raw events into daily summary per user

{{
    config(
        materialized='table',
        partition_by={
            "field": "date",
            "data_type": "date",
        },
        cluster_by=["user_id"],
    )
}}

WITH event_stats AS (
    SELECT
        user_id,
        DATE(event_timestamp) AS date,
        COUNT(*) AS total_events,
        COUNT(DISTINCT domain) AS domains_active,
        COUNTIF(event_type = 'decision') AS decisions_made,
        COUNTIF(event_type = 'pattern_triggered') AS patterns_triggered,
        COUNTIF(event_type = 'brief_viewed') AS briefs_viewed,
    FROM {{ source('lifeops', 'raw_events') }}
    GROUP BY user_id, DATE(event_timestamp)
),

pattern_summary AS (
    SELECT
        user_id,
        signal_date AS date,
        COUNT(*) AS active_patterns,
        AVG(confidence) AS avg_pattern_confidence,
        COUNTIF(severity = 'high') AS high_severity_patterns,
    FROM {{ source('lifeops', 'pattern_signals') }}
    GROUP BY user_id, signal_date
)

SELECT
    COALESCE(e.user_id, p.user_id) AS user_id,
    COALESCE(e.date, p.date) AS date,
    COALESCE(e.total_events, 0) AS total_events,
    COALESCE(e.domains_active, 0) AS domains_active,
    COALESCE(e.decisions_made, 0) AS decisions_made,
    COALESCE(e.patterns_triggered, 0) AS patterns_triggered,
    COALESCE(e.briefs_viewed, 0) AS briefs_viewed,
    COALESCE(p.active_patterns, 0) AS active_patterns,
    COALESCE(p.avg_pattern_confidence, 0) AS avg_pattern_confidence,
    COALESCE(p.high_severity_patterns, 0) AS high_severity_patterns,
    CURRENT_TIMESTAMP() AS updated_at,
FROM event_stats e
FULL OUTER JOIN pattern_summary p ON e.user_id = p.user_id AND e.date = p.date
