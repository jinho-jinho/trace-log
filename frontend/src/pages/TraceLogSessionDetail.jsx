import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  analyzeTraceLogSessionWithLlm,
  formatAiAnalysis,
  formatDateTime,
  formatScore,
  formatSummaryCards,
  formatTimeOnly,
  getTraceLogDashboard,
  getTraceLogSessionDetail,
  verifyAdminSession,
} from "./traceLogApi.js";
import {
  BackLink,
  DashboardPage,
  DataTable,
  EmptyState,
  MainContent,
  Panel,
  PanelHead,
  PanelTitle,
  TableWrap,
  TraceLogHeader,
} from "./TraceLogLayout.jsx";

const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(280px, 0.9fr) minmax(0, 1.3fr) minmax(320px, 1fr);
  gap: 22px;
  align-items: start;

  @media (max-width: 1280px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const Column = styled.div`
  min-width: 0;
  display: grid;
  align-content: start;
  gap: 22px;
`;

const LogPanel = styled(Panel)`
  min-width: 0;
  overflow: hidden;
`;

const InfoBlock = styled.div`
  padding: 14px 0;
  border-bottom: 1px solid #e5eaee;

  &:last-child {
    border-bottom: 0;
    padding-bottom: 0;
  }
`;

const Label = styled.div`
  margin-bottom: 6px;
  color: #66737d;
  font-size: 12px;
  font-weight: 850;
`;

const Value = styled.div`
  color: #172026;
  font-size: 13px;
  line-height: 1.6;
  word-break: break-word;
  white-space: pre-line;
`;

const DetailLink = styled(Link)`
  color: #3b6875;
  font-size: 13px;
  font-weight: 850;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
`;

const RawLogBox = styled.pre`
  margin: 0;
  min-height: 280px;
  max-height: 360px;
  overflow: auto;
  border: 1px solid #e1e7ec;
  background: #fbfcfd;
  padding: 14px 16px;
  color: #27323a;
  font-size: 12px;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
`;

const MetricList = styled.div`
  display: grid;
`;

const MetricRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  padding: 11px 0;
  border-bottom: 1px solid #e5eaee;
  font-size: 13px;

  &:last-child {
    border-bottom: 0;
  }
`;

const MetricName = styled.span`
  color: #5a6872;
  font-weight: 750;
`;

const MetricValue = styled.span`
  color: #172026;
  font-weight: 850;
`;

const ScoreCard = styled(Panel)`
  display: grid;
  gap: 14px;
`;

const ScoreValue = styled.div`
  font-size: clamp(42px, 5vw, 64px);
  line-height: 1;
  font-weight: 900;
`;

const ScoreBar = styled.div`
  height: 12px;
  background: #e8edf1;
  overflow: hidden;
`;

const ScoreFill = styled.div`
  width: ${(props) => `${Math.min(Number(props.$score || 0) * 100, 100)}%`};
  height: 100%;
  background: linear-gradient(90deg, #2477a8 0%, #d64c4c 100%);
`;

const ScoreMeta = styled.div`
  display: grid;
  gap: 6px;
  color: #5a6872;
  font-size: 13px;
  font-weight: 750;
`;

const ActionButton = styled.button`
  width: 100%;
  height: 42px;
  border: 1px solid #d6dee4;
  background: ${(props) => (props.disabled ? "#f7f9fa" : "#172026")};
  color: ${(props) => (props.disabled ? "#66737d" : "#fff")};
  font-size: 13px;
  font-weight: 850;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
`;

const LlmResult = styled.div`
  margin: 10px 0 0;
  display: grid;
  gap: 12px;
`;

const LlmSummary = styled.div`
  border: 1px solid #dfe5ea;
  background: #fbfcfd;
  padding: 12px;
`;

const LlmMetaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
`;

const LlmMetaCard = styled.div`
  border: 1px solid #e5eaee;
  background: #fff;
  padding: 10px;
`;

const LlmMetaLabel = styled.div`
  margin-bottom: 5px;
  color: #66737d;
  font-size: 11px;
  font-weight: 850;
`;

const LlmMetaValue = styled.div`
  color: #172026;
  font-size: 14px;
  font-weight: 850;
`;

const LlmSection = styled.div`
  display: grid;
  gap: 7px;
`;

const LlmList = styled.ul`
  margin: 0;
  padding-left: 18px;
  color: #27323a;
  font-size: 12px;
  line-height: 1.55;
`;

const LlmParagraph = styled.p`
  margin: 0;
  color: #27323a;
  font-size: 12px;
  line-height: 1.6;
`;

const LlmRawBox = styled.pre`
  margin: 0;
  max-height: 220px;
  overflow: auto;
  border: 1px solid #e1e7ec;
  background: #fbfcfd;
  padding: 12px;
  color: #27323a;
  font-size: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
`;

const SESSION_LOG_PREVIEW_LIMIT = 15;

const METRIC_LABELS = {
  uniqueUrlCount: "고유 URL 수",
  uniqueMethodCount: "고유 Method 수",
  avgRequestIntervalSec: "평균 요청 간격",
  maxRequestIntervalSec: "최대 요청 간격",
  minRequestIntervalSec: "최소 요청 간격",
  error4xxRatio: "4xx 비율",
  error5xxRatio: "5xx 비율",
  status200Count: "200 응답 수",
  avgBytes: "평균 응답 바이트",
  maxBytes: "최대 응답 바이트",
  stdBytes: "응답 바이트 표준편차",
  loginCount: "로그인 요청 수",
  adminCount: "관리자 요청 수",
  avgUriLength: "평균 URI 길이",
  maxUriLength: "최대 URI 길이",
  avgQueryLength: "평균 Query 길이",
  maxQueryLength: "최대 Query 길이",
  specialCharCountSum: "특수문자 총합",
  specialCharRatioAvg: "특수문자 비율 평균",
  suspiciousKeywordCountSum: "의심 키워드 총합",
  loginAttemptCount: "로그인 시도 수",
};

function getSeverity(score, threshold) {
  if (score == null || threshold == null) return "기준 미설정";
  const gap = Number(score) - Number(threshold);
  if (gap >= 0.3) return "심각";
  if (gap >= 0.15) return "주의";
  if (gap >= 0) return "관찰";
  return "정상 범위";
}

function parseLlmAnalysis(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function asList(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function LlmAnalysisView({ value }) {
  const parsed = parseLlmAnalysis(value);
  if (!parsed) {
    return <LlmRawBox>{value}</LlmRawBox>;
  }

  const secondaryAttackTypes = asList(parsed.secondary_attack_types);
  const evidence = asList(parsed.evidence);
  const uncertainties = asList(parsed.uncertainties);
  const recommendedActions = asList(parsed.recommended_actions);

  return (
    <LlmResult>
      <LlmMetaGrid>
        <LlmMetaCard>
          <LlmMetaLabel>유형</LlmMetaLabel>
          <LlmMetaValue>{parsed.attack_type || "Unknown"}</LlmMetaValue>
        </LlmMetaCard>
        <LlmMetaCard>
          <LlmMetaLabel>신뢰도</LlmMetaLabel>
          <LlmMetaValue>{parsed.confidence || "uncertain"}</LlmMetaValue>
        </LlmMetaCard>
      </LlmMetaGrid>

      {secondaryAttackTypes.length ? (
        <LlmSection>
          <Label>추가 유형</Label>
          <LlmList>
            {secondaryAttackTypes.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </LlmList>
        </LlmSection>
      ) : null}

      {parsed.summary ? (
        <LlmSummary>
          <LlmMetaLabel>요약</LlmMetaLabel>
          <LlmParagraph>{parsed.summary}</LlmParagraph>
        </LlmSummary>
      ) : null}

      {evidence.length ? (
        <LlmSection>
          <Label>근거</Label>
          <LlmList>
            {evidence.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </LlmList>
        </LlmSection>
      ) : null}

      {recommendedActions.length ? (
        <LlmSection>
          <Label>권장 조치</Label>
          <LlmList>
            {recommendedActions.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </LlmList>
        </LlmSection>
      ) : null}

      {uncertainties.length ? (
        <LlmSection>
          <Label>불확실성</Label>
          <LlmList>
            {uncertainties.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </LlmList>
        </LlmSection>
      ) : null}

      {!recommendedActions.length && parsed.recommended_action ? (
        <LlmSummary>
          <LlmMetaLabel>권장 조치</LlmMetaLabel>
          <LlmParagraph>{parsed.recommended_action}</LlmParagraph>
        </LlmSummary>
      ) : null}
    </LlmResult>
  );
}

export default function TraceLogSessionDetail() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const [checking, setChecking] = useState(true);
  const [detail, setDetail] = useState(null);
  const [header, setHeader] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [llmLoading, setLlmLoading] = useState(false);
  const [llmError, setLlmError] = useState("");

  useEffect(() => {
    let active = true;
    verifyAdminSession(navigate)().then(() => {
      if (active) setChecking(false);
    });
    return () => {
      active = false;
    };
  }, [navigate]);

  useEffect(() => {
    if (checking) return undefined;
    let active = true;
    setLoading(true);
    setError("");

    Promise.all([getTraceLogSessionDetail(sessionId), getTraceLogDashboard("24h")])
      .then(([detailData, dashboardData]) => {
        if (active) {
          setDetail(detailData);
          setHeader(dashboardData.header);
        }
      })
      .catch((err) => {
        if (active) setError(err.message || "세션 상세를 불러오지 못했습니다.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [checking, sessionId]);

  const summaryCards = useMemo(() => formatSummaryCards(header), [header]);
  const metrics = useMemo(() => {
    if (!detail?.metrics) return [];
    return Object.entries(detail.metrics).map(([key, value]) => ({
      key,
      label: METRIC_LABELS[key] || key,
      value: value == null ? "-" : String(value),
    }));
  }, [detail?.metrics]);

  if (checking || loading) return <EmptyState $height="100vh">세션 상세를 불러오는 중입니다.</EmptyState>;
  if (error || !detail) return <EmptyState $height="100vh">{error || "세션 정보를 찾을 수 없습니다."}</EmptyState>;

  const score = detail.anomalyScore?.anomalyScore;
  const threshold = detail.anomalyScore?.thresholdValue;
  const severity = getSeverity(score, threshold);
  const previewLogs = (detail.sessionLogs ?? []).slice(0, SESSION_LOG_PREVIEW_LIMIT);
  const handleLlmAnalyze = () => {
    setLlmLoading(true);
    setLlmError("");
    analyzeTraceLogSessionWithLlm(sessionId)
      .then((data) => {
        setDetail((current) => ({
          ...current,
          session: {
            ...current.session,
            aiAnalysis: data.aiAnalysis,
          },
        }));
      })
      .catch((err) => setLlmError(err.message || "LLM 분석을 실행하지 못했습니다."))
      .finally(() => setLlmLoading(false));
  };

  return (
    <DashboardPage>
      <TraceLogHeader title={`세션 ${sessionId}`} copy="요청 흐름, 원문 로그, 이상 점수 기여도를 함께 확인합니다." summaryCards={summaryCards} />
      <MainContent>
        <BackLink to="/tracelog-dashboard/sessions">← 이상 세션 목록으로 돌아가기</BackLink>

        <Layout>
          <Column>
            <Panel>
              <PanelTitle>세션 정보</PanelTitle>
              <InfoBlock>
                <Label>ID</Label>
                <Value>{detail.session.id}</Value>
              </InfoBlock>
              <InfoBlock>
                <Label>IP</Label>
                <Value>{detail.session.ip}</Value>
              </InfoBlock>
              <InfoBlock>
                <Label>User Agent</Label>
                <Value>{detail.session.userAgent}</Value>
              </InfoBlock>
              <InfoBlock>
                <Label>세션 시간</Label>
                <Value>
                  {formatTimeOnly(detail.session.sessionStart)} ~ {formatTimeOnly(detail.session.sessionEnd)} (
                  {detail.session.sessionLength || "-"})
                </Value>
              </InfoBlock>
              <InfoBlock>
                <Label>요청 수</Label>
                <Value>{detail.session.requestCount ?? "-"}</Value>
              </InfoBlock>
              <InfoBlock>
                <Label>LLM 분석</Label>
                <ActionButton type="button" disabled={llmLoading} onClick={handleLlmAnalyze}>
                  {llmLoading ? "분석 중" : detail.session.aiAnalysis ? "다시 분석" : "LLM 분석 실행"}
                </ActionButton>
                {llmError ? <Value>{llmError}</Value> : null}
                {detail.session.aiAnalysis ? <LlmAnalysisView value={detail.session.aiAnalysis} /> : null}
              </InfoBlock>
            </Panel>

            <ScoreCard>
              <PanelTitle>이상 점수</PanelTitle>
              <ScoreValue>{formatScore(score)}</ScoreValue>
              <ScoreBar>
                <ScoreFill $score={score || 0} />
              </ScoreBar>
              <ScoreMeta>
                <span>임계치 {formatScore(threshold)}</span>
                <span>분석 시간 {formatDateTime(detail.anomalyScore?.analyzedAt)}</span>
                <span>중요도 {severity}</span>
              </ScoreMeta>
            </ScoreCard>
          </Column>

          <Column>
            <LogPanel>
              <PanelHead>
                <PanelTitle>세션 로그</PanelTitle>
                <DetailLink to={`/tracelog-dashboard/sessions/${sessionId}/logs`}>상세 보기</DetailLink>
              </PanelHead>
              <TableWrap>
                <DataTable $minWidth="480px">
                  <thead>
                    <tr>
                      <th>Sequence</th>
                      <th>Method</th>
                      <th>URI</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewLogs.map((log) => (
                      <tr key={log.sequenceNo}>
                        <td>{log.sequenceNo}</td>
                        <td>{log.method}</td>
                        <td>{log.uri}</td>
                        <td>{log.statusCode ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </DataTable>
              </TableWrap>
            </LogPanel>

            <LogPanel>
              <PanelHead>
                <PanelTitle>원문 로그</PanelTitle>
                <DetailLink to={`/tracelog-dashboard/sessions/${sessionId}/logs`}>상세 보기</DetailLink>
              </PanelHead>
              <RawLogBox>{detail.rawLogPreview || "-"}</RawLogBox>
            </LogPanel>
          </Column>

          <Column>
            <Panel>
              <PanelTitle>분석 지표</PanelTitle>
              {metrics.length ? (
                <MetricList>
                  {metrics.map((metric) => (
                    <MetricRow key={metric.key}>
                      <MetricName>{metric.label}</MetricName>
                      <MetricValue>{metric.value}</MetricValue>
                    </MetricRow>
                  ))}
                </MetricList>
              ) : (
                <EmptyState>계산된 지표가 없습니다.</EmptyState>
              )}
            </Panel>

            <Panel>
              <PanelTitle>Feature 기여도</PanelTitle>
              <TableWrap>
                <DataTable $minWidth="420px">
                  <thead>
                    <tr>
                      <th>Feature</th>
                      <th>Value</th>
                      <th>SHAP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.featureContributions.map((item) => (
                      <tr key={item.featureName}>
                        <td>{item.featureName}</td>
                        <td>{item.featureValue ?? "-"}</td>
                        <td>{item.shapValue ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </DataTable>
              </TableWrap>
            </Panel>
          </Column>
        </Layout>
      </MainContent>
    </DashboardPage>
  );
}
