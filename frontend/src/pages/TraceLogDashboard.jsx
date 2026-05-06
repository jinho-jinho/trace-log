import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import {
  buildTrendSeries,
  formatAiAnalysis,
  formatAiAnalysisTitle,
  formatDateTimeMultiline,
  formatScore,
  formatSummaryCards,
  getTraceLogDashboard,
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
  SubText,
  TableWrap,
  TraceLogHeader,
} from "./TraceLogLayout.jsx";

const RANGE_OPTIONS = [
  { key: "6h", label: "6H" },
  { key: "24h", label: "24H" },
  { key: "7d", label: "7D" },
];

const RangeTabs = styled.div`
  display: inline-grid;
  grid-template-columns: repeat(3, 1fr);
  min-width: 220px;
  padding: 4px;
  gap: 4px;
  background: #eef2f5;
`;

const RangeTab = styled.button`
  height: 36px;
  border: 0;
  background: ${(props) => (props.$active ? "#172026" : "transparent")};
  color: ${(props) => (props.$active ? "#fff" : "#4f5d66")};
  font-size: 13px;
  font-weight: 850;
  cursor: pointer;
`;

const ChartFrame = styled.div`
  width: 100%;
  overflow-x: auto;
  border: 1px solid #e5eaee;
  background: #fff;
`;

const DashboardStack = styled.div`
  display: grid;
  gap: 22px;
  margin-top: 22px;
`;

const SessionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px;

  @media (max-width: 1180px) {
    grid-template-columns: 1fr;
  }
`;

const TableTitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 12px;
`;

const SmallTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 850;
`;

const ArrowLink = styled(Link)`
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border: 1px solid #dfe5ea;
  color: #172026;
  text-decoration: none;
  font-size: 18px;
  font-weight: 850;

  &:hover {
    background: #eef3f6;
  }
`;

const TimeCell = styled.span`
  white-space: pre-line;
`;

const AnalysisCell = styled.span`
  display: inline-block;
  max-width: 260px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ClickableSessionRow = styled.tr`
  cursor: pointer;

  &:focus-visible td {
    outline: 2px solid #2477a8;
    outline-offset: -2px;
  }
`;

const LoadingShell = styled.div`
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #f4f6f8;
  color: #66737d;
  font-size: 14px;
  font-weight: 750;
`;

const ErrorPanel = styled(Panel)`
  margin-bottom: 18px;
  color: #9b2635;
  background: #fff7f8;
  border-color: #f0c8cf;
`;

function buildChartPoints(values, width, height, padding) {
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  return values
    .map((value, index) => {
      const x = padding.left + (innerWidth * index) / Math.max(values.length - 1, 1);
      const y = padding.top + innerHeight * (1 - Math.min(Math.max(value, 0), 1));
      return `${x},${y}`;
    })
    .join(" ");
}

function TraceChart({ labels, values }) {
  const width = Math.max(1180, labels.length * 58);
  const height = 360;
  const padding = { top: 24, right: 26, bottom: 52, left: 52 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const chartPoints = buildChartPoints(values, width, height, padding);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="시간대별 평균 이상 점수 추이">
      <rect x="0" y="0" width={width} height={height} fill="#ffffff" />
      {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
        const y = padding.top + innerHeight * (1 - tick);
        return (
          <g key={tick}>
            <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#dfe5ea" />
            <text x={padding.left - 12} y={y + 4} textAnchor="end" fontSize="11" fill="#66737d">
              {tick}
            </text>
          </g>
        );
      })}
      {labels.map((label, index) => {
        const x = padding.left + (innerWidth * index) / Math.max(labels.length - 1, 1);
        return (
          <g key={`${label}-${index}`}>
            <line x1={x} y1={padding.top} x2={x} y2={height - padding.bottom} stroke="#f0f3f5" />
            <text x={x} y={height - 18} textAnchor="middle" fontSize="11" fill="#66737d">
              {label}
            </text>
          </g>
        );
      })}
      <polyline fill="none" stroke="#2477a8" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" points={chartPoints} />
    </svg>
  );
}

function SessionTable({ title, rows, to }) {
  const navigate = useNavigate();

  const openSessionDetail = (sessionId) => {
    navigate(`/tracelog-dashboard/sessions/${sessionId}`);
  };

  return (
    <Panel>
      <TableTitleRow>
        <SmallTitle>{title}</SmallTitle>
        <ArrowLink to={to} aria-label={`${title} 목록으로 이동`}>
          →
        </ArrowLink>
      </TableTitleRow>
      <TableWrap>
        <DataTable $minWidth="560px">
          <thead>
            <tr>
              <th>ID</th>
              <th>시작 시간</th>
              <th>점수</th>
              <th>AI 분석</th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((row) => (
              <ClickableSessionRow
                key={row.id}
                tabIndex={0}
                onClick={() => openSessionDetail(row.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openSessionDetail(row.id);
                  }
                }}
              >
                <td>{row.id}</td>
                <td>
                  <TimeCell>{formatDateTimeMultiline(row.sessionStart)}</TimeCell>
                </td>
                <td>{formatScore(row.anomalyScore)}</td>
                <td>
                  <AnalysisCell title={formatAiAnalysisTitle(row.aiAnalysis)}>{formatAiAnalysis(row.aiAnalysis)}</AnalysisCell>
                </td>
              </ClickableSessionRow>
            ))}
          </tbody>
        </DataTable>
      </TableWrap>
    </Panel>
  );
}

export default function TraceLogDashboard() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [range, setRange] = useState("24h");
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

    getTraceLogDashboard(range)
      .then((data) => {
        if (active) setDashboard(data);
      })
      .catch((err) => {
        if (active) setError(err.message || "대시보드 데이터를 불러오지 못했습니다.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [checking, range]);

  const summaryCards = useMemo(() => formatSummaryCards(dashboard?.header), [dashboard]);
  const chartData = useMemo(() => buildTrendSeries(dashboard?.scoreTrend ?? [], range), [dashboard?.scoreTrend, range]);

  if (checking) return <LoadingShell>관리자 권한을 확인하고 있습니다.</LoadingShell>;

  return (
    <DashboardPage>
      <TraceLogHeader
        title="보안 이상 탐지 대시보드"
        copy="세션 기반 요청 패턴과 AI 분석 결과를 한 화면에서 모니터링합니다."
        summaryCards={summaryCards}
      />

      <MainContent>
        <BackLink to="/admin/select">← 관리자 메뉴</BackLink>
        {error ? <ErrorPanel>{error}</ErrorPanel> : null}

        <DashboardStack>
          <Panel>
            <PanelHead>
              <div>
                <PanelTitle>시간대별 평균 이상 점수</PanelTitle>
                <SubText>선택한 기간 동안 탐지 모델이 산출한 평균 이상 점수 추이입니다.</SubText>
              </div>
              <RangeTabs role="tablist" aria-label="차트 기간">
                {RANGE_OPTIONS.map((option) => (
                  <RangeTab key={option.key} type="button" $active={range === option.key} onClick={() => setRange(option.key)}>
                    {option.label}
                  </RangeTab>
                ))}
              </RangeTabs>
            </PanelHead>
            <ChartFrame>
              {loading ? (
                <EmptyState $height="360px">추이 데이터를 불러오는 중입니다.</EmptyState>
              ) : (
                <TraceChart labels={chartData.labels} values={chartData.values} />
              )}
            </ChartFrame>
          </Panel>

          <SessionGrid>
            <SessionTable title="24시간 이내 최근 이상 세션" rows={dashboard?.anomalySessions} to="/tracelog-dashboard/sessions?sort=latest" />
            <SessionTable title="24시간 이내 Top 이상 세션" rows={dashboard?.topAnomalySessions} to="/tracelog-dashboard/sessions?sort=score" />
          </SessionGrid>
        </DashboardStack>
      </MainContent>
    </DashboardPage>
  );
}
