import styled from "styled-components";
import { Link } from "react-router-dom";

export const DashboardPage = styled.section`
  min-height: 100vh;
  background: #f4f6f8;
  color: #172026;
`;

export const DashboardHeader = styled.header`
  position: sticky;
  top: 0;
  z-index: 20;
  border-bottom: 1px solid #dfe5ea;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(12px);
`;

export const HeaderInner = styled.div`
  max-width: 1480px;
  margin: 0 auto;
  padding: 18px clamp(18px, 3.6vw, 48px);
  display: grid;
  grid-template-columns: minmax(360px, 0.95fr) minmax(620px, 2.1fr);
  gap: 18px;
  align-items: center;

  @media (max-width: 1180px) {
    grid-template-columns: 1fr auto;
  }

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

export const BrandBlock = styled.div`
  min-width: 0;
`;

export const Eyebrow = styled.div`
  color: #62707b;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

export const HeaderTitle = styled.h1`
  margin: 4px 0 0;
  font-size: clamp(24px, 2vw, 32px);
  line-height: 1.1;
  font-weight: 850;
  white-space: nowrap;

  @media (max-width: 1180px) {
    white-space: normal;
  }
`;

export const HeaderCopy = styled.p`
  margin: 5px 0 0;
  color: #65727c;
  font-size: 13px;
  line-height: 1.45;
`;

export const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(104px, 1fr));
  gap: 8px;

  @media (max-width: 1180px) {
    grid-column: 1 / -1;
    grid-template-columns: repeat(3, minmax(110px, 1fr));
  }

  @media (max-width: 820px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

export const SummaryCard = styled.div`
  min-height: 74px;
  padding: 13px 14px;
  border: 1px solid #dfe5ea;
  background: #f9fafb;
  display: grid;
  align-content: space-between;
  gap: 8px;
`;

export const SummaryLabel = styled.span`
  color: #66737d;
  font-size: 11px;
  font-weight: 800;
  line-height: 1.3;
`;

export const SummaryValue = styled.strong`
  color: #101820;
  font-size: clamp(18px, 1.9vw, 27px);
  line-height: 1;
  font-weight: 850;
  white-space: nowrap;
`;

export const MainContent = styled.main`
  max-width: 1480px;
  margin: 0 auto;
  padding: clamp(20px, 3vw, 34px) clamp(18px, 3.6vw, 48px) 48px;
`;

export const Panel = styled.section`
  min-width: 0;
  border: 1px solid #dfe5ea;
  background: #fff;
  padding: clamp(18px, 2vw, 26px);
`;

export const PanelHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;

  @media (max-width: 720px) {
    align-items: flex-start;
    flex-direction: column;
  }
`;

export const PanelTitle = styled.h2`
  margin: 0;
  color: #101820;
  font-size: clamp(20px, 2vw, 28px);
  line-height: 1.16;
  font-weight: 850;
`;

export const SubText = styled.p`
  margin: 6px 0 0;
  color: #66737d;
  font-size: 13px;
  line-height: 1.55;
`;

export const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 18px;
  color: #3b6875;
  text-decoration: none;
  font-size: 13px;
  font-weight: 850;

  &:hover {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
`;

export const TableWrap = styled.div`
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow-x: auto;
`;

export const DataTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: ${(props) => props.$minWidth || "760px"};

  th,
  td {
    border-bottom: 1px solid #e5eaee;
    padding: 12px 14px;
    text-align: left;
    vertical-align: top;
    font-size: 13px;
    line-height: 1.45;
  }

  th {
    background: #f6f8fa;
    color: #4f5d66;
    font-size: 12px;
    font-weight: 850;
    white-space: nowrap;
  }

  td {
    background: #fff;
  }

  tbody tr:hover td {
    background: #f9fbfc;
  }
`;

export const EmptyState = styled.div`
  min-height: ${(props) => props.$height || "220px"};
  display: grid;
  place-items: center;
  border: 1px dashed #cfd8df;
  background: #fbfcfd;
  color: #66737d;
  font-size: 14px;
  font-weight: 750;
`;

export function TraceLogHeader({ title, copy, summaryCards = [] }) {
  return (
    <DashboardHeader>
      <HeaderInner>
        <BrandBlock>
          <Eyebrow>TraceLog Admin</Eyebrow>
          <HeaderTitle>{title}</HeaderTitle>
          {copy ? <HeaderCopy>{copy}</HeaderCopy> : null}
        </BrandBlock>

        <SummaryGrid>
          {summaryCards.map((card) => (
            <SummaryCard key={card.label}>
              <SummaryLabel>{card.label}</SummaryLabel>
              <SummaryValue>{card.value}</SummaryValue>
            </SummaryCard>
          ))}
        </SummaryGrid>
      </HeaderInner>
    </DashboardHeader>
  );
}
