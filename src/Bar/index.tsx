import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

type T_Data = {
  key: string;
  value: number;
};

interface I_BarProps {
  data: T_Data[];
}

export default function Bar({ data }: I_BarProps) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || dimensions.height === 0)
      return;

    const margin = {
      top: dimensions.height * 0.05,
      right: dimensions.width * 0.2,
      bottom: dimensions.height * 0.1,
      left: dimensions.width * 0.1,
    };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous content

    svg
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)
      .attr("viewBox", `0 0 ${dimensions.width} ${dimensions.height}`);

    const chart = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // 색상 스케일 설정
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // xScale 설정
    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.key))
      .range([0, width])
      .padding(0.3);

    // yScale 설정
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value) as number])
      .range([height, 0])
      .nice();

    // 클리핑 패스 추가
    svg
      .append("defs")
      .append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", width)
      .attr("height", height);

    // 줌 기능 추가
    const zoom = d3
      .zoom()
      .scaleExtent([1, 8])
      .extent([
        [0, 0],
        [width, height],
      ])
      .on("zoom", zoomed);

    svg.call(zoom as any);

    function zoomed(event: d3.D3ZoomEvent<SVGSVGElement, unknown>) {
      const newXScale = d3
        .scaleBand()
        .domain(data.map((d) => d.key))
        .range([0, width * event.transform.k])
        .padding(0.3);

      const newYScale = event.transform.rescaleY(yScale);

      // x 축 업데이트
      chart
        .select(".x-axis")
        .attr("transform", `translate(${event.transform.x},${height})`)
        .call(d3.axisBottom(newXScale) as any);

      // y 축 업데이트
      chart
        .select(".y-axis")
        .attr("transform", `translate(${event.transform.x},0)`)
        .call(d3.axisLeft(newYScale) as any);

      // 막대 업데이트
      chart
        .selectAll(".bar")
        .attr("x", (d: any) => (newXScale(d.key) as number) + event.transform.x)
        .attr("width", newXScale.bandwidth())
        .attr("y", (d: any) => newYScale(d.value))
        .attr("height", (d: any) => height - newYScale(d.value));
    }

    // x 축 렌더링
    chart
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    // y 축 렌더링
    chart.append("g").attr("class", "y-axis").call(d3.axisLeft(yScale));

    // bar 그리기
    chart
      .append("g")
      .attr("clip-path", "url(#clip)")
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScale(d.key) as number)
      .attr("width", xScale.bandwidth())
      .attr("y", height) // 처음에는 바닥에서 시작
      .attr("height", 0) // 초기 높이를 0으로 설정
      .transition()
      .duration(1000)
      .ease(d3.easeLinear)
      .attr("y", (d) => yScale(d.value))
      .attr("height", (d) => height - yScale(d.value))
      .attr("fill", (d) => colorScale(d.key) as string);

    // 범례 추가
    const legend = svg
      .append("g")
      .attr("class", "legend")
      .attr(
        "transform",
        `translate(${width + margin.left + 10}, ${margin.top})`,
      );

    legend
      .selectAll(".legend-item")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (_d, i) => `translate(0, ${i * 20})`)
      .each(function (d) {
        const g = d3.select(this);
        g.append("rect")
          .attr("width", 10)
          .attr("height", 10)
          .attr("rx", 10)
          .attr("ry", 10)
          .attr("fill", colorScale(d.key) as string);
        g.append("text")
          .attr("x", 15)
          .attr("y", 6)
          .attr("fill", "white")
          .text(d.key)
          .style("font-size", "12px")
          .attr("alignment-baseline", "middle");
      });
  }, [data, dimensions]);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <svg ref={svgRef} />
    </div>
  );
}
