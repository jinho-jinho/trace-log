import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";

const SIZE_OPTIONS = [220, 230, 235, 240, 245, 250, 255, 260, 265, 270, 275, 280, 285, 290, 295, 300, 310];

const Page = styled.div`
  background: #fff;
`;

const Container = styled.div`
  max-width: 1440px;
  margin: 0 auto;
  padding: clamp(18px, 3vw, 34px) clamp(18px, 4vw, 56px) 72px;
`;

const PageHead = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 20px;
  align-items: end;
  padding-bottom: 22px;
  border-bottom: 1px solid #e8e8e8;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const Title = styled.h1`
  margin: 0;
  font-size: clamp(28px, 4vw, 44px);
  line-height: 1.1;
  font-weight: 850;
`;

const Tabs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 18px;
`;

const Tab = styled.button`
  height: 36px;
  padding: 0 14px;
  border: 1px solid ${(p) => (p.$active ? "#111" : "#dedede")};
  background: ${(p) => (p.$active ? "#111" : "#fff")};
  color: ${(p) => (p.$active ? "#fff" : "#333")};
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
`;

const SortSelect = styled.select`
  height: 42px;
  min-width: 160px;
  border: 1px solid #d6d6d6;
  background: #fff;
  padding: 0 12px;
  font-size: 13px;
  font-weight: 700;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 230px minmax(0, 1fr);
  gap: clamp(24px, 4vw, 44px);
  margin-top: 30px;

  @media (max-width: 940px) {
    grid-template-columns: 1fr;
  }
`;

const SidePanel = styled.aside`
  display: grid;
  align-content: start;
  gap: 28px;
`;

const FilterBlock = styled.div``;

const FilterTitle = styled.div`
  margin-bottom: 12px;
  font-size: 15px;
  font-weight: 850;
`;

const SizeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 7px;

  @media (max-width: 940px) {
    grid-template-columns: repeat(auto-fit, minmax(62px, 1fr));
  }
`;

const SizeBtn = styled.button`
  height: 34px;
  border: 1px solid ${(p) => (p.$active ? "#111" : "#dcdcdc")};
  background: ${(p) => (p.$active ? "#111" : p.$disabled ? "#fafafa" : "#fff")};
  color: ${(p) => (p.$active ? "#fff" : p.$disabled ? "#b8b8b8" : "#111")};
  font-size: 12px;
  font-weight: 800;
  cursor: ${(p) => (p.$disabled ? "not-allowed" : "pointer")};
`;

const CheckStack = styled.div`
  display: grid;
  gap: 10px;
`;

const CheckRow = styled.label`
  display: flex;
  align-items: center;
  gap: 9px;
  color: #333;
  font-size: 13px;
  cursor: pointer;

  input {
    width: 16px;
    height: 16px;
    accent-color: #111;
  }
`;

const ResetBtn = styled.button`
  width: fit-content;
  border: 0;
  background: transparent;
  padding: 0;
  color: #555;
  font-size: 12px;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
`;

const Main = styled.main`
  min-width: 0;
`;

const ResultLine = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
  color: #555;
  font-size: 13px;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: clamp(18px, 2.4vw, 28px);

  @media (max-width: 1240px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 760px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled(Link)`
  display: block;
  min-width: 0;
  color: inherit;
  text-decoration: none;
  background: #fff;
  border: 1px solid #e8e8e8;
  transition: border-color 140ms ease, transform 140ms ease, box-shadow 140ms ease;

  &:hover {
    border-color: #cfcfcf;
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
  }
`;

const ImgBox = styled.div`
  aspect-ratio: 1 / 1.04;
  background: #f3f2ef;
  display: grid;
  place-items: center;
  overflow: hidden;

  img {
    width: 92%;
    height: 92%;
    object-fit: contain;
    display: block;
  }
`;

const CardBody = styled.div`
  min-height: 132px;
  padding: 14px 15px 16px;
`;

const Name = styled.div`
  min-height: 40px;
  font-size: 13px;
  font-weight: 850;
  line-height: 1.45;
`;

const Sub = styled.div`
  margin-top: 4px;
  min-height: 18px;
  color: #666;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PriceRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 7px;
  margin-top: 10px;
`;

const Discount = styled.span`
  color: #c9342b;
  font-size: 12px;
  font-weight: 850;
`;

const FinalPrice = styled.span`
  font-size: 13px;
  font-weight: 850;
`;

const Original = styled.span`
  color: #999;
  font-size: 12px;
  text-decoration: line-through;
`;

const SizePreview = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 12px;
`;

const SizeChip = styled.span`
  padding: 3px 6px;
  background: #f6f6f6;
  border: 1px solid #e8e8e8;
  color: #555;
  font-size: 10px;
`;

const Empty = styled.div`
  grid-column: 1 / -1;
  min-height: 260px;
  display: grid;
  place-items: center;
  border: 1px solid #e8e8e8;
  background: #fafafa;
  color: #555;
  font-weight: 800;
`;

function safeArray(v) {
  return Array.isArray(v) ? v : [];
}

function isOnSale(p, now = new Date()) {
  if (!p || (p.discountRate ?? 0) <= 0) return false;
  const start = p.saleStart ? new Date(p.saleStart) : null;
  const end = p.saleEnd ? new Date(p.saleEnd) : null;
  return (!start || now >= start) && (!end || now <= end);
}

function formatKRW(n) {
  return `${new Intl.NumberFormat("ko-KR").format(Math.max(0, Math.round(Number(n) || 0)))}원`;
}

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loadingErr, setLoadingErr] = useState("");
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [sortOption, setSortOption] = useState("recommend");
  const [soldMap, setSoldMap] = useState({});
  const location = useLocation();
  const navigate = useNavigate();

  const query = new URLSearchParams(location.search);
  const type = query.get("type") || "all";

  const tabs = useMemo(
    () => [
      { key: "all", label: "전체" },
      { key: "new", label: "신상품" },
      { key: "lifestyle", label: "라이프스타일" },
      { key: "active", label: "액티브" },
      { key: "slipon", label: "슬립온" },
      { key: "sale", label: "세일" },
    ],
    []
  );

  useEffect(() => {
    let mounted = true;

    fetch("/api/products")
      .then(async (res) => {
        if (!res.ok) throw new Error(`상품 조회 실패: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!mounted) return;
        setProducts(Array.isArray(data) ? data : []);
        setLoadingErr("");
      })
      .catch((err) => {
        console.error(err);
        if (!mounted) return;
        setLoadingErr(String(err?.message || err));
        setProducts([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (sortOption !== "sales") return;

    fetch("/api/products/sales")
      .then(async (res) => {
        if (!res.ok) throw new Error(`판매순 조회 실패: ${res.status}`);
        return res.json();
      })
      .then((rows) => {
        const map = {};
        (Array.isArray(rows) ? rows : []).forEach((r) => {
          map[String(r.productId)] = Number(r.quantity || 0);
        });
        setSoldMap(map);
      })
      .catch((e) => {
        console.error(e);
        setSoldMap({});
      });
  }, [sortOption]);

  const materialOptions = useMemo(() => {
    const values = new Set();
    products.forEach((p) => safeArray(p.materials).forEach((m) => values.add(m)));
    const arr = Array.from(values);
    return arr.length ? arr : ["wool", "tree", "foam"];
  }, [products]);

  const availableSizes = useMemo(() => {
    const values = new Set();
    products.forEach((p) => safeArray(p.availableSizes).forEach((s) => values.add(Number(s))));
    return values;
  }, [products]);

  const filteredProducts = useMemo(() => {
    const now = new Date();
    let result = [...products];

    if (type === "new") {
      result = result.filter((p) => {
        const created = p.createdAt ? new Date(p.createdAt) : null;
        if (!created || Number.isNaN(created.getTime())) return false;
        return (now - created) / (1000 * 60 * 60 * 24) <= 30;
      });
    } else if (type === "sale") {
      result = result.filter((p) => isOnSale(p, now));
    } else if (type !== "all") {
      result = result.filter((p) => safeArray(p.categories).includes(type));
    }

    if (selectedSizes.length > 0) {
      result = result.filter((p) => safeArray(p.availableSizes).some((size) => selectedSizes.includes(Number(size))));
    }

    if (selectedMaterials.length > 0) {
      result = result.filter((p) => safeArray(p.materials).some((m) => selectedMaterials.includes(m)));
    }

    result.sort((a, b) => {
      const priceA = (a.basePrice || 0) * (1 - (a.discountRate || 0) / 100);
      const priceB = (b.basePrice || 0) * (1 - (b.discountRate || 0) / 100);
      if (sortOption === "lowPrice") return priceA - priceB;
      if (sortOption === "highPrice") return priceB - priceA;
      if (sortOption === "sales") return (soldMap[String(b._id)] || 0) - (soldMap[String(a._id)] || 0);
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    return result;
  }, [products, selectedSizes, selectedMaterials, sortOption, type, soldMap]);

  const toggleSize = (size) => {
    setSelectedSizes((prev) => (prev.includes(size) ? prev.filter((x) => x !== size) : [...prev, size]));
  };

  const toggleMaterial = (mat) => {
    setSelectedMaterials((prev) => (prev.includes(mat) ? prev.filter((x) => x !== mat) : [...prev, mat]));
  };

  const clearFilters = () => {
    setSelectedSizes([]);
    setSelectedMaterials([]);
  };

  return (
    <Page>
      <Container>
        <PageHead>
          <div>
            <Title>상품 탐색</Title>
            <Tabs aria-label="상품 카테고리">
              {tabs.map((tab) => (
                <Tab key={tab.key} type="button" $active={type === tab.key} onClick={() => navigate(tab.key === "all" ? "/products" : `/products?type=${tab.key}`)}>
                  {tab.label}
                </Tab>
              ))}
            </Tabs>
          </div>
          <SortSelect value={sortOption} onChange={(e) => setSortOption(e.target.value)} aria-label="정렬">
            <option value="recommend">추천순</option>
            <option value="sales">판매순</option>
            <option value="lowPrice">낮은 가격순</option>
            <option value="highPrice">높은 가격순</option>
            <option value="newest">최신 등록순</option>
          </SortSelect>
        </PageHead>

        <ContentGrid>
          <SidePanel>
            <FilterBlock>
              <FilterTitle>사이즈</FilterTitle>
              <SizeGrid>
                {SIZE_OPTIONS.map((size) => {
                  const disabled = availableSizes.size > 0 && !availableSizes.has(size);
                  return (
                    <SizeBtn key={size} type="button" $active={selectedSizes.includes(size)} $disabled={disabled} onClick={() => !disabled && toggleSize(size)}>
                      {size}
                    </SizeBtn>
                  );
                })}
              </SizeGrid>
            </FilterBlock>

            <FilterBlock>
              <FilterTitle>소재</FilterTitle>
              <CheckStack>
                {materialOptions.map((mat) => (
                  <CheckRow key={mat}>
                    <input type="checkbox" checked={selectedMaterials.includes(mat)} onChange={() => toggleMaterial(mat)} />
                    {mat}
                  </CheckRow>
                ))}
              </CheckStack>
            </FilterBlock>

            {(selectedSizes.length > 0 || selectedMaterials.length > 0) && (
              <ResetBtn type="button" onClick={clearFilters}>
                필터 초기화
              </ResetBtn>
            )}
          </SidePanel>

          <Main>
            <ResultLine>
              <span>{filteredProducts.length}개 상품</span>
              {loadingErr && <span>API 연결 실패로 상품을 표시하지 못했습니다.</span>}
            </ResultLine>

            <ProductGrid>
              {filteredProducts.length === 0 && <Empty>조건에 맞는 상품이 없습니다.</Empty>}
              {filteredProducts.map((p) => {
                const base = Number(p.basePrice || 0);
                const rate = Number(p.discountRate || 0);
                const finalPrice = Math.floor(base * (1 - rate / 100));
                const images = safeArray(p.images);
                const hero = images[0] || "/products/placeholder.jpg";
                const sizes = safeArray(p.availableSizes).slice(0, 5);

                return (
                  <Card key={p._id} to={`/products/${p._id}`}>
                    <ImgBox>
                      <img src={hero} alt={p.name} onError={(e) => { e.currentTarget.src = "/products/placeholder.jpg"; }} />
                    </ImgBox>
                    <CardBody>
                      <Name>{p.name}</Name>
                      <Sub>{p.shortDescription || safeArray(p.categories).join(", ")}</Sub>
                      <PriceRow>
                        {rate > 0 && <Discount>{rate}%</Discount>}
                        <FinalPrice>{formatKRW(finalPrice)}</FinalPrice>
                        {rate > 0 && <Original>{formatKRW(base)}</Original>}
                      </PriceRow>
                      <SizePreview>
                        {sizes.map((size) => (
                          <SizeChip key={`${p._id}-${size}`}>{size}</SizeChip>
                        ))}
                      </SizePreview>
                    </CardBody>
                  </Card>
                );
              })}
            </ProductGrid>
          </Main>
        </ContentGrid>
      </Container>
    </Page>
  );
}
