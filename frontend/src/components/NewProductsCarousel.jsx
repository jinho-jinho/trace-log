import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";

import newProduct1 from "../assets/newProduct1.jpg";
import newProduct2 from "../assets/newProduct2.jpg";
import newProduct3 from "../assets/newProduct3.jpg";
import newProduct4 from "../assets/newProduct4.jpg";
import newProduct5 from "../assets/newProduct5.jpg";
import newProduct6 from "../assets/newProduct6.jpg";
import newProduct7 from "../assets/newProduct7.jpg";
import newProduct8 from "../assets/newProduct8.jpg";

const Section = styled.section`
  background: #f6f5f3;
  padding: clamp(48px, 6vw, 72px) 0 42px;
`;

const Inner = styled.div`
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 clamp(18px, 4vw, 56px);
`;

const Title = styled.h2`
  margin: 0 0 22px;
  font-size: clamp(24px, 3vw, 34px);
  font-weight: 800;
`;

const Viewport = styled.div`
  overflow: hidden;
`;

const Track = styled.div`
  display: flex;
  gap: 22px;
  transform: translateX(${(p) => -p.$offset}px);
  transition: transform 260ms ease;
`;

const Card = styled.article`
  flex: 0 0 min(306px, 78vw);
  background: #fff;
  border: 1px solid #e9e9e9;
`;

const Img = styled.div`
  aspect-ratio: 1 / 0.92;
  background: #e9e6de;
  display: grid;
  place-items: center;

  img {
    width: 86%;
    height: 86%;
    object-fit: contain;
    display: block;
  }
`;

const Meta = styled.div`
  min-height: 104px;
  padding: 17px 18px 20px;
`;

const Name = styled.div`
  font-size: 14px;
  font-weight: 800;
  line-height: 1.45;
`;

const Sub = styled.div`
  margin-top: 5px;
  color: #666;
  font-size: 12px;
`;

const Price = styled.div`
  margin-top: 8px;
  font-size: 13px;
  font-weight: 800;
`;

const Dots = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 26px 0 0;
`;

const Dot = styled.button`
  width: 44px;
  height: 3px;
  border: 0;
  background: ${(p) => (p.$active ? "#111" : "#d6d6d6")};
  cursor: pointer;
`;

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

export default function NewProductsCarousel() {
  const items = useMemo(
    () => [
      { id: 1, name: "Wool Runner NZ", sub: "가볍고 포근한 데일리 러너", price: "120,000원", img: newProduct1 },
      { id: 2, name: "Tree Runner Go", sub: "통기성이 좋은 트리 소재", price: "110,000원", img: newProduct2 },
      { id: 3, name: "Wool Cruiser", sub: "출근과 주말에 모두 어울리는 핏", price: "130,000원", img: newProduct3 },
      { id: 4, name: "Runner NZ Mid", sub: "발목을 안정적으로 감싸는 미드컷", price: "120,000원", img: newProduct4 },
      { id: 5, name: "Tree Dasher Relay", sub: "끈 없이 편하게 신는 액티브 슈즈", price: "128,000원", img: newProduct5 },
      { id: 6, name: "Wool Runner Mizzle", sub: "생활 방수 데일리 슈즈", price: "132,000원", img: newProduct6 },
      { id: 7, name: "Trail Runner SWT", sub: "가벼운 트레일과 여행에 적합", price: "140,000원", img: newProduct7 },
      { id: 8, name: "Canvas Pacer", sub: "심플한 캔버스 스타일", price: "98,000원", img: newProduct8 },
    ],
    []
  );

  const viewportRef = useRef(null);
  const [viewportW, setViewportW] = useState(0);
  const [index, setIndex] = useState(0);
  const cardW = Math.min(306, Math.max(240, viewportW * 0.78));
  const gap = 22;

  useEffect(() => {
    if (!viewportRef.current) return undefined;
    const el = viewportRef.current;
    const update = () => setViewportW(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const perView = Math.max(1, Math.floor((viewportW + gap) / (cardW + gap)));
  const pageCount = Math.max(1, items.length - perView + 1);

  useEffect(() => {
    setIndex((i) => clamp(i, 0, pageCount - 1));
  }, [pageCount]);

  const trackW = items.length * cardW + (items.length - 1) * gap;
  const maxOffset = Math.max(0, trackW - viewportW);
  const offset = clamp(index * (cardW + gap), 0, maxOffset);

  return (
    <Section>
      <Inner>
        <Title>새로 나온 상품</Title>
        <Viewport ref={viewportRef}>
          <Track $offset={offset}>
            {items.map((it) => (
              <Card key={it.id}>
                <Img>
                  <img src={it.img} alt={it.name} onError={(e) => { e.currentTarget.src = "/products/placeholder.jpg"; }} />
                </Img>
                <Meta>
                  <Name>{it.name}</Name>
                  <Sub>{it.sub}</Sub>
                  <Price>{it.price}</Price>
                </Meta>
              </Card>
            ))}
          </Track>
        </Viewport>
        <Dots aria-label="신상품 슬라이드">
          {Array.from({ length: pageCount }).map((_, i) => (
            <Dot key={i} type="button" $active={i === index} onClick={() => setIndex(i)} aria-label={`${i + 1}번 슬라이드`} />
          ))}
        </Dots>
      </Inner>
    </Section>
  );
}
