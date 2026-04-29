import { useEffect, useState } from "react";
import styled, { css } from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import tracelogLogo from "../../assets/tracelog-logo.png";
import { readApiResponse } from "../../utils/apiResponse.js";

const cardBase = css`
  position: relative;
  overflow: hidden;
  min-height: 420px;
  padding: 32px;
  border-radius: 32px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  text-decoration: none;
  isolation: isolate;
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    border-color 180ms ease;

  &:hover {
    transform: translateY(-6px);
  }

  @media (max-width: 720px) {
    min-height: 360px;
    padding: 24px;
    border-radius: 24px;
  }
`;

const Page = styled.section`
  position: relative;
  overflow: hidden;
  min-height: calc(100vh - 160px);
  padding: 54px 24px 80px;
  background:
    radial-gradient(circle at 8% 10%, rgba(170, 208, 202, 0.5), transparent 28%),
    radial-gradient(circle at 92% 18%, rgba(228, 211, 182, 0.34), transparent 26%),
    linear-gradient(135deg, #f6f0e7 0%, #edf3ef 48%, #f8faf7 100%);

  @media (max-width: 720px) {
    padding: 28px 16px 48px;
  }
`;

const AmbientGlow = styled.div`
  position: absolute;
  inset: auto -180px -140px auto;
  width: 420px;
  height: 420px;
  border-radius: 999px;
  background: rgba(23, 77, 74, 0.1);
  filter: blur(40px);
  pointer-events: none;
`;

const Shell = styled.div`
  position: relative;
  z-index: 1;
  max-width: 1220px;
  margin: 0 auto;
`;

const Hero = styled.div`
  margin-bottom: 36px;
`;

const Eyebrow = styled.p`
  margin: 0 0 14px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.2em;
  color: #48625d;
`;

const Title = styled.h1`
  margin: 0;
  font-size: clamp(2.6rem, 4.4vw, 5rem);
  line-height: 0.98;
  letter-spacing: -0.055em;
  color: #15201d;
  white-space: nowrap;

  @media (max-width: 980px) {
    white-space: normal;
  }
`;

const Copy = styled.p`
  max-width: 760px;
  margin: 18px 0 0;
  color: #526460;
  font-size: 1.08rem;
  line-height: 1.75;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const DashboardCard = styled(Link)`
  ${cardBase};
  color: #f6fbf8;
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.14), transparent 28%),
    linear-gradient(145deg, #10231d 0%, #17382f 46%, #245248 100%);
  box-shadow: 0 28px 60px rgba(16, 35, 29, 0.24);

  &::after {
    content: "";
    position: absolute;
    inset: auto -50px -65px auto;
    width: 220px;
    height: 220px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
    filter: blur(2px);
  }
`;

const AdminCard = styled(Link)`
  ${cardBase};
  color: #16211d;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.88)),
    linear-gradient(145deg, #eef4f0 0%, #fbfaf6 100%);
  border: 1px solid rgba(20, 31, 28, 0.1);
  box-shadow: 0 24px 48px rgba(35, 46, 42, 0.1);

  &::after {
    content: "";
    position: absolute;
    inset: auto -24px -34px auto;
    width: 180px;
    height: 180px;
    border-radius: 36px;
    background: linear-gradient(
      135deg,
      rgba(27, 88, 83, 0.08),
      rgba(185, 140, 101, 0.08)
    );
    transform: rotate(18deg);
  }
`;

const CardTop = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  gap: 18px;
`;

const CardLabel = styled.span`
  display: inline-flex;
  width: fit-content;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.18em;
  color: currentColor;
  opacity: 0.9;
`;

const AdminLabel = styled(CardLabel)`
  background: rgba(21, 41, 35, 0.05);
  border-color: rgba(21, 41, 35, 0.08);
`;

const LogoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const LogoFrame = styled.div`
  width: 168px;
  height: 168px;
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.12);
  display: grid;
  place-items: center;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  @media (max-width: 720px) {
    width: 124px;
    height: 124px;
  }
`;

const CardTitle = styled.h2`
  max-width: 520px;
  margin: 0;
  font-size: clamp(2rem, 3vw, 3.5rem);
  line-height: 1.02;
  letter-spacing: -0.05em;
`;

const DashboardTitle = styled(CardTitle)`
  color: #f4faf7;
`;

const AdminTitle = styled(CardTitle)`
  color: #13211d;
`;

const CardBody = styled.p`
  max-width: 470px;
  margin: 0;
  font-size: 1rem;
  line-height: 1.7;
`;

const DashboardBody = styled(CardBody)`
  color: rgba(246, 251, 248, 0.76);
`;

const AdminBody = styled(CardBody)`
  color: #556763;
`;

const CardFooter = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-top: 28px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
`;

const AdminFooter = styled(CardFooter)`
  border-top-color: rgba(19, 33, 29, 0.1);
`;

const ActionGroup = styled.div`
  display: grid;
  gap: 6px;
`;

const ActionText = styled.span`
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: -0.02em;
`;

const ActionHint = styled.span`
  font-size: 0.9rem;
  opacity: 0.72;
`;

const ArrowWrap = styled.span`
  width: 56px;
  height: 56px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.12);
  font-size: 24px;
  line-height: 1;
`;

const AdminArrowWrap = styled(ArrowWrap)`
  background: rgba(18, 36, 32, 0.06);
`;

const LoadingShell = styled.div`
  min-height: calc(100vh - 160px);
  display: grid;
  place-items: center;
  color: #556763;
  font-size: 0.98rem;
`;

export default function AdminEntry() {
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

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

  if (checking) {
    return <LoadingShell>관리자 권한을 확인하는 중입니다.</LoadingShell>;
  }

  return (
    <Page>
      <AmbientGlow />
      <Shell>
        <Hero>
          <Eyebrow>ADMIN ENTRY</Eyebrow>
          <Title>관리자 진입 경로를 선택하세요.</Title>
          <Copy>원하는 관리자 화면을 선택해 바로 이동하세요.</Copy>
        </Hero>

        <Grid>
          <DashboardCard to="/tracelog-dashboard">
            <CardTop>
              <CardLabel>TRACE LOG</CardLabel>
              <LogoRow>
                <LogoFrame>
                  <img src={tracelogLogo} alt="Trace Log" />
                </LogoFrame>
              </LogoRow>
              <DashboardTitle>Trace Log 대시보드로 이동</DashboardTitle>
              <DashboardBody>
                로그 분석, 세션 흐름, 이상 탐지 중심의 운영 대시보드로
                이동합니다.
              </DashboardBody>
            </CardTop>

            <CardFooter>
              <ActionGroup>
                <ActionText>대시보드 열기</ActionText>
                <ActionHint>실시간 모니터링과 로그 탐색</ActionHint>
              </ActionGroup>
              <ArrowWrap aria-hidden="true">→</ArrowWrap>
            </CardFooter>
          </DashboardCard>

          <AdminCard to="/admin">
            <CardTop>
              <AdminLabel>SHOP ADMIN</AdminLabel>
              <AdminTitle>관리자 통합페이지로 이동</AdminTitle>
              <AdminBody>
                상품 관리, 할인 정책, 매출 현황을 확인하고 운영 작업을
                진행합니다.
              </AdminBody>
            </CardTop>

            <AdminFooter>
              <ActionGroup>
                <ActionText>관리자 페이지 열기</ActionText>
                <ActionHint>상품 운영과 판매 관리</ActionHint>
              </ActionGroup>
              <AdminArrowWrap aria-hidden="true">→</AdminArrowWrap>
            </AdminFooter>
          </AdminCard>
        </Grid>
      </Shell>
    </Page>
  );
}
