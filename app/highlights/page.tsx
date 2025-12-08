"use client"

import React from "react";
import { Icon } from "@iconify/react";
import GameEventsInifiniteScroll from "@/components/replay/game-events/infinite-scroll/app"
import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/react";

export default function HighlightsPage() {
    return (
        <div className="flex flex-col w-full max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] rounded-none"
                        style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}>
                        <Icon icon="solar:video-frame-play-bold" className="text-[#F5F0E1] dark:text-[#1a1a1a]" width={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-[#34445C] dark:text-[#F5F0E1]">Highlights</h1>
                        <p className="text-sm text-[#34445C]/60 dark:text-[#F5F0E1]/60">Epic moments from the community</p>
                    </div>
                </div>
                <Breadcrumbs classNames={{
                    base: "rounded-none",
                    list: "rounded-none",
                    separator: "text-[#FF4654] dark:text-[#DCFF37]",
                }}>
                    <BreadcrumbItem className="text-[#34445C] dark:text-[#F5F0E1]">Home</BreadcrumbItem>
                    <BreadcrumbItem className="text-[#FF4654] dark:text-[#DCFF37] font-semibold">Highlights</BreadcrumbItem>
                </Breadcrumbs>
            </div>
            
            {/* Content */}
            <div className="w-full">
                <GameEventsInifiniteScroll />
            </div>
        </div>
    );
}
