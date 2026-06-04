TRUNCATE TABLE
    notifications,
    session_feature_contributions,
    session_llm_summaries,
    session_request_logs,
    session_features,
    sessions
RESTART IDENTITY CASCADE;