{{
    config(
        materialized='table',
        partition_by={
            "field": "subscription_date",
            "data_type": "date",
        },
        cluster_by=["user_id"],
    )
}}

SELECT
    user_id,
    subscription_tier,
    subscription_date,
    subscription_status,
    mrr,
    COUNT(DISTINCT DATE(event_timestamp)) AS active_days,
FROM {{ source('lifeops', 'subscriptions') }}
LEFT JOIN {{ source('lifeops', 'raw_events') }} USING (user_id)
WHERE subscription_status = 'active'
GROUP BY 1, 2, 3, 4, 5
