import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { Link, useNavigate, useParams } from "react-router-dom";
import { readApiResponse } from "../utils/apiResponse.js";
import {
  formatDateTime,
  formatDuration,
  formatTimeOnly,
  getSessionById,
  summaryCards,
  threshold,
} from "./traceLogData.js";

const Page = styled.section`
  min-height: 100vh;
  background: #f5f5f5;
  color: #1c1c1c;
`;

const TopBar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 28px 32px;
  border-bottom: 1px solid #e2e2e2;
  background: #fafafa;

  @media (max-width: 1100px) {
    flex-direction: column;
    align-items: stretch;
  }

  @media (max-width: 720px) {
    padding: 18px 16px;
  }
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(140px, 1fr));
  gap: 16px;
  flex: 1;

  @media (max-width: 1280px) {
    grid-template-columns: repeat(3, minmax(140px, 1fr));
  }

  @media (max-width: 760px) {
    grid-template-columns: repeat(2, minmax(120px, 1fr));
  }

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const SummaryCard = styled.div`
  min-height: 92px;
  padding: 18px 20px;
  border: 2px solid #cfcfcf;
  border-radius: 14px;
  background: #f1f1f1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
`;

const SummaryLabel = styled.span`
  font-size: 0.95rem;
  line-height: 1.25;
  font-weight: 700;
  color: #444;
`;

const SummaryValue = styled.strong`
  font-size: clamp(1.75rem, 2.4vw, 2.4rem);
  line-height: 1;
  letter-spacing: -0.04em;
  color: #1e1e1e;
  white-space: nowrap;
`;

const IconRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const IconButton = styled.button`
  width: 58px;
  height: 58px;
  border: 0;
  border-radius: 16px;
  background: transparent;
  display: grid;
  place-items: center;
  cursor: pointer;
  color: #222;

  &:hover {
    background: #efefef;
  }

  svg {
    width: 32px;
    height: 32px;
    stroke: currentColor;
  }
`;

const Content = styled.div`
  padding: 30px 32px 40px;

  @media (max-width: 720px) {
    padding: 18px 16px 32px;
  }
`;

const BackLink = styled(Link)`
  display: inline-flex;
  margin-bottom: 18px;
  text-decoration: none;
  color: #55706a;
  font-weight: 700;
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: 1.05fr 1.35fr 1fr;
  gap: 24px;

  @media (max-width: 1280px) {
    grid-template-columns: 1fr;
  }
`;

const Column = styled.div`
  display: grid;
  gap: 24px;
`;

const Panel = styled.section`
  padding: 22px 22px 18px;
  border-radius: 20px;
  background: #fff;
  border: 1px solid #e9e9e9;
`;

const PanelTitle = styled.h2`
  margin: 0 0 18px;
  font-size: clamp(2rem, 2.4vw, 2.6rem);
  line-height: 1.02;
  letter-spacing: -0.05em;
`;

const InfoBlock = styled.div`
  padding: 18px 0;
  border-bottom: 1px solid #ececec;
  font-size: 1rem;
  line-height: 1.65;

  &:first-of-type {
    padding-top: 0;
  }

  &:last-of-type {
    border-bottom: 0;
    padding-bottom: 0;
  }
`;

const Label = styled.div`
  font-weight: 800;
  margin-bottom: 8px;
`;

const Value = styled.div`
  color: #303030;
  white-space: pre-line;
`;

const TableHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
`;

const ArrowOut = styled.span`
  font-size: 1.85rem;
  line-height: 1;
`;

const TableWrap = styled.div`
  overflow-x: auto;
`;

const DataTable = styled.table`
  width: 100%;
  min-width: 560px;
  border-collapse: collapse;

  th,
  td {
    padding: 12px 14px;
    border: 1px solid #d8d8d8;
    text-align: left;
    font-size: 0.96rem;
    vertical-align: top;
  }

  th {
    background: #f1f1f1;
    font-weight: 800;
  }

  td {
    background: #fff;
  }
`;

const RawLogBox = styled.pre`
  margin: 0;
  padding: 14px 16px;
  min-height: 260px;
  overflow: auto;
  border: 1px solid #dfdfdf;
  border-radius: 14px;
  background: #fafafa;
  font-size: 0.9rem;
  line-height: 1.75;
  white-space: pre-wrap;
  word-break: break-word;
`;

const MetricList = styled.div`
  display: grid;
  gap: 0;
`;

const MetricRow = styled.div`
  padding: 18px 0;
  border-bottom: 1px solid #ececec;
  font-size: 1rem;
  line-height: 1.55;

  &:last-child {
    border-bottom: 0;
  }
`;

const ScoreCard = styled(Panel)`
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 14px;
  min-height: 280px;
`;

const ScoreLabel = styled.div`
  font-size: 1.25rem;
  font-weight: 800;
`;

const ScoreValue = styled.div`
  font-size: clamp(3rem, 5vw, 4rem);
  line-height: 1;
  font-weight: 900;
  letter-spacing: -0.06em;
`;

const ScoreBar = styled.div`
  width: 100%;
  height: 12px;
  border-radius: 999px;
  background: #ededed;
  overflow: hidden;
`;

const ScoreFill = styled.div`
  width: ${(props) => `${Math.min(props.$score * 100, 100)}%`};
  height: 100%;
  background: #ff2020;
`;

const ThresholdText = styled.div`
  font-size: 1rem;
  color: #555;
  font-weight: 700;
`;

const EmptyState = styled.div`
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #f5f5f5;
  color: #666;
  font-size: 1rem;
`;

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M6.5 16.5h11l-1.2-1.6a3 3 0 0 1-.55-1.75V10a4.75 4.75 0 1 0-9.5 0v3.15c0 .63-.19 1.25-.55 1.75L4.5 16.5h2Z"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M10 19a2.2 2.2 0 0 0 4 0" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M10.3 3.6h3.4l.55 2.05c.28.1.55.22.8.37l1.93-1.02l2.4 2.4l-1.03 1.94c.14.25.27.52.37.8l2.08.56v3.39l-2.08.56a7.25 7.25 0 0 1-.37.8l1.03 1.94l-2.4 2.4l-1.93-1.02c-.25.14-.52.27-.8.37l-.55 2.05h-3.4l-.55-2.05a7.45 7.45 0 0 1-.8-.37L6.93 21l-2.4-2.4l1.03-1.94a7.25 7.25 0 0 1-.37-.8L3.1 15.3v-3.39l2.08-.56c.1-.28.22-.55.37-.8L4.52 8.6L6.93 6.2l1.92 1.02c.26-.15.53-.27.8-.37l.56-2.05Z"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.7" strokeWidth="1.8" />
    </svg>
  );
}

export default function TraceLogSessionDetail() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;

    async function verifyAdmin() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const data = await readApiResponse(res);

        if (!res.ok || !data.user || data.user.role !== "admin") {
          navigate("/login", { replace: true });
          return;
        }
      } catch {
        navigate("/login", { replace: true });
        return;
      } finally {
        if (active) {
          setChecking(false);
        }
      }
    }

    verifyAdmin();

    return () => {
      active = false;
    };
  }, [navigate]);

  const session = useMemo(() => getSessionById(sessionId), [sessionId]);

  if (checking) {
    return <EmptyState>관리자 권한을 확인하는 중입니다.</EmptyState>;
  }

  if (!session) {
    return <EmptyState>세션 정보를 찾을 수 없습니다.</EmptyState>;
  }

  return (
    <Page>
      <TopBar>
        <SummaryGrid>
          {summaryCards.map((card) => (
            <SummaryCard key={card.label}>
              <SummaryLabel>{card.label}</SummaryLabel>
              <SummaryValue>{card.value}</SummaryValue>
            </SummaryCard>
          ))}
        </SummaryGrid>

        <IconRow>
          <IconButton type="button" aria-label="알림">
            <BellIcon />
          </IconButton>
          <IconButton type="button" aria-label="설정">
            <SettingsIcon />
          </IconButton>
        </IconRow>
      </TopBar>

      <Content>
        <BackLink to="/tracelog-dashboard/sessions">← 이상 세션 페이지로 돌아가기</BackLink>

        <Layout>
          <Column>
            <Panel>
              <PanelTitle>세션 정보</PanelTitle>

              <InfoBlock>
                <Label>세션 ID</Label>
                <Value>{session.sessionId}</Value>
              </InfoBlock>

              <InfoBlock>
                <Label>출발 IP</Label>
                <Value>{session.ip}</Value>
              </InfoBlock>

              <InfoBlock>
                <Label>세션 시간</Label>
                <Value>
                  {formatTimeOnly(session.startedAt)} ~ {formatTimeOnly(session.endedAt)} (
                  {formatDuration(session.startedAt, session.endedAt)})
                </Value>
              </InfoBlock>

              <InfoBlock>
                <Label>총 요청 수</Label>
                <Value>{session.totalRequests}</Value>
              </InfoBlock>

              <InfoBlock>
                <Label>주요 접근 경로</Label>
                <Value>
                  {session.primaryPaths.map((item) => `- ${item.path} (${item.count}회)`).join("\n")}
                </Value>
              </InfoBlock>

              <InfoBlock>
                <Label>행위 패턴 추정</Label>
                <Value>
                  {session.pattern}
                  {"\n"}→ {session.behaviorSummary}
                </Value>
              </InfoBlock>

              <InfoBlock>
                <Label>판단 근거</Label>
                <Value>{session.evidence.map((item) => `- ${item}`).join("\n")}</Value>
              </InfoBlock>
            </Panel>
          </Column>

          <Column>
            <Panel>
              <TableHead>
                <PanelTitle>세션 로그</PanelTitle>
                <ArrowOut aria-hidden="true">↗</ArrowOut>
              </TableHead>

              <TableWrap>
                <DataTable>
                  <thead>
                    <tr>
                      <th>발생 시각</th>
                      <th>Method</th>
                      <th>URI</th>
                      <th>Status</th>
                      <th>특징</th>
                    </tr>
                  </thead>
                  <tbody>
                    {session.requestLogs.map((log, index) => (
                      <tr key={`${log.occurredAt}-${index}`}>
                        <td>{formatDateTime(log.occurredAt)}</td>
                        <td>{log.method}</td>
                        <td>{log.uri}</td>
                        <td>{log.status}</td>
                        <td>{log.feature}</td>
                      </tr>
                    ))}
                  </tbody>
                </DataTable>
              </TableWrap>
            </Panel>

            <Panel>
              <TableHead>
                <PanelTitle>원문 로그</PanelTitle>
                <ArrowOut aria-hidden="true">↗</ArrowOut>
              </TableHead>
              <RawLogBox>{session.rawLogs.join("\n")}</RawLogBox>
            </Panel>
          </Column>

          <Column>
            <Panel>
              <PanelTitle>분석 지표</PanelTitle>
              <MetricList>
                <MetricRow>요청 빈도: {session.analysisMetrics.requestRate}</MetricRow>
                <MetricRow>실패율 (4xx): {session.analysisMetrics.failureRate}</MetricRow>
                <MetricRow>평균 요청 간격: {session.analysisMetrics.averageInterval}</MetricRow>
                <MetricRow>
                  반복 엔드포인트 비율: {session.analysisMetrics.repeatedEndpointRatio}
                </MetricRow>
                <MetricRow>고유 endpoint 수: {session.analysisMetrics.uniqueEndpointCount}</MetricRow>
              </MetricList>
            </Panel>

            <ScoreCard>
              <ScoreLabel>이상 점수</ScoreLabel>
              <ScoreValue>{session.score.toFixed(2)}</ScoreValue>
              <ScoreBar>
                <ScoreFill $score={session.score} />
              </ScoreBar>
              <ThresholdText>임계치: {threshold.toFixed(2)}</ThresholdText>
            </ScoreCard>
          </Column>
        </Layout>
      </Content>
    </Page>
  );
}
