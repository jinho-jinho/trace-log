import styled from "styled-components";

import recommendProduct1 from "../assets/recommendProduct1.jpg";
import recommendProduct2 from "../assets/recommendProduct2.jpg";
import recommendProduct3 from "../assets/recommendProduct3.jpg";

const Section = styled.section`
  background: #f6f5f3;
  padding: 42px 0 clamp(58px, 7vw, 88px);
`;

const Inner = styled.div`
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 clamp(18px, 4vw, 56px);
`;

const Title = styled.h2`
  margin: 0 0 24px;
  font-size: clamp(24px, 3vw, 34px);
  font-weight: 800;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(18px, 3vw, 34px);

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.article`
  background: #fff;
  border: 1px solid #e8e8e8;
`;

const Img = styled.div`
  width: 100%;
  aspect-ratio: 4 / 3.55;
  background: #eee;

  img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    object-position: center;
  }
`;

const Body = styled.div`
  min-height: 184px;
  padding: 20px 22px 22px;
  display: flex;
  flex-direction: column;
`;

const Name = styled.div`
  font-size: 18px;
  font-weight: 800;
`;

const Desc = styled.div`
  margin-top: 8px;
  color: #666;
  font-size: 13px;
  line-height: 1.65;
`;

const BtnStack = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: auto;
  padding-top: 18px;
`;

const Btn = styled.button`
  height: 40px;
  border: 1px solid #222;
  background: #fff;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;

  &:hover {
    background: #111;
    color: #fff;
  }
`;

export default function RecommendedProducts() {
  const cards = [
    {
      id: 1,
      name: "Wool Runner NZ",
      desc: "부드러운 울 소재와 안정적인 착화감으로 매일 신기 좋은 러너입니다.",
      img: recommendProduct1,
    },
    {
      id: 2,
      name: "Wool Cruiser Waterproof",
      desc: "비 오는 날에도 부담 없이 신을 수 있는 생활 방수 데일리 슈즈입니다.",
      img: recommendProduct2,
    },
    {
      id: 3,
      name: "Wool Cruiser Slip-on",
      desc: "끈 없이 빠르게 신고 벗을 수 있어 출근과 여행 모두에 적합합니다.",
      img: recommendProduct3,
    },
  ];

  return (
    <Section>
      <Inner>
        <Title>추천 상품</Title>
        <Grid>
          {cards.map((c) => (
            <Card key={c.id}>
              <Img>
                <img src={c.img} alt={c.name} onError={(e) => { e.currentTarget.src = "/products/placeholder.jpg"; }} />
              </Img>
              <Body>
                <Name>{c.name}</Name>
                <Desc>{c.desc}</Desc>
                <BtnStack>
                  <Btn type="button">남성</Btn>
                  <Btn type="button">여성</Btn>
                </BtnStack>
              </Body>
            </Card>
          ))}
        </Grid>
      </Inner>
    </Section>
  );
}
