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
    if (!svgRef.current) return;

    const width = 800;
    const height = 600;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const projection = d3.geoAlbers()
      .center([0, 44.5])
      .rotate([85.5, 0])
      .parallels([42, 46])
      .scale(6000)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json")
      .then((us: any) => {
        const states = topojson.feature(us, us.objects.states) as any;
        const michigan = states.features.find((f: any) => f.properties.name === "Michigan");
        
        if (!michigan) throw new Error("Michigan not found in map data");

        // Map background
        svg.append("g")
          .selectAll("path")
          .data([michigan])
          .enter()
          .append("path")
          .attr("d", path)
          .attr("fill", "#1a1c1d")
          .attr("stroke", "rgba(255,255,255,0.1)")
          .attr("stroke-width", 1.5)
          .attr("class", "transition-colors duration-500")
          .on("mouseover", function() {
            d3.select(this).attr("fill", "#242728");
          })
          .on("mouseout", function() {
            d3.select(this).attr("fill", "#1a1c1d");
          });

        // Add points — separate pulse ring + interactive dot to avoid D3/CSS conflicts
        const pointsGroup = svg.append("g");

        locations.forEach(loc => {
          const coords = projection([loc.lng, loc.lat]);
          if (!coords) return;
          const [cx, cy] = coords;

          // Pulse ring (purely decorative — no event listeners)
          const ring = pointsGroup.append("circle")
            .attr("cx", cx).attr("cy", cy)
            .attr("r", 8)
            .attr("fill", "none")
            .attr("stroke", "#c0392b")
            .attr("stroke-width", 1.5)
            .attr("opacity", 0.6);

          (function animateRing() {
            ring.transition().duration(1400)
              .attr("r", 22).attr("opacity", 0)
              .transition().duration(0)
              .attr("r", 8).attr("opacity", 0.6)
              .on("end", animateRing);
          })();

          // Main interactive dot (no CSS hover — D3 handles it)
          pointsGroup.append("circle")
            .datum(loc)
            .attr("cx", cx).attr("cy", cy)
            .attr("r", 8)
            .attr("fill", "#c0392b")
            .attr("stroke", "rgba(255,255,255,0.9)")
            .attr("stroke-width", 2.5)
            .attr("class", "cursor-pointer")
            .on("mouseenter", function(event, d) {
              d3.select(this).transition().duration(150).attr("r", 13).attr("stroke-width", 3);
              setHoveredLocation(d);
            })
            .on("mouseleave", function() {
              d3.select(this).transition().duration(150).attr("r", 8).attr("stroke-width", 2.5);
              setHoveredLocation(null);
            })
            .on("click", (event, d) => setSelectedLocation(d));
        });
      })
      .catch(err => {
        console.error("Error loading map:", err);
      });

  }, [locations]);

  return (
    <div className="relative w-full max-w-5xl mx-auto aspect-video bg-chalkboard rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl">
      <svg
        ref={svgRef}
        viewBox="0 0 800 600"
        className="w-full h-full"
      />

      {/* Hover Tooltip */}
      <AnimatePresence>
        {hoveredLocation && !selectedLocation && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute pointer-events-none bg-white/95 backdrop-blur-xl text-chalkboard p-5 rounded-2xl shadow-2xl border border-white/20 z-20 min-w-[200px]"
            style={{ 
              left: hoveredLocation.lng > -85 ? '65%' : '25%',
              top: '15%'
            }}
          >
            <div className="font-serif font-bold text-lg leading-tight mb-1">{hoveredLocation.name}</div>
            <div className="text-[10px] font-bold text-muted uppercase tracking-widest">{hoveredLocation.district}</div>
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
      <div className="absolute bottom-8 left-8 bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl text-white/80 text-xs shadow-2xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-4 h-4 bg-apple rounded-full animate-pulse shadow-[0_0_10px_rgba(192,57,43,0.5)]" />
          <span className="font-bold tracking-widest uppercase text-[10px]">Funded School</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-white/20 rounded-full" />
          <span className="font-bold tracking-widest uppercase text-[10px]">Pending Application</span>
        </div>
      </div>
    </div>
  );
}
