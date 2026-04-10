import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { readApiResponse } from "../utils/apiResponse.js";
import {
  anomalySessions,
  chartSeries,
  formatDateTimeMultiline,
  rangeOptions,
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

const Panel = styled.section`
  padding: 36px 42px;
  border-radius: 20px;
  background: #ffffff;
  border: 1px solid #ececec;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.02);

  @media (max-width: 720px) {
    padding: 22px 18px;
    border-radius: 16px;
  }
`;

const PanelHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 22px;

  @media (max-width: 860px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const PanelTitle = styled.h2`
  margin: 0;
  font-size: clamp(2rem, 3vw, 2.75rem);
  line-height: 1.05;
  letter-spacing: -0.05em;
`;

const RangeTabs = styled.div`
  padding: 4px;
  border-radius: 14px;
  background: #ededed;
  display: inline-grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  min-width: 300px;
`;

const RangeTab = styled.button`
  height: 44px;
  border: 0;
  border-radius: 10px;
  background: ${(props) => (props.$active ? "#ffffff" : "transparent")};
  color: #333;
  font-size: 1rem;
  font-weight: 700;
  box-shadow: ${(props) => (props.$active ? "0 1px 4px rgba(0,0,0,0.08)" : "none")};
  cursor: pointer;
`;

const ChartFrame = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const Tables = styled.div`
  display: grid;
  grid-template-columns: 1.25fr 1fr;
  gap: 24px;
  margin-top: 28px;

  @media (max-width: 1180px) {
    grid-template-columns: 1fr;
  }
`;

const TableCard = styled(Panel)`
  padding: 28px 28px 22px;
`;

const TableHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
`;

const TableTitle = styled.h3`
  margin: 0;
  font-size: clamp(1.8rem, 2.4vw, 2.35rem);
  line-height: 1.05;
  letter-spacing: -0.05em;
`;

const ArrowLink = styled(Link)`
  font-size: 1.85rem;
  line-height: 1;
  text-decoration: none;
`;

const TableWrap = styled.div`
  overflow-x: auto;
`;

const DataTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 620px;

  th,
  td {
    border: 1px solid #d8d8d8;
    padding: 14px 14px;
    text-align: left;
    vertical-align: top;
    font-size: 0.98rem;
  }

  th {
    background: #f1f1f1;
    font-size: 1rem;
    font-weight: 800;
    white-space: nowrap;
  }

  td {
    background: #fff;
  }
`;

const TimeCell = styled.span`
  white-space: pre-line;
  line-height: 1.45;
`;

const PatternCell = styled.span`
  display: inline-block;
  line-height: 1.45;
`;

const LoadingShell = styled.div`
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

function buildChartPoints(values, width, height, padding) {
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  return values
    .map((value, index) => {
      const x = padding.left + (innerWidth * index) / (values.length - 1);
      const y = padding.top + innerHeight * (1 - value);
      return `${x},${y}`;
    })
    .join(" ");
}

function TraceChart({ labels, values }) {
  const width = Math.max(980, labels.length * 64);
  const height = 420;
  const padding = { top: 26, right: 24, bottom: 54, left: 54 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const thresholdY = padding.top + innerHeight * (1 - threshold);
  const chartPoints = buildChartPoints(values, width, height, padding);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img">
      <rect x="0" y="0" width={width} height={height} fill="#ffffff" />

      {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
        const y = padding.top + innerHeight * (1 - tick);
        return (
          <g key={tick}>
            <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#d9d9d9" strokeWidth="1" />
            <text x={padding.left - 14} y={y + 5} textAnchor="end" fontSize="12" fill="#525252">
              {tick}
            </text>
          </g>
        );
      })}

      {labels.map((label, index) => {
        const x = padding.left + (innerWidth * index) / (labels.length - 1);
        return (
          <g key={label}>
            <line x1={x} y1={padding.top} x2={x} y2={height - padding.bottom} stroke="#e2e2e2" strokeWidth="1" />
            <text x={x} y={height - 16} textAnchor="middle" fontSize="12" fill="#4e4e4e">
              {label}
            </text>
          </g>
        );
      })}

      <line
        x1={padding.left}
        y1={thresholdY}
        x2={width - padding.right}
        y2={thresholdY}
        stroke="#ff5a5f"
        strokeWidth="2.4"
      />

      <text x={width - padding.right} y={padding.top - 8} textAnchor="end" fontSize="12" fontWeight="700" fill="#222">
        Threshold: 0.40
      </text>

      <polyline
        fill="none"
        stroke="#2f8fc5"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={chartPoints}
      />
    </svg>
  );
}

export default function TraceLogDashboard() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [range, setRange] = useState("24h");

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

  const currentSeries = useMemo(() => chartSeries[range], [range]);
  const latestRows = useMemo(
    () =>
      [...anomalySessions]
        .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))
        .slice(0, 4),
    []
  );
  const topRows = useMemo(
    () => [...anomalySessions].sort((a, b) => b.score - a.score).slice(0, 5),
    []
  );

  if (checking) {
    return <LoadingShell>관리자 권한을 확인하는 중입니다.</LoadingShell>;
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
        <Panel>
          <PanelHead>
            <PanelTitle>시간대별 평균 이상 점수 추이</PanelTitle>
            <RangeTabs role="tablist" aria-label="chart range">
              {rangeOptions.map((option) => (
                <RangeTab
                  key={option.key}
                  type="button"
                  $active={range === option.key}
                  onClick={() => setRange(option.key)}
                >
                  {option.label}
                </RangeTab>
              ))}
            </RangeTabs>
          </PanelHead>

          <ChartFrame>
            <TraceChart labels={currentSeries.labels} values={currentSeries.values} />
          </ChartFrame>
        </Panel>

        <Tables>
          <TableCard>
            <TableHead>
              <TableTitle>이상 세션 목록</TableTitle>
              <ArrowLink to="/tracelog-dashboard/sessions?sort=latest" aria-label="이상 세션 페이지로 이동">
                ↗
              </ArrowLink>
            </TableHead>

            <TableWrap>
              <DataTable>
                <thead>
                  <tr>
                    <th>발생 시각</th>
                    <th>세션 ID</th>
                    <th>이상 점수</th>
                    <th>행위 패턴 추정</th>
                  </tr>
                </thead>
                <tbody>
                  {latestRows.map((row) => (
                    <tr key={row.sessionId}>
                      <td>
                        <TimeCell>{formatDateTimeMultiline(row.startedAt)}</TimeCell>
                      </td>
                      <td>{row.sessionId}</td>
                      <td>{row.score.toFixed(2)}</td>
                      <td>
                        <PatternCell>{row.pattern}</PatternCell>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </DataTable>
            </TableWrap>
          </TableCard>

          <TableCard>
            <TableHead>
              <TableTitle>이상 점수 상위 세션</TableTitle>
              <ArrowLink to="/tracelog-dashboard/sessions?sort=score" aria-label="이상 세션 페이지로 이동">
                ↗
              </ArrowLink>
            </TableHead>

            <TableWrap>
              <DataTable>
                <thead>
                  <tr>
                    <th>순위</th>
                    <th>세션 ID</th>
                    <th>이상 점수</th>
                    <th>행위 패턴 추정</th>
                  </tr>
                </thead>
                <tbody>
                  {topRows.map((row, index) => (
                    <tr key={row.sessionId}>
                      <td>{index + 1}</td>
                      <td>{row.sessionId}</td>
                      <td>{row.score.toFixed(2)}</td>
                      <td>
                        <PatternCell>{row.pattern}</PatternCell>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </DataTable>
            </TableWrap>
          </TableCard>
        </Tables>
      </Content>
    </Page>
  );
}
