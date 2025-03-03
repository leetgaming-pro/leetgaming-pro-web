"use client"

import GameEventsInifiniteScroll from "@/components/replay/game-events/infinite-scroll/app"
import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/react";

const HomePage: React.FC = () => {
    return (
        <div className="flex flex-col w-full">

            <nav className="my-4 px-2 py-2">
                <Breadcrumbs>
                    <BreadcrumbItem>Home</BreadcrumbItem>
                    <BreadcrumbItem>Highlights</BreadcrumbItem>
                </Breadcrumbs>
            </nav>
            <div className="flex w-fit">

                <GameEventsInifiniteScroll />
            </div>
        </div>

    );
};

export default HomePage;
