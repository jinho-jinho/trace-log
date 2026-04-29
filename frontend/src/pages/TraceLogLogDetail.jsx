import { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate, useParams } from "react-router-dom";
import {
  formatDateTime,
  formatSummaryCards,
  getTraceLogDashboard,
  getTraceLogSessionLogs,
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

const Meta = styled.div`
  color: #66737d;
  font-size: 13px;
  font-weight: 750;
`;

const RawLogBox = styled.pre`
  margin: 0;
  min-height: 340px;
  max-height: 560px;
  overflow: auto;
  border: 1px solid #e1e7ec;
  background: #fbfcfd;
  padding: 16px 18px;
  color: #27323a;
  font-size: 12px;
  line-height: 1.75;
  white-space: pre-wrap;
  word-break: break-word;
`;

const MoreButton = styled.button`
  margin-top: 16px;
  width: 100%;
  height: 42px;
  border: 1px solid #d6dee4;
  background: #fff;
  color: #172026;
  font-size: 13px;
  font-weight: 850;
  cursor: pointer;

  &:disabled {
    color: #99a4ac;
    cursor: wait;
  }
`;

const Stack = styled.div`
  display: grid;
  gap: 22px;
`;

export default function TraceLogLogDetail() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const [checking, setChecking] = useState(true);
  const [header, setHeader] = useState(null);
  const [logs, setLogs] = useState([]);
  const [rawLogs, setRawLogs] = useState("");
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
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

    getTraceLogSessionLogs(sessionId, { page, size: 30 })
      .then((data) => {
        if (!active) return;
        setLogs((prev) => (page === 0 ? data.logs ?? [] : [...prev, ...(data.logs ?? [])]));
        setRawLogs(data.rawLogs ?? "");
        setTotalCount(data.totalCount ?? 0);
      })
      .catch((err) => {
        if (active) setError(err.message || "로그 상세를 불러오지 못했습니다.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [checking, page, sessionId]);

  if (checking || (loading && page === 0)) return <EmptyState $height="100vh">로그 상세를 불러오는 중입니다.</EmptyState>;
  if (error) return <EmptyState $height="100vh">{error}</EmptyState>;

  const hasMore = logs.length < totalCount;

  return (
    <DashboardPage>
      <TraceLogHeader title={`세션 ${sessionId} 로그 상세`} copy="요청 단위 로그와 원문 로그를 전체 흐름 기준으로 확인합니다." summaryCards={formatSummaryCards(header)} />
      <MainContent>
        <BackLink to={`/tracelog-dashboard/sessions/${sessionId}`}>← 세션 상세로 돌아가기</BackLink>

        <Stack>
          <Panel>
            <PanelHead>
              <div>
                <PanelTitle>요청 로그</PanelTitle>
                <SubText>각 요청의 파생 지표와 엔드포인트 특성을 함께 표시합니다.</SubText>
              </div>
              <Meta>
                {logs.length} / {totalCount}
              </Meta>
            </PanelHead>

            <TableWrap>
              <DataTable $minWidth="1320px">
                <thead>
                  <tr>
                    <th>Seq</th>
                    <th>Request Time</th>
                    <th>Method</th>
                    <th>URI</th>
                    <th>Status</th>
                    <th>Bytes</th>
                    <th>Referer</th>
                    <th>Label</th>
                    <th>Endpoint</th>
                    <th>Query</th>
                    <th>URI Len</th>
                    <th>Query Len</th>
                    <th>Special</th>
                    <th>Special Ratio</th>
                    <th>Suspicious</th>
                    <th>Login</th>
                    <th>Admin</th>
                    <th>Attempt</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.sequenceNo}>
                      <td>{log.sequenceNo}</td>
                      <td>{formatDateTime(log.requestTime)}</td>
                      <td>{log.method}</td>
                      <td>{log.uri}</td>
                      <td>{log.statusCode ?? "-"}</td>
                      <td>{log.responseBytes ?? "-"}</td>
                      <td>{log.referer || "-"}</td>
                      <td>{log.label || "-"}</td>
                      <td>{log.endpoint || "-"}</td>
                      <td>{log.queryString || "-"}</td>
                      <td>{log.uriLength ?? "-"}</td>
                      <td>{log.queryLength ?? "-"}</td>
                      <td>{log.specialCharCount ?? "-"}</td>
                      <td>{log.specialCharRatio ?? "-"}</td>
                      <td>{log.suspiciousKeywordCount ?? "-"}</td>
                      <td>{log.isLoginEndpoint == null ? "-" : String(log.isLoginEndpoint)}</td>
                      <td>{log.isAdminEndpoint == null ? "-" : String(log.isAdminEndpoint)}</td>
                      <td>{log.isLoginAttempt == null ? "-" : String(log.isLoginAttempt)}</td>
                    </tr>
                  ))}
                </tbody>
              </DataTable>
            </TableWrap>

            {hasMore ? (
              <MoreButton type="button" disabled={loading} onClick={() => setPage((prev) => prev + 1)}>
                {loading ? "불러오는 중..." : "더 보기"}
              </MoreButton>
            ) : null}
          </Panel>

          <Panel>
            <PanelHead>
              <div>
                <PanelTitle>원문 로그</PanelTitle>
                <SubText>세션에 포함된 raw log 전체 내용입니다.</SubText>
              </div>
            </PanelHead>
            <RawLogBox>{rawLogs || "-"}</RawLogBox>
          </Panel>
        </Stack>
      </MainContent>
    </DashboardPage>
  );
}
