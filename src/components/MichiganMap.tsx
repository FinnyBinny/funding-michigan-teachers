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

        // Add points
        const points = svg.append("g")
          .selectAll("circle")
          .data(locations)
          .enter()
          .append("circle")
          .attr("cx", d => projection([d.lng, d.lat])![0])
          .attr("cy", d => projection([d.lng, d.lat])![1])
          .attr("r", 7)
          .attr("fill", "#c0392b")
          .attr("stroke", "rgba(255,255,255,0.8)")
          .attr("stroke-width", 2)
          .attr("class", "cursor-pointer transition-all duration-300 hover:scale-150")
          .on("mouseenter", (event, d) => setHoveredLocation(d))
          .on("mouseleave", () => setHoveredLocation(null))
          .on("click", (event, d) => setSelectedLocation(d));

        // Pulsing effect for points
        function pulse() {
          points.transition()
            .duration(1500)
            .attr("r", 9)
            .attr("opacity", 0.6)
            .transition()
            .duration(1500)
            .attr("r", 7)
            .attr("opacity", 1)
            .on("end", pulse);
        }
        pulse();
      })
      .catch(err => {
        console.error("Error loading map:", err);
      });

  }, [locations]);

  return (
    <div className="relative w-full max-w-5xl mx-auto aspect-[4/3] bg-chalkboard rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl">
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
            className="absolute top-8 right-8 bottom-8 w-96 bg-white/95 backdrop-blur-2xl text-chalkboard p-10 rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.3)] z-30 flex flex-col border border-white/20"
          >
            <button 
              onClick={() => setSelectedLocation(null)}
              className="absolute top-6 right-6 p-3 hover:bg-chalkboard/5 rounded-full transition-colors"
            >
              <X size={24} />
            </button>

            <div className="w-16 h-16 bg-apple/10 text-apple rounded-2xl flex items-center justify-center mb-8 shadow-sm">
              <School size={32} />
            </div>

            <h3 className="text-3xl font-serif font-bold mb-3 leading-tight text-balance">{selectedLocation.name}</h3>
            <div className="flex items-center gap-2 text-sm font-bold text-muted uppercase tracking-widest mb-8">
              <MapPin size={16} className="text-apple" />
              <span>{selectedLocation.district}</span>
            </div>

            <div className="flex-1 overflow-y-auto pr-4 space-y-8 custom-scrollbar">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Students', value: selectedLocation.demographics.students },
                  { label: 'Low Income', value: selectedLocation.demographics.lowIncome },
                  { label: 'Diversity', value: selectedLocation.demographics.diversity }
                ].map(stat => (
                  <div key={stat.label} className="bg-chalkboard/[0.03] p-3 rounded-2xl text-center border border-chalkboard/5">
                    <div className="text-[8px] uppercase font-bold text-muted tracking-widest mb-1">{stat.label}</div>
                    <div className="text-xs font-bold font-mono">{stat.value}</div>
                  </div>
                ))}
              </div>

              <div className="bg-pencil/10 p-6 rounded-3xl border border-pencil/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Info size={40} />
                </div>
                <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-ink mb-2">Impact Summary</div>
                <p className="text-lg leading-relaxed font-light italic">"{selectedLocation.impact}"</p>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted mb-4">Funded Initiatives</div>
                <div className="flex flex-wrap gap-2">
                  {selectedLocation.projects.map(p => (
                    <span key={p} className="px-3 py-1.5 bg-apple/5 text-apple text-[10px] font-bold rounded-xl border border-apple/10">{p}</span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-6 bg-chalkboard text-white rounded-3xl shadow-lg">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/50 mb-1">Grant Total</div>
                  <div className="text-3xl font-serif font-bold text-pencil">{selectedLocation.amount}</div>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-pencil">
                  <Info size={24} />
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                setSelectedLocation(null);
                document.getElementById('stories')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="mt-10 w-full bg-apple text-white py-5 rounded-2xl font-bold text-lg hover:bg-apple/90 transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98]"
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
