import { useEffect, useState } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { formatDateTime, getTraceLogNotifications, markAllTraceLogNotificationsRead, markTraceLogNotificationRead } from "./traceLogApi.js";

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
  grid-template-columns: minmax(360px, 0.95fr) minmax(620px, 2.1fr) auto;
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
  grid-template-columns: repeat(5, minmax(104px, 1fr));
  gap: 8px;

  @media (max-width: 1180px) {
    grid-column: 1 / -1;
    grid-template-columns: repeat(5, minmax(110px, 1fr));
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

export const HeaderActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

export const IconButton = styled.button`
  position: relative;
  width: 42px;
  height: 42px;
  border: 1px solid #dfe5ea;
  background: #fff;
  display: grid;
  place-items: center;
  cursor: pointer;
  color: #172026;

  &:hover {
    background: #eef3f6;
  }

  svg {
    width: 20px;
    height: 20px;
    stroke: currentColor;
  }
`;

const UnreadDot = styled.span`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #d7263d;
  box-shadow: 0 0 0 2px #fff;
`;

const NotificationBackdrop = styled.button`
  position: fixed;
  inset: 0;
  z-index: 30;
  border: 0;
  background: rgba(16, 24, 32, 0.12);
  cursor: default;
`;

const NotificationPanel = styled.aside`
  position: fixed;
  top: 0;
  right: 0;
  z-index: 31;
  width: min(420px, 100vw);
  height: 100vh;
  border-left: 1px solid #dfe5ea;
  background: #fff;
  box-shadow: -16px 0 36px rgba(16, 24, 32, 0.16);
  display: grid;
  grid-template-rows: auto 1fr;
`;

const NotificationHead = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e5eaee;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const NotificationTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  line-height: 1.2;
  font-weight: 850;
`;

const NotificationActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TextButton = styled.button`
  height: 32px;
  padding: 0 10px;
  border: 1px solid #d6dee4;
  background: #fff;
  color: #172026;
  font-size: 12px;
  font-weight: 850;
  cursor: pointer;

  &:hover {
    background: #eef3f6;
  }

  &:disabled {
    cursor: not-allowed;
    color: #97a3ad;
    background: #f7f9fa;
  }
`;

const NotificationList = styled.div`
  overflow-y: auto;
  padding: 12px;
`;

const NotificationItem = styled.button`
  width: 100%;
  display: grid;
  gap: 8px;
  padding: 14px;
  border: 1px solid ${(props) => (props.$read ? "#e5eaee" : "#f4d36a")};
  background: ${(props) => (props.$read ? "#fff" : "#fff7c7")};
  color: #172026;
  text-align: left;
  cursor: pointer;

  & + & {
    margin-top: 10px;
  }

  &:hover {
    border-color: #b8c4cc;
  }
`;

const NotificationMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: #66737d;
  font-size: 12px;
  font-weight: 750;
`;

const SeverityBadge = styled.span`
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  background: ${(props) => (props.$severity === "danger" ? "#d7263d" : "#f5b700")};
  color: ${(props) => (props.$severity === "danger" ? "#fff" : "#172026")};
  font-size: 11px;
  font-weight: 850;
`;

const NotificationMessage = styled.p`
  margin: 0;
  color: #33414b;
  font-size: 13px;
  line-height: 1.45;
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

export function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M6.5 16.5h11l-1.2-1.6a3 3 0 0 1-.55-1.75V10a4.75 4.75 0 1 0-9.5 0v3.15c0 .63-.19 1.25-.55 1.75L4.5 16.5h2Z" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M10 19a2.2 2.2 0 0 0 4 0" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M10.3 3.6h3.4l.55 2.05c.28.1.55.22.8.37l1.93-1.02l2.4 2.4l-1.03 1.94c.14.25.27.52.37.8l2.08.56v3.39l-2.08.56a7.25 7.25 0 0 1-.37.8l1.03 1.94l-2.4 2.4l-1.93-1.02c-.25.14-.52.27-.8.37l-.55 2.05h-3.4l-.55-2.05a7.45 7.45 0 0 1-.8-.37L6.93 21l-2.4-2.4l1.03-1.94a7.25 7.25 0 0 1-.37-.8L3.1 15.3v-3.39l2.08-.56c.1-.28.22-.55.37-.8L4.52 8.6L6.93 6.2l1.92 1.02c.26-.15.53-.27.8-.37l.56-2.05Z" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2.7" strokeWidth="1.8" />
    </svg>
  );
}

export function TraceLogHeader({ title, copy, summaryCards = [] }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadNotifications = () => {
    setLoading(true);
    getTraceLogNotifications()
      .then((data) => {
        setNotifications(data.notifications ?? []);
        setUnreadCount(data.unreadCount ?? 0);
      })
      .catch(() => {
        setNotifications([]);
        setUnreadCount(0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleOpenNotifications = () => {
    setOpen(true);
    loadNotifications();
  };

  const handleMarkAllRead = () => {
    markAllTraceLogNotificationsRead().then((data) => {
      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    });
  };

  const handleNotificationClick = (notification) => {
    const target = notification.sessionId ? `/tracelog-dashboard/sessions/${notification.sessionId}` : "/tracelog-dashboard";
    markTraceLogNotificationRead(notification.id)
      .then((data) => {
        setNotifications(data.notifications ?? []);
        setUnreadCount(data.unreadCount ?? 0);
      })
      .finally(() => {
        setOpen(false);
        navigate(target);
      });
  };

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

        <HeaderActions>
          <IconButton type="button" aria-label="알림" onClick={handleOpenNotifications}>
            <BellIcon />
            {unreadCount > 0 ? <UnreadDot aria-hidden="true" /> : null}
          </IconButton>
          <IconButton type="button" aria-label="설정">
            <SettingsIcon />
          </IconButton>
        </HeaderActions>
      </HeaderInner>

      {open ? (
        <>
          <NotificationBackdrop type="button" aria-label="알림 닫기" onClick={() => setOpen(false)} />
          <NotificationPanel aria-label="알림 목록">
            <NotificationHead>
              <NotificationTitle>알림</NotificationTitle>
              <NotificationActions>
                <TextButton type="button" onClick={handleMarkAllRead} disabled={unreadCount === 0}>
                  모두 읽음
                </TextButton>
                <TextButton type="button" onClick={() => setOpen(false)}>
                  닫기
                </TextButton>
              </NotificationActions>
            </NotificationHead>

            <NotificationList>
              {loading ? (
                <EmptyState $height="160px">알림을 불러오는 중입니다.</EmptyState>
              ) : notifications.length === 0 ? (
                <EmptyState $height="160px">알림이 없습니다.</EmptyState>
              ) : (
                notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    type="button"
                    $read={notification.read}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <NotificationMeta>
                      <SeverityBadge $severity={notification.severity}>{notification.severityLabel}</SeverityBadge>
                      <span>{formatDateTime(notification.createdAt)}</span>
                    </NotificationMeta>
                    <strong>{notification.title}</strong>
                    <NotificationMessage>{notification.message}</NotificationMessage>
                  </NotificationItem>
                ))
              )}
            </NotificationList>
          </NotificationPanel>
        </>
      ) : null}
    </DashboardHeader>
  );
}
