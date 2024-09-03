import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

type T_Data = {
  key: string;
  value: number;
};

interface I_PieProps {
  data: T_Data[];
  isDoughnut?: boolean;
}

export default function Pie({ data, isDoughnut = false }: I_PieProps) {
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
      bottom: dimensions.height * 0.05,
      left: dimensions.width * 0.05,
    };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;
    const radius = Math.min(width, height) / 2;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous content

    svg
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)
      .attr("viewBox", `0 0 ${dimensions.width} ${dimensions.height}`);

    const chart = svg
      .append("g")
      .attr(
        "transform",
        `translate(${width / 2 + margin.left},${height / 2 + margin.top})`,
      );

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    const pie = d3
      .pie<T_Data>()
      .value((d) => d.value)
      .sort(null);

    const arc = d3
      .arc<d3.PieArcDatum<T_Data>>()
      .innerRadius(isDoughnut ? radius * 0.5 : 0)
      .outerRadius(radius);

    const arcs = chart
      .selectAll(".arc")
      .data(pie(data))
      .enter()
      .append("g")
      .attr("class", "arc");

    arcs
      .append("path")
      .attr("d", arc)
      .attr("fill", (d) => colorScale(d.data.key) as string)
      .attr("stroke", "white")
      .style("stroke-width", "2px")
      .transition()
      .duration(1000)
      .attrTween("d", function (d) {
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return function (t: number): string {
          return arc(interpolate(t)) || "";
        };
      });

    // Add labels
    arcs
      .append("text")
      .attr("transform", (d) => `translate(${arc.centroid(d)})`)
      .attr("dy", ".35em")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "white")
      .text((d) => d.data.key);

    // Add legend
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
  }, [data, dimensions, isDoughnut]);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <svg ref={svgRef} />
    </div>
  );
}
