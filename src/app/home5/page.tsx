"use client"
// import Hero from '@/components/landing/hero';
// import Timeline from '@/components/landing/timeline';
// import Accordion from '@/components/landing/accordion';
// import News from '@/components/landing/news';

import HeroBanner from "@/components/heros/hero1/app";
import ReplaysTable from "@/components/files/replays-table/app"
const HomePage: React.FC = () => {
  return (
    <div className="pt-14">
                                <ReplaysTable />
                            </div>
  );
};

export default HomePage;
