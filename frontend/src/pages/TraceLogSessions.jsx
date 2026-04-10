import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { readApiResponse } from "../utils/apiResponse.js";
import { anomalySessions, formatDateTime, toDateTimeLocalValue } from "./traceLogData.js";

const Page = styled.section`
  min-height: 100vh;
  padding: 28px 32px 40px;
  background: #f5f5f5;
  color: #1c1c1c;

  @media (max-width: 720px) {
    padding: 18px 16px 28px;
  }
`;

const Head = styled.div`
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 22px;

  @media (max-width: 900px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const BackLink = styled(Link)`
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 700;
  color: #55706a;
`;

const Title = styled.h1`
  margin: 10px 0 0;
  font-size: clamp(2rem, 3vw, 3rem);
  line-height: 1.02;
  letter-spacing: -0.05em;
`;

const Copy = styled.p`
  margin: 10px 0 0;
  color: #64726f;
  font-size: 1rem;
`;

const Panel = styled.section`
  padding: 24px;
  border-radius: 20px;
  background: #fff;
  border: 1px solid #e9e9e9;
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  align-items: end;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.label`
  display: grid;
  gap: 8px;
  font-size: 0.92rem;
  font-weight: 700;
  color: #3e4a47;
`;

const Input = styled.input`
  width: 100%;
  height: 46px;
  padding: 0 14px;
  border: 1px solid #d5d9d8;
  border-radius: 12px;
  background: #fbfbfb;
  font-size: 0.96rem;
`;

const SortRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 18px;
  flex-wrap: wrap;
`;

const SortChip = styled.button`
  height: 40px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid ${(props) => (props.$active ? "#111" : "#d5d5d5")};
  background: ${(props) => (props.$active ? "#111" : "#fff")};
  color: ${(props) => (props.$active ? "#fff" : "#222")};
  font-size: 0.94rem;
  font-weight: 700;
  cursor: pointer;
`;

const ResultMeta = styled.div`
  margin-top: 16px;
  color: #5f6c69;
  font-size: 0.95rem;
`;

const TableWrap = styled.div`
  overflow-x: auto;
  margin-top: 24px;
`;

const DataTable = styled.table`
  width: 100%;
  min-width: 980px;
  border-collapse: collapse;

  th,
  td {
    padding: 14px 14px;
    border: 1px solid #d8d8d8;
    text-align: left;
    font-size: 0.96rem;
    vertical-align: top;
  }

  th {
    background: #f1f1f1;
    font-size: 0.98rem;
    font-weight: 800;
    white-space: nowrap;
  }

  td {
    background: #fff;
  }
`;

const ClickableRow = styled.tr`
  cursor: pointer;

  &:hover td {
    background: #f7faf9;
  }
`;

const EmptyState = styled.div`
  padding: 42px 12px 20px;
  color: #6a7673;
  font-size: 1rem;
  text-align: center;
`;

const LoadingShell = styled.div`
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #f5f5f5;
  color: #666;
  font-size: 1rem;
`;

export default function TraceLogSessions() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [checking, setChecking] = useState(true);

  const initialSort = searchParams.get("sort") === "score" ? "score" : "latest";
  const [sortBy, setSortBy] = useState(initialSort);
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [ipQuery, setIpQuery] = useState("");

  useEffect(() => {
    setSortBy(searchParams.get("sort") === "score" ? "score" : "latest");
  }, [searchParams]);

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

  const filteredRows = useMemo(() => {
    let rows = [...anomalySessions];

    if (startAt) {
      rows = rows.filter((row) => new Date(row.startedAt) >= new Date(startAt));
    }

    if (endAt) {
      rows = rows.filter((row) => new Date(row.endedAt) <= new Date(endAt));
    }

    if (ipQuery.trim()) {
      const normalized = ipQuery.trim().toLowerCase();
      rows = rows.filter((row) => row.ip.toLowerCase().includes(normalized));
    }

    rows.sort((a, b) => {
      if (sortBy === "score") {
        return b.score - a.score || new Date(b.startedAt) - new Date(a.startedAt);
      }
      return new Date(b.startedAt) - new Date(a.startedAt);
    });

    return rows;
  }, [endAt, ipQuery, sortBy, startAt]);

  const handleSortChange = (nextSort) => {
    setSortBy(nextSort);
    setSearchParams({ sort: nextSort });
  };

  const presetStart = toDateTimeLocalValue(anomalySessions[anomalySessions.length - 1].startedAt);
  const presetEnd = toDateTimeLocalValue(anomalySessions[0].endedAt);

  if (checking) {
    return <LoadingShell>관리자 권한을 확인하는 중입니다.</LoadingShell>;
  }

  return (
    <Page>
      <Head>
        <div>
          <BackLink to="/tracelog-dashboard">← Trace Log 대시보드로 돌아가기</BackLink>
          <Title>이상 세션 페이지</Title>
          <Copy>세션 시작 시간과 종료 시간 범위를 지정하고 IP로 검색할 수 있습니다.</Copy>
        </div>
      </Head>

      <Panel>
        <FilterGrid>
          <Field>
            세션 시작 시간 이후
            <Input
              type="datetime-local"
              value={startAt}
              min={presetStart}
              max={presetEnd}
              onChange={(event) => setStartAt(event.target.value)}
            />
          </Field>

          <Field>
            세션 종료 시간 이전
            <Input
              type="datetime-local"
              value={endAt}
              min={presetStart}
              max={presetEnd}
              onChange={(event) => setEndAt(event.target.value)}
            />
          </Field>

          <Field>
            IP 검색
            <Input
              type="search"
              placeholder="예: 121.173"
              value={ipQuery}
              onChange={(event) => setIpQuery(event.target.value)}
            />
          </Field>

          <Field>
            정렬 기준
            <Input value={sortBy === "latest" ? "최신순" : "이상 점수순"} readOnly />
          </Field>
        </FilterGrid>

        <SortRow>
            <SortChip
              type="button"
              $active={sortBy === "latest"}
            onClick={() => handleSortChange("latest")}
            >
              최신순
            </SortChip>
          <SortChip
            type="button"
            $active={sortBy === "score"}
            onClick={() => handleSortChange("score")}
            >
              이상 점수순
            </SortChip>
        </SortRow>

        <ResultMeta>총 {filteredRows.length}개의 이상 세션이 표시됩니다.</ResultMeta>

        <TableWrap>
          {filteredRows.length === 0 ? (
            <EmptyState>조건에 맞는 이상 세션이 없습니다.</EmptyState>
          ) : (
            <DataTable>
              <thead>
                <tr>
                  <th>세션 시작 시간</th>
                  <th>세션 종료 시간</th>
                  <th>세션 ID</th>
                  <th>IP</th>
                  <th>이상 점수</th>
                  <th>행위 패턴 추정</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <ClickableRow
                    key={row.sessionId}
                    onClick={() => navigate(`/tracelog-dashboard/sessions/${row.sessionId}`)}
                  >
                    <td>{formatDateTime(row.startedAt)}</td>
                    <td>{formatDateTime(row.endedAt)}</td>
                    <td>{row.sessionId}</td>
                    <td>{row.ip}</td>
                    <td>{row.score.toFixed(2)}</td>
                    <td>{row.pattern}</td>
                  </ClickableRow>
                ))}
              </tbody>
            </DataTable>
          )}
        </TableWrap>
      </Panel>
    </Page>
  );
}
