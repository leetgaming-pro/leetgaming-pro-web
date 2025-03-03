
// 
// IF LOGGED-IN
// large top bar with % of storage used
//  
///
// main page (single-tab): dashboard
// -- Storage
// -- Private
//   -- Breakdown: Encrypted / Unencrypted
// -- Privately Shared
//   -- Breakdown: Encrypted / Unencrypted
//   (.. list namespaces ..) ::settings (edit namespace/vault) ::delete namespaces/item
// -- Public
//   (.. list files, configs etc ..) ::delete items/item
//     -- Breakdown: list Groups/Teams ::settings (edit team/vault)
// -- (Upgrade to Pro)


// side-buttons, new (create group/vault), settings (edit group/vault), delete group/vault

// if not logged in, show product page


// const HomePage: React.FC = () => {
//     return (
//       <div>

//       </div>
//     );
//   };

//   export default HomePage;



"use client";

import React from "react";
import {
    Tabs,
    Tab,
    Chip,
    ScrollShadow,
    CardBody,
    Card,
    CardHeader,
    CardFooter,
    Breadcrumbs,
    BreadcrumbItem,
} from "@nextui-org/react";

import ReplaysTable from "@/components/files/replays-table/app"
import { Icon } from "@iconify/react";

export default function Component() {
    return (
        <div className="w-full">
            {/* <nav className="my-4 px-2 py-2">
                <Breadcrumbs>
                    <BreadcrumbItem>News</BreadcrumbItem>
                    <BreadcrumbItem>Cloud</BreadcrumbItem>
                </Breadcrumbs>
            </nav> */}
            <main className="flex w-full justify-center">
                <ScrollShadow
                    hideScrollBar
                    className="flex w-full  justify-between gap-8 border-b border-divider px-4 sm:px-8"
                    orientation="horizontal"
                >
                    <Tabs
                        aria-label="Navigation Tabs"
                        classNames={{
                            tabList: "w-full max-w-[44%] absolute rounded-none p-0 gap-4 lg:gap-6",
                            tab: "w-full px-0 h-12",
                            cursor: "w-full",
                            tabContent: "text-default-400",
                        }}
                        radius="full"
                        variant="underlined"
                    >
                        <Tab
                            key="uploads"
                            title={
                                <div className="flex items-center gap-2">
                                    <p>Uploads</p>
                                    <Chip size="sm">9</Chip>
                                </div>
                            }
                        >
                            <div className="pt-14">
                                <ReplaysTable />
                            </div>

                        </Tab>
                        <Tab key="dashboard" title="Dashboard">
                            <div className="pt-14 flex flex-col md:flex-row md:space-x-4">
                                <Card>
                                    <CardHeader>Replays</CardHeader>
                                    <CardBody> Body: <p> Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. </p>
                                    </CardBody>
                                    <CardFooter> 5 (1 Public, 2 Shared, 2 Private) </CardFooter>
                                </Card>
                                <Card className="mb-4 md:mb-0">
                                    <CardHeader>Storage</CardHeader>
                                    <CardBody>
                                        <p> Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. </p>
                                    </CardBody>
                                    <CardFooter> 50% used (809.7MB/1TB) </CardFooter>
                                </Card>
                                <Card className="mb-4 md:mb-0">
                                    <CardHeader>Files</CardHeader>
                                    <CardBody> Body:
                                        <p> Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. </p>
                                    </CardBody>
                                    <CardFooter> 25 (5 Public, 5 Shared, 15 Private)  </CardFooter>
                                </Card>
                            </div>
                            <div className="pt-2">
                                <Card>
                                    <CardHeader>Usage / History</CardHeader>
                                    <CardBody>
                                        Line Chart:
                                        <p>
                                            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
                                            ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
                                            cillum dolore eu fugiat nulla pariatur.
                                        </p>
                                    </CardBody>
                                    <CardFooter>
                                        Footer
                                    </CardFooter>
                                </Card>
                            </div>
                            <div className="pt-2">
                                <Card>
                                    <CardHeader>Upgrade</CardHeader>
                                    <CardBody>
                                        Plans:
                                        <p>
                                            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
                                            ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
                                            cillum dolore eu fugiat nulla pariatur.
                                        </p>
                                    </CardBody>
                                    <CardFooter>
                                        Footer
                                    </CardFooter>
                                </Card>
                            </div>
                        </Tab>

                        <Tab key="analytics" title="Analytics" />
                        <Tab key="shared" title="Shared" />
                        
                        <Tab key="settings" title="Settings" />

                        <Tab key="upgrade-to-pro" title={
                            <div className="flex items-center gap-2">
                                <Icon className="text-default-500" icon="solar:users-group-two-rounded-outline" width={18} />
                                {/* <span className={`${logo({color: "battleOrange"})}`}>Team</span> */}
                                Team
                                <Chip size="sm">PRO</Chip>
                            </div>
                        } />
                    </Tabs>

                </ScrollShadow>
            </main>
        </div>
    );
}
