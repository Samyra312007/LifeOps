{{
    config(
        materialized='table',
        partition_by={
            "field": "signal_date",
            "data_type": "date",
        },
        cluster_by=["user_id", "pattern_type"],
    )
}}

SELECT
    user_id,
    pattern_type,
    confidence,
    signal_date,
    severity,
    contributing_factors,
    recommended_interventions,
    CURRENT_TIMESTAMP() AS processed_at,
FROM {{ source('lifeops', 'pattern_signals') }}
WHERE confidence >= 0.3
