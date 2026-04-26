import styled from "styled-components";

import productMaterial1 from "../assets/productMaterial1.jpg";
import productMaterial2 from "../assets/productMaterial2.jpg";
import productMaterial3 from "../assets/productMaterial3.jpg";

const Section = styled.section`
  background: #fff;
  padding: clamp(58px, 7vw, 86px) 0;
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
  border: 1px solid #e8e8e8;
  background: #fff;
`;

const Img = styled.div`
  aspect-ratio: 4 / 2.75;
  background: #e9e6de;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const Body = styled.div`
  min-height: 148px;
  padding: 20px 22px 22px;
  display: flex;
  flex-direction: column;
`;

const Small = styled.div`
  color: #666;
  font-size: 12px;
`;

const Head = styled.div`
  margin-top: 8px;
  font-size: 17px;
  font-weight: 800;
  line-height: 1.45;
`;

const Btn = styled.button`
  margin-top: auto;
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

export default function MaterialsSection() {
  const cards = [
    {
      id: 1,
      small: "ZQ 메리노 울",
      head: "부드럽고 따뜻한 천연 소재",
      img: productMaterial1,
    },
    {
      id: 2,
      small: "유칼립투스 트리 파이버",
      head: "가볍고 시원한 착화감",
      img: productMaterial2,
    },
    {
      id: 3,
      small: "SweetFoam",
      head: "편안한 쿠션감을 위한 밑창 소재",
      img: productMaterial3,
    },
  ];

  return (
    <Section>
      <Inner>
        <Title>우리가 사용하는 소재</Title>
        <Grid>
          {cards.map((c) => (
            <Card key={c.id}>
              <Img>
                <img src={c.img} alt={c.head} />
              </Img>
              <Body>
                <Small>{c.small}</Small>
                <Head>{c.head}</Head>
                <Btn type="button">소재 알아보기</Btn>
              </Body>
            </Card>
          ))}
        </Grid>
      </Inner>
    </Section>
  );
}
