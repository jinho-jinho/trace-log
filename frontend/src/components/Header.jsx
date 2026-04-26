import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import logoImg from "../assets/AllbirdsLogo.jpg";
import { readApiResponse } from "../utils/apiResponse.js";

const HeaderWrap = styled.header`
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(255, 255, 255, 0.96);
  border-bottom: 1px solid #e8e8e8;
  backdrop-filter: blur(12px);
`;

const TopBar = styled.div`
  min-height: 34px;
  padding: 7px 20px;
  background: #141414;
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
`;

const MainBar = styled.div`
  max-width: 1440px;
  min-height: 72px;
  margin: 0 auto;
  padding: 0 clamp(18px, 4vw, 56px);
  display: grid;
  grid-template-columns: minmax(136px, 0.7fr) minmax(360px, 1.8fr) minmax(136px, 0.7fr);
  align-items: center;
  column-gap: 24px;

  @media (max-width: 860px) {
    grid-template-columns: 1fr auto;
    row-gap: 10px;
    padding-top: 12px;
    padding-bottom: 12px;
  }
`;

const Logo = styled(Link)`
  display: inline-flex;
  align-items: center;
  width: fit-content;
  text-decoration: none;

  img {
    width: auto;
    height: 38px;
    display: block;
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(22px, 3.2vw, 48px);
  min-width: 0;
  font-size: 14px;
  color: #111;

  @media (max-width: 860px) {
    grid-column: 1 / -1;
    grid-row: 2;
    justify-content: flex-start;
    gap: 20px;
    overflow-x: auto;
    padding: 2px 0 4px;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

const NavItem = styled.div`
  position: relative;
  flex: 0 0 auto;
  padding: 12px 0;
`;

const NavLink = styled(Link)`
  position: relative;
  color: inherit;
  text-decoration: none;
  font-weight: 700;
  opacity: ${(p) => (p.$active ? 1 : 0.74)};
  white-space: nowrap;

  &::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: -8px;
    height: 2px;
    background: #111;
    transform: scaleX(${(p) => (p.$active ? 1 : 0)});
    transform-origin: center;
    transition: transform 160ms ease;
  }

  &:hover {
    opacity: 1;
  }

  &:hover::after {
    transform: scaleX(1);
  }
`;

const IconRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  align-items: center;
`;

const IconBtn = styled.button`
  width: 38px;
  height: 38px;
  border: 1px solid transparent;
  border-radius: 999px;
  background: transparent;
  padding: 0;
  cursor: pointer;
  position: relative;
  display: grid;
  place-items: center;

  svg {
    width: 19px;
    height: 19px;
    stroke: #111;
  }

  &:hover {
    border-color: #dcdcdc;
    background: #f7f7f7;
  }
`;

const CartBadge = styled.span`
  position: absolute;
  top: 2px;
  right: 1px;
  min-width: 17px;
  height: 17px;
  padding: 0 4px;
  border-radius: 999px;
  background: #111;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  display: grid;
  place-items: center;
`;

const Mega = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  top: 106px;
  display: ${(p) => (p.$open ? "block" : "none")};
  background: #fff;
  border-top: 1px solid #ededed;
  box-shadow: 0 22px 44px rgba(0, 0, 0, 0.1);
  padding: 34px clamp(22px, 6vw, 80px) 40px;

  @media (max-width: 860px) {
    top: 142px;
    padding: 24px 20px;
  }
`;

const MegaInner = styled.div`
  max-width: 1240px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.1fr 1.1fr 0.8fr;
  gap: clamp(28px, 5vw, 76px);
  align-items: start;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
`;

const MegaTitle = styled.div`
  margin-bottom: 16px;
  color: #111;
  font-size: clamp(22px, 2.4vw, 32px);
  font-weight: 800;
  letter-spacing: -0.02em;
`;

const MegaList = styled.div`
  display: grid;
  gap: 11px;
  padding-left: 18px;
  border-left: 2px solid #202020;
`;

const MegaItem = styled(Link)`
  width: fit-content;
  color: #222;
  text-decoration: none;
  font-size: 14px;
  line-height: 1.35;
  opacity: 0.78;

  &:hover {
    opacity: 1;
    text-decoration: underline;
    text-underline-offset: 4px;
  }
`;

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" strokeWidth="1.7" />
      <path d="M20 20L16.7 16.7" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" strokeWidth="1.7" />
      <path d="M4 20c1.8-3 4.4-4.5 8-4.5S18.2 17 20 20" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M6 8h12l-1 13H7L6 8Z" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M9 8a3 3 0 0 1 6 0" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export default function Header() {
  const [openKey, setOpenKey] = useState(null);
  const [me, setMe] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount, openCart, fetchCart } = useCart();

  useEffect(() => {
    let active = true;

    async function fetchMe() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!active) return;
        if (!res.ok) {
          setMe(null);
          return;
        }
        const data = await readApiResponse(res);
        if (active) setMe(data.user || null);
      } catch {
        if (active) setMe(null);
      }
    }

    fetchMe();
    return () => {
      active = false;
    };
  }, [location.pathname]);

  const navItems = useMemo(
    () => [
      { key: "new", label: "신상품", to: "/products?type=new" },
      { key: "men", label: "남성", to: "/products?gender=men" },
      { key: "women", label: "여성", to: "/products?gender=women" },
      { key: "sale", label: "세일", to: "/products?type=sale" },
      { key: "sustain", label: "브랜드", to: "/sustainability", mega: true },
    ],
    []
  );

  const handleAccountClick = () => {
    if (!me) {
      navigate("/login");
      return;
    }
    navigate(me.role === "admin" ? "/admin/select" : "/my/profile");
  };

  const handleCartClick = () => {
    fetchCart();
    openCart();
  };

  return (
    <HeaderWrap onMouseLeave={() => setOpenKey(null)} aria-label="site header">
      <TopBar>가볍고 편안한 데일리 슈즈, 전 상품 무료 배송</TopBar>
      <MainBar>
        <Logo to="/">
          <img src={logoImg} alt="TraceLog" />
        </Logo>

        <Nav aria-label="main navigation">
          {navItems.map((it) => (
            <NavItem key={it.key} onMouseEnter={() => setOpenKey(it.mega ? it.key : null)}>
              <NavLink to={it.to} $active={location.pathname + location.search === it.to}>
                {it.label}
              </NavLink>

              {it.key === "sustain" && (
                <Mega $open={openKey === "sustain"}>
                  <MegaInner>
                    <div>
                      <MegaTitle>브랜드</MegaTitle>
                      <MegaList>
                        <MegaItem to="/brand-story">브랜드 스토리</MegaItem>
                        <MegaItem to="/sustainability">지속가능성</MegaItem>
                        <MegaItem to="/materials">소재 이야기</MegaItem>
                      </MegaList>
                    </div>
                    <div>
                      <MegaTitle>컬렉션</MegaTitle>
                      <MegaList>
                        <MegaItem to="/products?type=lifestyle">라이프스타일</MegaItem>
                        <MegaItem to="/products?type=slipon">슬립온</MegaItem>
                        <MegaItem to="/products?type=active">액티브</MegaItem>
                      </MegaList>
                    </div>
                    <div>
                      <MegaTitle>고객 지원</MegaTitle>
                      <MegaList>
                        <MegaItem to="/my/orders">주문 내역</MegaItem>
                        <MegaItem to="/stores">매장 위치</MegaItem>
                      </MegaList>
                    </div>
                  </MegaInner>
                </Mega>
              )}
            </NavItem>
          ))}
        </Nav>

        <IconRow>
          <IconBtn type="button" aria-label="검색">
            <SearchIcon />
          </IconBtn>
          <IconBtn type="button" onClick={handleAccountClick} aria-label="계정">
            <UserIcon />
          </IconBtn>
          <IconBtn type="button" onClick={handleCartClick} aria-label="장바구니">
            <BagIcon />
            {cartCount > 0 && <CartBadge>{cartCount > 99 ? "99+" : cartCount}</CartBadge>}
          </IconBtn>
        </IconRow>
      </MainBar>
    </HeaderWrap>
  );
}
