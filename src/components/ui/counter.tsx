
'use client';

import { MotionValue, motion, useSpring, useTransform } from "framer-motion";
import React, { useEffect } from "react";
import { cn } from "@/lib/utils";

interface NumberProps {
  mv: MotionValue<number>;
  number: number;
  height: number;
}

function Number({ mv, number, height }: NumberProps) {
  let y = useTransform(mv, (latest) => {
    let placeValue = latest % 10;
    let offset = (10 + number - placeValue) % 10;
    let memo = offset * height;
    if (offset > 5) {
      memo -= 10 * height;
    }
    return memo;
  });

  return (
    <motion.span style={{ y }} className="absolute inset-0 flex items-center justify-center">
      {number}
    </motion.span>
  );
}

interface DigitProps {
  place: number;
  value: number;
  height: number;
  digitStyle?: React.CSSProperties;
}

function Digit({ place, value, height }: DigitProps) {
  let valueRoundedToPlace = Math.floor(value / place);
  let animatedValue = useSpring(valueRoundedToPlace, {
    stiffness: 100,
    damping: 15,
    mass: 0.1,
  });

  useEffect(() => {
    animatedValue.set(valueRoundedToPlace);
  }, [animatedValue, valueRoundedToPlace]);

  return (
    <div style={{ height }} className="relative w-[1ch] tabular-nums">
      {Array.from({ length: 10 }, (_, i) => (
        <Number key={i} mv={animatedValue} number={i} height={height} />
      ))}
    </div>
  );
}

interface CounterProps {
  value: number;
  className?: string;
  fontSize?: number;
}

export default function Counter({
  value,
  className,
  fontSize = 20,
}: CounterProps) {
  const places = [1000, 100, 10, 1];
  const padding = 8;
  const height = fontSize + padding;

  return (
    <div className={cn("relative inline-block", className)}>
      <div
        className="flex overflow-hidden rounded-md font-bold leading-none text-foreground"
        style={{ fontSize: `${fontSize}px`, gap: '2px' }}
      >
        {places.map((place) => (
          <Digit
            key={place}
            place={place}
            value={value}
            height={height}
          />
        ))}
      </div>
      <div
        className="pointer-events-none absolute inset-0"
      >
        <div 
          className="h-2"
          style={{ background: 'linear-gradient(to bottom, hsl(var(--background)), transparent)' }}
        />
        <div
          className="absolute bottom-0 h-2 w-full"
          style={{ background: 'linear-gradient(to top, hsl(var(--background)), transparent)' }}
        />
      </div>
    </div>
  );
}
