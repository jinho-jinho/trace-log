import { useState } from "react";
import styled from "styled-components";

import newsLetter1 from "../assets/newsLetter1.jpg";
import newsLetter2 from "../assets/newsLetter2.jpg";
import newsLetter3 from "../assets/newsLetter3.jpg";

const Section = styled.section`
  background: #f6f5f3;
  padding: clamp(58px, 7vw, 88px) 0;
`;

const Inner = styled.div`
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 clamp(18px, 4vw, 56px);
`;

const Content = styled.div`
  max-width: 720px;
  margin: 0 auto;
  text-align: center;
`;

const Title = styled.h2`
  margin: 0;
  font-size: clamp(26px, 3vw, 38px);
  font-weight: 800;
  line-height: 1.2;
`;

const Sub = styled.p`
  margin: 12px 0 0;
  color: #666;
  font-size: 14px;
  line-height: 1.7;
`;

const Form = styled.form`
  margin-top: 28px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 86px;
  gap: 10px;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const Input = styled.input`
  height: 46px;
  border: 1px solid #d4d4d4;
  padding: 0 14px;
  font-size: 14px;
  outline: none;

  &:focus {
    border-color: #111;
  }
`;

const Button = styled.button`
  height: 46px;
  border: 1px solid #111;
  background: #111;
  color: #fff;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
`;

const Notice = styled.div`
  margin-top: 12px;
  color: #777;
  font-size: 11px;
  line-height: 1.6;

  a {
    color: inherit;
    text-underline-offset: 2px;
  }
`;

const Grid = styled.div`
  margin-top: clamp(42px, 5vw, 60px);
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(18px, 3vw, 34px);

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.article``;

const Img = styled.div`
  aspect-ratio: 4 / 2.75;
  background: #eee;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const Head = styled.div`
  margin-top: 16px;
  font-size: 17px;
  font-weight: 800;
`;

const Desc = styled.div`
  margin-top: 8px;
  color: #666;
  font-size: 13px;
  line-height: 1.75;
`;

export default function NewsletterSection() {
  const [email, setEmail] = useState("");

  const cards = [
    {
      id: 1,
      img: newsLetter1,
      head: "매일 경험하는 편안함",
      desc: "가벼운 소재와 부드러운 착화감으로 일상 속 움직임을 자연스럽게 이어갑니다.",
    },
    {
      id: 2,
      img: newsLetter2,
      head: "지속가능한 선택",
      desc: "소재 선택부터 제작 과정까지 더 낮은 환경 부담을 목표로 제품을 만듭니다.",
    },
    {
      id: 3,
      img: newsLetter3,
      head: "자연에서 온 소재",
      desc: "울, 트리 파이버, 식물 기반 폼처럼 편안함과 책임감을 함께 고려한 소재를 사용합니다.",
    },
  ];

  return (
    <Section>
      <Inner>
        <Content>
          <Title>새로운 소식 받아보기</Title>
          <Sub>신상품, 프로모션, 브랜드 소식을 이메일로 가장 먼저 확인하세요.</Sub>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              setEmail("");
            }}
          >
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button type="submit">구독</Button>
          </Form>
          <Notice>
            구독 시 마케팅 이메일 수신에 동의합니다. 자세한 내용은 <a href="/privacy">개인정보 처리방침</a>과{" "}
            <a href="/terms">이용약관</a>을 확인해 주세요.
          </Notice>
        </Content>

        <Grid>
          {cards.map((c) => (
            <Card key={c.id}>
              <Img>
                <img src={c.img} alt={c.head} />
              </Img>
              <Head>{c.head}</Head>
              <Desc>{c.desc}</Desc>
            </Card>
          ))}
        </Grid>
      </Inner>
    </Section>
  );
}
