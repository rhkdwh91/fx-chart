import { useEffect, useRef } from "react";
import * as d3 from "d3";

type T_Data = {
  name: string;
  value: number;
};

interface I_BarProps {
  data: T_Data[];
}

export default function Bar({ data }: I_BarProps) {
  const margin = { top: 0, right: 100, bottom: 30, left: 100 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;
  const svgRef = useRef<SVGSVGElement | null>(null);
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`);

    // xScale 설정
    const xScale = d3
      .scaleBand() // 지정된 domain 및 range 를 사용하여 패딩, 반올림 및 중앙 정렬 없이 새로운 band scale 을 구성한다.
      .domain(data?.map((d) => d.name))
      .range([margin.left, width - margin.right])
      .padding(0.3);

    // yScale 설정
    const yScale = d3
      .scaleLinear() // 선형 척도를 생성한다.
      // d3.min(...[]) iterable 에서 최소값 반환
      // d3.min(data, (d) => d.value) Array.from 을 호출하는 것과 유사한 접근자 함수 지정 가능
      // Math.min 과 달리 입력을 숫자로 강제하지 않음
      .domain([0, d3.max(data, (d) => d.value)] as [number, number])
      // 아래좌표부터 위좌표
      .range([height - margin.bottom, margin.top])
      // 도메인의 최소값과 최대값을 가장 가까운 반올림 값으로 확장시킨다.
      // 도메인에 3개 이상의 값이 있는 경우 첫 번째 값과 마지막 값만 확장시킨다.
      // 인수로 count 를 전달하면 반올림 값으로 확장시키는 크기를 제어할수 있다.
      .nice();

    // x 축 렌더링
    const xAxis = (g: d3.Selection<SVGGElement, unknown, null, undefined>) =>
      g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));

    svg.append<SVGGElement>("g").call(xAxis);

    // y 축 렌더링
    const yAxis = (g: d3.Selection<SVGGElement, unknown, null, undefined>) =>
      g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale));

    svg.append<SVGGElement>("g").call(yAxis);

    // bar 그리기
    svg
      .append<SVGGElement>("g")
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (data) => xScale(data.name) as number)
      .attr("y", (data) => yScale(data.value))
      .attr("width", xScale.bandwidth())
      .attr("height", (data) => yScale(0) - yScale(data.value))
      .attr("fill", "#e5e7eb")
      .attr("ry", 10);
  }, [data, height, margin, width]);

  return (
    <div>
      <svg
        ref={svgRef}
        style={{ padding: "100px" }}
        width={width + margin.left + margin.right}
        height={height + margin.top + margin.bottom}
      />
    </div>
  );
}
