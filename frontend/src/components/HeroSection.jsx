import styled from "styled-components";
import { Link } from "react-router-dom";
import homeImg from "../assets/homeImg.jpg";

const Hero = styled.section`
  width: 100%;
  background: #111;
`;

const HeroImgWrap = styled.div`
  position: relative;
  width: 100%;
  min-height: clamp(430px, 58vw, 650px);
  overflow: hidden;
`;

const HeroImg = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
`;

const Shade = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(0, 0, 0, 0.48), rgba(0, 0, 0, 0.1) 55%, rgba(0, 0, 0, 0.42));
`;

const Content = styled.div`
  position: relative;
  z-index: 1;
  max-width: 1440px;
  min-height: clamp(430px, 58vw, 650px);
  margin: 0 auto;
  padding: clamp(44px, 7vw, 92px) clamp(22px, 5vw, 72px);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
`;

const HeroTitle = styled.h1`
  max-width: 560px;
  margin: 0;
  color: #fff;
  font-size: clamp(34px, 5vw, 64px);
  line-height: 1.02;
  font-weight: 800;
`;

const HeroSub = styled.p`
  max-width: 480px;
  margin: 16px 0 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: clamp(14px, 1.4vw, 17px);
  line-height: 1.7;
`;

const BtnRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 26px;
`;

const CtaBtn = styled(Link)`
  min-width: 136px;
  height: 44px;
  padding: 0 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #fff;
  background: ${(p) => (p.$dark ? "transparent" : "#fff")};
  color: ${(p) => (p.$dark ? "#fff" : "#111")};
  font-size: 13px;
  font-weight: 800;
  text-decoration: none;

  &:hover {
    background: ${(p) => (p.$dark ? "rgba(255, 255, 255, 0.14)" : "#f2f2f2")};
  }
`;

export default function HeroSection() {
  return (
    <Hero>
      <HeroImgWrap>
        <HeroImg src={homeImg} alt="편안한 데일리 슈즈" />
        <Shade />
        <Content>
          <HeroTitle>매일 신는 편안함을 더 가볍게</HeroTitle>
          <HeroSub>데일리, 출근, 여행까지 자연스럽게 이어지는 슈즈 컬렉션을 만나보세요.</HeroSub>
          <BtnRow>
            <CtaBtn to="/products?gender=men">남성 컬렉션</CtaBtn>
            <CtaBtn to="/products?gender=women" $dark>
              여성 컬렉션
            </CtaBtn>
          </BtnRow>
        </Content>
      </HeroImgWrap>
    </Hero>
  );
}
