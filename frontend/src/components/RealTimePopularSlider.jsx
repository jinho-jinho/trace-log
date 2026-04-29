import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";

const Wrap = styled.section`
  background: #fff;
  padding: clamp(42px, 5vw, 64px) 0;
`;

const Inner = styled.div`
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 clamp(18px, 4vw, 56px);
`;

const TitleRow = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 22px;

  @media (max-width: 640px) {
    align-items: flex-start;
    flex-direction: column;
    gap: 14px;
  }
`;

const Title = styled.h2`
  margin: 0;
  font-size: clamp(24px, 3vw, 34px);
  font-weight: 800;
`;

const CategoryRow = styled.div`
  display: inline-flex;
  gap: 6px;
  padding: 4px;
  border: 1px solid #e0e0e0;
  background: #f7f7f7;
`;

const Cat = styled.button`
  min-width: 92px;
  height: 34px;
  border: 0;
  background: ${(p) => (p.$active ? "#111" : "transparent")};
  color: ${(p) => (p.$active ? "#fff" : "#333")};
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
`;

const SliderBox = styled.div`
  position: relative;
`;

const Viewport = styled.div`
  overflow: hidden;
`;

const Track = styled.div`
  display: flex;
  gap: 22px;
  transform: translateX(${(p) => `${p.$x}px`});
  transition: transform 300ms ease;
`;

const Card = styled.div`
  flex: 0 0 244px;
  background: #fff;
  border: 1px solid #e8e8e8;

  @media (min-width: 1280px) {
    flex-basis: 252px;
  }
`;

const Img = styled.div`
  position: relative;
  aspect-ratio: 1 / 0.92;
  background: #f1f0ed;
  display: grid;
  place-items: center;

  img {
    width: 88%;
    height: 88%;
    object-fit: contain;
    display: block;
  }
`;

const NumBadge = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  min-width: 28px;
  height: 28px;
  padding: 0 8px;
  background: #111;
  color: #fff;
  font-size: 12px;
  font-weight: 800;
  display: grid;
  place-items: center;
`;

const Body = styled.div`
  min-height: 142px;
  padding: 15px 16px 18px;
`;

const Name = styled.div`
  min-height: 39px;
  font-size: 13px;
  font-weight: 800;
  line-height: 1.45;
`;

const SubName = styled.div`
  margin-top: 4px;
  min-height: 34px;
  color: #666;
  font-size: 12px;
  line-height: 1.45;
`;

const PriceRow = styled.div`
  margin-top: 10px;
  display: flex;
  align-items: baseline;
  gap: 8px;
`;

const Price = styled.div`
  font-size: 13px;
  font-weight: 800;
`;

const Old = styled.div`
  color: #888;
  font-size: 12px;
  text-decoration: line-through;
`;

const SizeRow = styled.div`
  margin-top: 12px;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const Size = styled.div`
  padding: 5px 7px;
  background: #f5f5f5;
  border: 1px solid #e4e4e4;
  font-size: 11px;
`;

const Arrow = styled.button`
  position: absolute;
  top: 42%;
  transform: translateY(-50%);
  width: 38px;
  height: 38px;
  border-radius: 999px;
  border: 1px solid #dedede;
  background: #fff;
  display: grid;
  place-items: center;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  opacity: ${(p) => (p.$disabled ? 0.35 : 1)};
  cursor: ${(p) => (p.$disabled ? "not-allowed" : "pointer")};
  z-index: 1;
`;

const Left = styled(Arrow)`
  left: -19px;
`;

const Right = styled(Arrow)`
  right: -19px;
`;

function Chevron({ dir = "right" }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
      <path
        d={dir === "left" ? "M14.5 5.5 8.5 12l6 6.5" : "M9.5 5.5 15.5 12l-6 6.5"}
        stroke="#111"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const formatKRW = (n) => `${new Intl.NumberFormat("ko-KR").format(Math.max(0, Math.round(Number(n) || 0)))}원`;

const normCat = (s) =>
  String(s || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/_/g, "-");

function pickCategoryKey(categories = []) {
  const cats = (Array.isArray(categories) ? categories : [categories]).map(normCat);
  if (cats.some((c) => c.includes("slip-on") || c.includes("slipon") || c === "slip")) return "slip";
  return "life";
}

function mapProductToCard(p) {
  const base = Number(p?.basePrice ?? 0);
  const rate = Number(p?.discountRate ?? 0);
  const discounted = rate > 0 ? Math.round(base * (1 - rate / 100)) : base;
  const cats = Array.isArray(p?.categories) ? p.categories : [];

  return {
    id: String(p?._id ?? p?.id ?? crypto.randomUUID()),
    img: p?.images?.[0] || "",
    name: p?.name || "상품명 미정",
    sub: p?.shortDescription || cats.join(", "),
    price: formatKRW(discounted),
    old: rate > 0 ? formatKRW(base) : "",
    sizes: (p?.availableSizes || []).map(String).slice(0, 6),
  };
}

function shuffleOnce(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function RealTimePopularSlider() {
  const viewportRef = useRef(null);
  const [viewportW, setViewportW] = useState(0);
  const [category, setCategory] = useState("life");
  const [start, setStart] = useState(0);
  const [lifeItems, setLifeItems] = useState([]);
  const [slipItems, setSlipItems] = useState([]);

  useEffect(() => {
    if (!viewportRef.current) return undefined;
    const el = viewportRef.current;
    const update = () => setViewportW(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await fetch("/api/products", { credentials: "include" });
        if (!res.ok) throw new Error(`products fetch failed: ${res.status}`);
        const products = await res.json();
        const life = [];
        const slip = [];

        for (const raw of Array.isArray(products) ? products : []) {
          const card = mapProductToCard(raw);
          if (pickCategoryKey(raw?.categories) === "slip") slip.push(card);
          else life.push(card);
        }

        if (!alive) return;
        setLifeItems(shuffleOnce(life));
        setSlipItems(shuffleOnce(slip));
      } catch (e) {
        console.error(e);
        if (!alive) return;
        setLifeItems([]);
        setSlipItems([]);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const items = useMemo(() => (category === "life" ? lifeItems : slipItems), [category, lifeItems, slipItems]);
  const cardW = viewportW >= 1280 ? 252 : 244;
  const gap = 22;
  const visible = Math.max(1, Math.floor((viewportW + gap) / (cardW + gap)));
  const maxStart = Math.max(0, items.length - visible);
  const canPrev = start > 0;
  const canNext = start < maxStart;
  const x = -(start * (cardW + gap));

  useEffect(() => {
    setStart((s) => Math.min(s, maxStart));
  }, [maxStart]);

  const onImgError = (e) => {
    e.currentTarget.src = "/products/placeholder.jpg";
  };

  return (
    <Wrap>
      <Inner>
        <TitleRow>
          <Title>실시간 인기 상품</Title>
          <CategoryRow aria-label="인기 상품 카테고리">
            <Cat type="button" $active={category === "life"} onClick={() => { setCategory("life"); setStart(0); }}>
              라이프스타일
            </Cat>
            <Cat type="button" $active={category === "slip"} onClick={() => { setCategory("slip"); setStart(0); }}>
              슬립온
            </Cat>
          </CategoryRow>
        </TitleRow>

        <SliderBox>
          <Left type="button" $disabled={!canPrev} onClick={() => canPrev && setStart((s) => s - 1)} aria-label="이전">
            <Chevron dir="left" />
          </Left>
          <Right type="button" $disabled={!canNext} onClick={() => canNext && setStart((s) => s + 1)} aria-label="다음">
            <Chevron />
          </Right>

          <Viewport ref={viewportRef}>
            <Track $x={x}>
              {items.map((p, idx) => (
                <Card key={p.id}>
                  <Img>
                    <NumBadge>{idx + 1}</NumBadge>
                    <img src={p.img || "/products/placeholder.jpg"} alt={p.name} onError={onImgError} />
                  </Img>
                  <Body>
                    <Name>{p.name}</Name>
                    <SubName>{p.sub}</SubName>
                    <PriceRow>
                      <Price>{p.price}</Price>
                      {p.old && <Old>{p.old}</Old>}
                    </PriceRow>
                    <SizeRow>
                      {p.sizes.map((s) => (
                        <Size key={`${p.id}-${s}`}>{s}</Size>
                      ))}
                    </SizeRow>
                  </Body>
                </Card>
              ))}
            </Track>
          </Viewport>
        </SliderBox>
      </Inner>
    </Wrap>
  );
}
