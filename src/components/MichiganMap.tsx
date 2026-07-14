import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { motion, AnimatePresence } from 'motion/react';
import { School, MapPin, Info, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { useLocations } from '../hooks/useLocalData';
import type { Location } from '../hooks/useLocalData';

export default function MichiganMap() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [hoveredLocation, setHoveredLocation] = useState<Location | null>(null);
  const locations = useLocations();

  useEffect(() => {
    if (!svgRef.current || locations.length === 0) return;

    const width = 800;
    const height = 600;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Zoom the view to the schools themselves (all within ~7 miles of
    // Okemos) instead of the whole state — at state scale the 9 pins
    // collapse into one unreadable blob.
    const pointsGeo = {
      type: 'FeatureCollection',
      features: locations.map((l) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [l.lng, l.lat] },
        properties: {},
      })),
    } as any;

    const projection = d3.geoMercator().fitExtent(
      [[90, 80], [width - 90, height - 80]],
      pointsGeo,
    );
    const path = d3.geoPath().projection(projection);

    const geoGroup = svg.append("g");

    // Pins + labels are drawn whether or not the geography loads
    const drawPins = () => {
      const pointsGroup = svg.append("g");

      // Labels point AWAY from the cluster's center so the tightly-packed
      // Okemos schools don't overlap each other's names.
      const projected = locations
        .map((loc) => ({ loc, coords: projection([loc.lng, loc.lat]) }))
        .filter((p): p is { loc: Location; coords: [number, number] } => p.coords !== null);
      const meanX = projected.reduce((s, p) => s + p.coords[0], 0) / (projected.length || 1);

      projected.forEach(({ loc, coords }) => {
        const [cx, cy] = coords;
        const isHome = loc.name === 'Okemos High School';
        const onLeft = cx < meanX;

        // Pulse ring (purely decorative — no event listeners)
        const ring = pointsGroup.append("circle")
          .attr("cx", cx).attr("cy", cy)
          .attr("r", 8)
          .attr("fill", "none")
          .attr("stroke", isHome ? "#e8b84b" : "#c0392b")
          .attr("stroke-width", 1.5)
          .attr("opacity", 0.6);

        (function animateRing() {
          ring.transition().duration(1400)
            .attr("r", 22).attr("opacity", 0)
            .transition().duration(0)
            .attr("r", 8).attr("opacity", 0.6)
            .on("end", animateRing);
        })();

        pointsGroup.append("text")
          .attr("x", cx + (onLeft ? -16 : 16))
          .attr("y", cy + 4)
          .attr("text-anchor", onLeft ? "end" : "start")
          .attr("fill", "rgba(255,255,255,0.85)")
          .attr("stroke", "#141516")
          .attr("stroke-width", 4)
          .attr("paint-order", "stroke")
          .attr("font-size", 12)
          .attr("font-weight", 700)
          .attr("class", "pointer-events-none select-none")
          .text(loc.name);

        // Main interactive dot (no CSS hover — D3 handles it)
        pointsGroup.append("circle")
          .datum(loc)
          .attr("cx", cx).attr("cy", cy)
          .attr("r", isHome ? 10 : 8)
          .attr("fill", "#c0392b")
          .attr("stroke", isHome ? "#e8b84b" : "rgba(255,255,255,0.9)")
          .attr("stroke-width", isHome ? 3.5 : 2.5)
          .attr("class", "cursor-pointer")
          .on("mouseenter", function (event, d) {
            d3.select(this).transition().duration(150).attr("r", isHome ? 15 : 13);
            setHoveredLocation(d);
          })
          .on("mouseleave", function () {
            d3.select(this).transition().duration(150).attr("r", isHome ? 10 : 8);
            setHoveredLocation(null);
          })
          .on("click", (event, d) => setSelectedLocation(d));
      });
    };

    // Local geography: Michigan county outlines for context, plus a tiny
    // state inset so visitors still know where they are in Michigan.
    d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json")
      .then((us: any) => {
        const counties = (topojson.feature(us, us.objects.counties) as any).features
          .filter((f: any) => String(f.id).startsWith("26")); // Michigan FIPS
        const michigan = (topojson.feature(us, us.objects.states) as any).features
          .find((f: any) => f.properties.name === "Michigan");

        geoGroup.selectAll("path")
          .data(counties)
          .enter()
          .append("path")
          .attr("d", path as any)
          .attr("fill", "#1a1c1d")
          .attr("stroke", "rgba(255,255,255,0.1)")
          .attr("stroke-width", 1.5);

        // Mini Michigan inset, top-left, with a gold dot marking this area
        if (michigan) {
          const inset = svg.append("g").attr("transform", "translate(28, 24)");
          const insetProj = d3.geoMercator().fitSize([110, 110], michigan);
          inset.append("path")
            .datum(michigan)
            .attr("d", d3.geoPath().projection(insetProj) as any)
            .attr("fill", "rgba(255,255,255,0.06)")
            .attr("stroke", "rgba(255,255,255,0.25)")
            .attr("stroke-width", 1);
          const here = insetProj([-84.44, 42.72]);
          if (here) {
            inset.append("circle")
              .attr("cx", here[0]).attr("cy", here[1])
              .attr("r", 4.5)
              .attr("fill", "#e8b84b")
              .attr("stroke", "#141516")
              .attr("stroke-width", 1.5);
            inset.append("text")
              .attr("x", here[0] + 9).attr("y", here[1] + 4)
              .attr("fill", "rgba(255,255,255,0.6)")
              .attr("font-size", 10)
              .attr("font-weight", 700)
              .text("You are here");
          }
        }

        drawPins();
      })
      .catch((err) => {
        console.error("Error loading map geography:", err);
        drawPins(); // schools still render on the plain background
      });

  }, [locations]);

  return (
    <>
      {/* Mobile: simple location cards */}
      <div className="sm:hidden space-y-4">
        {locations.map(loc => (
          <div key={loc.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-apple/20 rounded-xl flex items-center justify-center shrink-0">
                <School size={16} className="text-apple" />
              </div>
              <div>
                <div className="font-serif font-bold leading-tight">{loc.name}</div>
                <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                  <MapPin size={10} className="text-apple" />{loc.district}
                </div>
              </div>
              <div className="ml-auto text-right">
                <div className="text-pencil font-serif font-bold text-lg leading-none">{loc.amount}</div>
                <div className="text-[9px] text-white/30 uppercase tracking-widest mt-0.5">raised</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {loc.projects.map(p => (
                <span key={p} className="px-2 py-1 bg-apple/10 text-apple text-[9px] font-bold rounded-lg border border-apple/10">{p}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: interactive D3 map */}
      <div className="hidden sm:block relative w-full max-w-5xl mx-auto aspect-video bg-chalkboard rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl">
        <svg
          ref={svgRef}
          viewBox="0 0 800 600"
          className="w-full h-full"
        />

        {/* Hover hint — names are on the map now; show the district */}
        <AnimatePresence>
          {hoveredLocation && !selectedLocation && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute pointer-events-none bg-white/95 backdrop-blur-xl text-chalkboard px-4 py-3 rounded-2xl shadow-2xl border border-white/20 z-20 bottom-8 right-8"
            >
              <div className="font-serif font-bold text-base leading-tight">{hoveredLocation.name}</div>
              <div className="text-[10px] font-bold text-muted uppercase tracking-widest mt-0.5">{hoveredLocation.district} · click for details</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected Location Details */}
        <AnimatePresence>
          {selectedLocation && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="absolute top-4 right-4 bottom-4 w-72 bg-white/95 backdrop-blur-2xl text-chalkboard p-5 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.3)] z-30 flex flex-col border border-white/20"
            >
              <button
                onClick={() => setSelectedLocation(null)}
                className="absolute top-4 right-4 p-2 hover:bg-chalkboard/5 rounded-full transition-colors"
              >
                <X size={18} />
              </button>

              <div className="w-10 h-10 bg-apple/10 text-apple rounded-xl flex items-center justify-center mb-3 shadow-sm">
                <School size={20} />
              </div>

              <h3 className="text-lg font-serif font-bold mb-1 leading-tight pr-6">{selectedLocation.name}</h3>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted uppercase tracking-widest mb-3">
                <MapPin size={12} className="text-apple" />
                <span>{selectedLocation.district}</span>
              </div>

              <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Students', value: selectedLocation.demographics.students },
                    { label: 'Low Income', value: selectedLocation.demographics.lowIncome },
                    { label: 'Diversity', value: selectedLocation.demographics.diversity }
                  ].map(stat => (
                    <div key={stat.label} className="bg-chalkboard/[0.03] p-2 rounded-xl text-center border border-chalkboard/5">
                      <div className="text-[7px] uppercase font-bold text-muted tracking-widest mb-0.5">{stat.label}</div>
                      <div className="text-[11px] font-bold font-mono">{stat.value}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-pencil/10 p-4 rounded-2xl border border-pencil/20">
                  <div className="text-[9px] uppercase tracking-[0.2em] font-bold text-ink mb-1">Impact</div>
                  <p className="text-xs leading-relaxed font-light italic">"{selectedLocation.impact}"</p>
                </div>

                <div>
                  <div className="text-[9px] uppercase tracking-[0.2em] font-bold text-muted mb-2">Initiatives</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedLocation.projects.map(p => (
                      <span key={p} className="px-2 py-1 bg-apple/5 text-apple text-[9px] font-bold rounded-lg border border-apple/10">{p}</span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-chalkboard text-white rounded-2xl">
                  <div>
                    <div className="text-[9px] uppercase tracking-[0.2em] font-bold text-white/50 mb-0.5">Grant Total</div>
                    <div className="text-xl font-serif font-bold text-pencil">{selectedLocation.amount}</div>
                  </div>
                  <Info size={18} className="text-white/30" />
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedLocation(null);
                  document.getElementById('stories')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="mt-3 w-full bg-apple text-white py-3 rounded-xl font-bold text-sm hover:bg-apple/90 transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              >
                View School Stories
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Legend */}
        <div className="absolute top-6 right-6 bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-3xl text-white/80 text-xs shadow-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-4 h-4 bg-apple rounded-full animate-pulse shadow-[0_0_10px_rgba(192,57,43,0.5)]" />
            <span className="font-bold tracking-widest uppercase text-[10px]">Supported School</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-apple rounded-full ring-2 ring-pencil" />
            <span className="font-bold tracking-widest uppercase text-[10px]">Home Base — Okemos High</span>
          </div>
        </div>
      </div>
    </>
  );
}
