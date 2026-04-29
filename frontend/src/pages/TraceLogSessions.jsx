import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  formatAiAnalysis,
  formatDateTime,
  formatScore,
  getTraceLogDashboard,
  getTraceLogSessions,
  toDateTimeLocalValue,
  truncateText,
  verifyAdminSession,
  formatSummaryCards,
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

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr minmax(180px, 0.8fr) minmax(140px, 0.6fr);
  gap: 12px;
  align-items: end;

  @media (max-width: 980px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.label`
  display: grid;
  gap: 7px;
  color: #4f5d66;
  font-size: 12px;
  font-weight: 850;
`;

const Input = styled.input`
  width: 100%;
  height: 40px;
  border: 1px solid #d6dee4;
  background: #fff;
  padding: 0 12px;
  color: #172026;
  font-size: 13px;
`;

const SortRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
`;

const SortChip = styled.button`
  height: 34px;
  padding: 0 14px;
  border: 1px solid ${(props) => (props.$active ? "#172026" : "#d6dee4")};
  background: ${(props) => (props.$active ? "#172026" : "#fff")};
  color: ${(props) => (props.$active ? "#fff" : "#4f5d66")};
  font-size: 12px;
  font-weight: 850;
  cursor: pointer;
`;

const ResultMeta = styled.div`
  margin-top: 16px;
  color: #66737d;
  font-size: 13px;
`;

const ClickableRow = styled.tr`
  cursor: pointer;
`;

const ClampCell = styled.span`
  display: inline-block;
  max-width: ${(props) => props.$maxWidth || "240px"};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

export default function TraceLogSessions() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [checking, setChecking] = useState(true);
  const [header, setHeader] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") === "score" ? "score" : "latest");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [ipQuery, setIpQuery] = useState("");

  useEffect(() => {
    setSortBy(searchParams.get("sort") === "score" ? "score" : "latest");
  }, [searchParams]);

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
    getTraceLogDashboard("24h")
      .then((data) => {
        if (active) setHeader(data.header);
      })
      .catch(() => {
        if (active) setHeader(null);
      });
    return () => {
      active = false;
    };
  }, [checking]);

  useEffect(() => {
    if (checking) return undefined;
    let active = true;
    setLoading(true);
    setError("");

    getTraceLogSessions({ startAt, endAt, ip: ipQuery, sort: sortBy })
      .then((data) => {
        if (active) setRows(data.sessions ?? []);
      })
      .catch((err) => {
        if (active) {
          setError(err.message || "세션 목록을 불러오지 못했습니다.");
          setRows([]);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [checking, endAt, ipQuery, sortBy, startAt]);

  const handleSortChange = (nextSort) => {
    setSortBy(nextSort);
    setSearchParams({ sort: nextSort });
  };

  const dateBounds = useMemo(() => {
    if (!rows.length) return { min: "", max: "" };
    const sortedByStart = [...rows].sort((a, b) => new Date(a.sessionStart) - new Date(b.sessionStart));
    const sortedByEnd = [...rows].sort((a, b) => new Date(a.sessionEnd) - new Date(b.sessionEnd));
    return {
      min: toDateTimeLocalValue(sortedByStart[0]?.sessionStart),
      max: toDateTimeLocalValue(sortedByEnd.at(-1)?.sessionEnd),
    };
  }, [rows]);

  if (checking) return <LoadingShell>관리자 권한을 확인하고 있습니다.</LoadingShell>;

  return (
    <DashboardPage>
      <TraceLogHeader
        title="이상 세션 목록"
        copy="시간 범위, IP, 정렬 조건으로 탐지된 세션을 조회합니다."
        summaryCards={formatSummaryCards(header)}
      />

      <MainContent>
        <BackLink to="/tracelog-dashboard">← 대시보드로 돌아가기</BackLink>
        <Panel>
          <PanelHead>
            <div>
              <PanelTitle>세션 검색</PanelTitle>
              <SubText>필터를 변경하면 조건에 맞는 세션이 자동으로 갱신됩니다.</SubText>
            </div>
          </PanelHead>

          <FilterGrid>
            <Field>
              시작 시간 이후
              <Input type="datetime-local" value={startAt} min={dateBounds.min} max={dateBounds.max} onChange={(event) => setStartAt(event.target.value)} />
            </Field>
            <Field>
              종료 시간 이전
              <Input type="datetime-local" value={endAt} min={dateBounds.min} max={dateBounds.max} onChange={(event) => setEndAt(event.target.value)} />
            </Field>
            <Field>
              IP 검색
              <Input type="search" placeholder="예: 121.173" value={ipQuery} onChange={(event) => setIpQuery(event.target.value)} />
            </Field>
            <Field>
              정렬 기준
              <Input value={sortBy === "latest" ? "최신순" : "이상 점수순"} readOnly />
            </Field>
          </FilterGrid>

          <SortRow>
            <SortChip type="button" $active={sortBy === "latest"} onClick={() => handleSortChange("latest")}>
              최신순
            </SortChip>
            <SortChip type="button" $active={sortBy === "score"} onClick={() => handleSortChange("score")}>
              이상 점수순
            </SortChip>
          </SortRow>

          <ResultMeta>{error ? error : loading ? "세션 목록을 불러오는 중입니다." : `총 ${rows.length}개의 세션을 조회했습니다.`}</ResultMeta>

          <TableWrap>
            {loading ? (
              <EmptyState>세션 목록을 불러오는 중입니다.</EmptyState>
            ) : rows.length === 0 ? (
              <EmptyState>조건에 맞는 세션이 없습니다.</EmptyState>
            ) : (
              <DataTable $minWidth="1040px">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>시작 시간</th>
                    <th>종료 시간</th>
                    <th>IP</th>
                    <th>User Agent</th>
                    <th>이상 점수</th>
                    <th>분석 시간</th>
                    <th>AI 분석</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <ClickableRow key={row.id} onClick={() => navigate(`/tracelog-dashboard/sessions/${row.id}`)}>
                      <td>{row.id}</td>
                      <td>{formatDateTime(row.sessionStart)}</td>
                      <td>{formatDateTime(row.sessionEnd)}</td>
                      <td>{row.ip}</td>
                      <td>
                        <ClampCell $maxWidth="280px" title={row.userAgent}>
                          {row.userAgent}
                        </ClampCell>
                      </td>
                      <td>{formatScore(row.anomalyScore)}</td>
                      <td>{formatDateTime(row.analyzedAt)}</td>
                      <td>
                        <ClampCell $maxWidth="260px" title={formatAiAnalysis(row.aiAnalysis)}>
                          {truncateText(formatAiAnalysis(row.aiAnalysis), 56)}
                        </ClampCell>
                      </td>
                    </ClickableRow>
                  ))}
                </tbody>
              </DataTable>
            )}
          </TableWrap>
        </Panel>
      </MainContent>
    </DashboardPage>
  );
}
