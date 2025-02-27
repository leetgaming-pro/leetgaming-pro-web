import React from "react";
import { Accordion, AccordionItem, Avatar, Card, Chip, Popover, PopoverContent, PopoverTrigger, Progress, ScrollShadow, Spacer, Table, TableBody, TableCell, TableRow } from "@nextui-org/react";
import { logo } from '@/components/primitives';
import { FlashIcon, UserIcon } from '@/components/icons';
import { LinkIcon } from '@nextui-org/link';
import SearchEvent from './search-event';
import BreadcrumbEvents from '@/components/replay/game-events/breadcrumb';
import ViewPlayerInfoCard from '@/components/replay/game-events/playercard/view-player-info-card';

export default function Rounds() {
  const defaultContent =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

  return (
    <div>
      <div className="">
        <BreadcrumbEvents />
        <SearchEvent />
        <Spacer y={10} />
      </div>
        <Accordion selectionMode="single" disabledKeys={["2"]} variant="shadow">
          <AccordionItem
            key="1"
            aria-label="1st Round"
            startContent={
              <Avatar
                isBordered
                color="warning"
                radius="lg"
                showFallback name='T'
              />
            }
            subtitle="xyz is the MVP"
            title={
              <div>Round #1 <Chip variant="bordered" isDisabled>Pistol</Chip></div>

            }
          >

          </AccordionItem>
          <AccordionItem
            key="2"
            aria-label="Round #2"
            startContent={
              <Avatar
                isBordered
                color="warning"
                radius="lg"
                showFallback name='T'
              />
            }
            subtitle="3 incompleted steps"
            title={<div>Round #2<Spacer x={4} />

              {/* <Spacer x={16} /><Chip color="danger" variant="dot">Clutch</Chip> */}

              <Chip
                variant="shadow"
                classNames={{
                  base: "bg-gradient-to-br from-indigo-500 to-pink-500 border-small border-white/50 shadow-pink-500/30",
                  content: "drop-shadow shadow-black text-white",
                }}
              >
                Sign-in with your account to view complete match details
              </Chip>
            </div>

            }
          >


          </AccordionItem>
          <AccordionItem
            key="3"
            aria-label={"Round #3"}
            startContent={
              <Avatar
                isBordered
                color="primary"
                radius="lg"
                showFallback name='CT'
              />
            }
            subtitle={
              <p className="flex">
                TeamB wins the round
              </p>
            }
            title={<div>Round #3 <Chip color="danger" variant="dot">Clutch</Chip>


            </div>

            }
          >
            {/* disabledKeys={["2"]} */}
            <Accordion selectionMode="multiple">
              <AccordionItem
                key="1"
                aria-label="Event 1"
                // startContent={
                //   <Avatar
                //     isBordered
                //     color="primary"
                //     radius="lg"
                //     src="https://i.pravatar.cc/150?u=a042581f4e29026024d"
                //   />
                // }
                subtitle={
                  <div>

                  </div>
                }
                title={<div><span className="text-warning ml-1">Player1</span> defeated <span className="text-primary ml-1">Player2</span> with <Chip></Chip><Chip></Chip>
                </div>
                }
              >
                <Card isBlurred>
                  <Progress
                    size="sm"
                    radius="sm"
                    classNames={{
                      base: "max-w-md",
                      track: "drop-shadow-md border border-default",
                      indicator: "bg-gradient-to-r from-green-500 to-lime-500",
                      label: "tracking-wider font-medium text-default-600",
                      value: "text-foreground/60",
                    }}
                    label="Health: 98"
                    value={98}
                    showValueLabel={false}
                  />
                  <Spacer y={4} />
                  <Chip color="danger" variant="dot"><span className="text-primary ml-1">Player3</span> in <span className="text-danger">Clutch Situation</span></Chip>
                </Card>
              </AccordionItem>
              <AccordionItem
                key="2"
                aria-label="Event 2"
                // startContent={
                //   <Avatar
                //     isBordered
                //     color="primary"
                //     radius="lg"
                //     src="https://i.pravatar.cc/150?u=a042581f4e29026024d"
                //   />
                // }
                subtitle={
                  <div>

                  </div>
                }
                title={<div><span className="text-primary ml-1">Player3</span> defeated <span className="text-warning ml-1">Player4</span> with <Chip></Chip><Chip></Chip>

                </div>

                }
              >
                <Card isBlurred>
                  <Progress
                    size="sm"
                    radius="sm"
                    classNames={{
                      base: "max-w-md",
                      track: "drop-shadow-md border border-default",
                      indicator: "bg-gradient-to-r from-orange-500 to-yellow-500",
                      label: "tracking-wider font-medium text-default-600",
                      value: "text-foreground/60",
                    }}
                    label={<div><span className="text-primary ml-1">Player3</span> <span>HP: 33</span></div>}
                    value={33}
                    showValueLabel={false}
                  />
                  <Spacer y={4} /><Chip variant="dot" color="danger"><span className="text-primary ml-1">Player3</span> Clutch Progress</Chip>
                </Card>
              </AccordionItem>
              <AccordionItem
                key="3"
                aria-label="Round #3"
                startContent={
                  <Avatar
                    isBordered
                    color="primary"
                    radius="lg"
                    showFallback name='CT'
                  />
                }
                subtitle=""
                title={<div><span className={logo({ color: "blue" })}>TeamB Win</span></div>}
              >

                <span className="text-primary ml-1">Player3</span> defeated <span className="text-warning ml-1">Player4</span> with <Chip></Chip><Chip></Chip>
                <Spacer x={16} />
                <Card isBlurred>
                  <Progress
                    size="sm"
                    radius="sm"
                    classNames={{
                      base: "max-w-md",
                      track: "drop-shadow-md border border-default",
                      indicator: "bg-gradient-to-r from-green-500 to-yellow-500 to-red-500",
                      label: "tracking-wider font-medium text-default-600",
                      value: "text-foreground/60",
                    }}
                    label={<div><span className="text-primary ml-1">Player3</span> <span>HP: 7</span></div>}
                    value={7}
                    showValueLabel={false}
                  />
                  <Spacer y={4} />
                  <Chip color="danger" variant="dot">



                    <Popover showArrow placement="bottom">
                      <PopoverTrigger>
                        <span className="text-primary ml-1">Player3</span>
                      </PopoverTrigger>
                      <PopoverContent className="p-1">
                        <ViewPlayerInfoCard />
                      </PopoverContent>
                    </Popover>


                    <span className="text-success"> Clutch Won!</span></Chip>
                </Card>
              </AccordionItem>
            </Accordion>
          </AccordionItem>
        </Accordion>
    </div>
  );
}
