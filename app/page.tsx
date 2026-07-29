"use client";

import Hero from "@/components/home/Hero";
import WeeklyWinners from "@/components/home/WeeklyWinners";
import PriceDrops from "@/components/home/PriceDrops";
import HowItWorks from "@/components/home/HowItWorks";
import ClosingCta from "@/components/home/ClosingCta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <WeeklyWinners />
      <PriceDrops />
      <HowItWorks />
      <ClosingCta />
    </>
  );
}
