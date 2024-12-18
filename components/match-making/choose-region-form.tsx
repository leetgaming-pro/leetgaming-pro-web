"use client";

import React from "react";
import { Checkbox, Link, RadioGroup, Radio, Spacer, CardFooter, Button } from "@nextui-org/react";
import { cn } from "@nextui-org/react";

import { Tabs, Tab, Card, CardBody } from "@nextui-org/react";import { NetworkFavorite, QuestionIcon } from "../logo/icons/aerodynamic-harpoon";
import BattleButton from "../filters/ctas/material-button/battle-button";
import { title } from "../primitives";

import { useTheme } from "next-themes";

export type ChooseRegionFormProps = React.HTMLAttributes<HTMLFormElement>;

const ChooseRegionForm = React.forwardRef<HTMLFormElement, ChooseRegionFormProps>(
  ({ className, ...props }, ref) => {
    const radioClassNames = {
      base: cn(
        "inline-flex m-0 bg-default-100 items-center justify-between",
        "flex-row-reverse w-full max-w-full cursor-pointer rounded-lg p-4 border-medium border-transparent",
        "data-[selected=true]:border-secondary",
      ),
      control: "bg-secondary text-secondary-foreground",
      wrapper: "group-data-[selected=true]:border-secondary",
      label: "text-small text-default-500 font-medium",
      labelWrapper: "m-0",
    };

    let { theme } = useTheme();

    if (!theme) {
      theme = "light";
    }

    return (
      <>
        <h1 className={title({color: theme === "dark" ? "foreground" : "battleNavy"})}>Choose Region</h1>
        <div className="py-4 text-base leading-5 text-default-500">
          Selecting your region helps us provide you with the best possible experience
        </div>
        <form
          ref={ref}
          className={cn("w-full flex grid grid-cols-12 flex-col py-8 items-center justify-center text-center", className)}
          {...props}
        >
       <RadioGroup
      className="col-span-12 items-center justify-center text-center"
      classNames={{
        wrapper: "gap-4",
      }}
      defaultValue="region1"
      name="region"
    >
      <div className="flex w-full flex-col">
        <Tabs aria-label="Options" className="w-full">
          <Tab key="south-america" title="S.America">
            <Card>
              <CardBody>
                <Radio classNames={radioClassNames} value="region11">
                  Brazil East (São Paulo)
                  <Spacer y={1} />
                  <Link href="#" size="sm" className="text-secondary underline">
                    <small> Recommended</small>
                    <Spacer x={1} />
                    <NetworkFavorite size={18} color="foreground" />
                  </Link>
                </Radio>
                <Spacer y={1} />
                <Radio classNames={radioClassNames} value="region12">
                  Bogotá (Colombia)
                </Radio>
                <Spacer y={1} />
                <Radio classNames={radioClassNames} value="region13">
                  Santiago (Chile)
                </Radio>
                <Spacer y={1} />
                <Radio classNames={radioClassNames} value="region14">
                  Lima (Peru)
                </Radio>
              </CardBody>
            </Card>
          </Tab>
          <Tab key="north-america" title="N.America">
            <Card>
              <CardBody>
                <Radio classNames={radioClassNames} value="region7">
                  West US (Silicon Valley)
                </Radio>
                <Spacer y={1} />
                <Radio classNames={radioClassNames} value="region8">
                  East US (Virginia)
                </Radio>
                <Spacer y={1} />
                <Radio classNames={radioClassNames} value="region9">
                  North America (Toronto)
                </Radio>
                <Spacer y={1} />
                <Radio classNames={radioClassNames} value="region23">
                  Central Canada (Montreal)
                </Radio>
                <Spacer y={1} />
                <Radio classNames={radioClassNames} value="region24">
                  Central US (Chicago)
                </Radio>
                <Spacer y={1} />
                <Radio classNames={radioClassNames} value="region25">
                  North Central US (Dallas)
                </Radio>
                <Spacer y={1} />
                <Radio classNames={radioClassNames} value="region26">
                  West US (Seattle)
                </Radio>
              </CardBody>
            </Card>
          </Tab>
          <Tab key="europe" title="Europe">
            <Card>
              <CardBody>
                <Radio classNames={radioClassNames} value="region10">
                  Central Europe (Frankfurt)
                </Radio>
                <Spacer y={1} />
                <Radio classNames={radioClassNames} value="region15">
                  London (UK)
                </Radio>
                <Spacer y={1} />
                <Radio classNames={radioClassNames} value="region16">
                  Paris (France)
                </Radio>
                <Spacer y={1} />
                <Radio classNames={radioClassNames} value="region17">
                  Dublin (Ireland)
                </Radio>
                <Spacer y={1} />
                <Radio classNames={radioClassNames} value="region18">
                  Amsterdam (Netherlands)
                </Radio>
                <Spacer y={1} />
                <Radio classNames={radioClassNames} value="region19">
                  Stockholm (Sweden)
                </Radio>
                <Spacer y={1} />
                <Radio classNames={radioClassNames} value="region20">
                  Milan (Italy)
                </Radio>
                <Spacer y={1} />
                <Radio classNames={radioClassNames} value="region21">
                  Madrid (Spain)
                </Radio>
                <Spacer y={1} />
                <Radio classNames={radioClassNames} value="region22">
                  Zurich (Switzerland)
                </Radio>
              </CardBody>
            </Card>
          </Tab>
          <Tab key="middle-east" title="Middle East">
            <Card>
              <CardBody>
                <Radio classNames={radioClassNames} value="region31">
                  Dubai (UAE)
                </Radio>
              </CardBody>
            </Card>
          </Tab>
          <Tab key="africa" title="Africa">
            <Card>
              <CardBody>
                <Radio classNames={radioClassNames} value="region32">
                  Cape Town (South Africa)
                </Radio>
              </CardBody>
            </Card>
          </Tab>
          <Tab key="asia" title="Asia Pacific">
            <Card>
              <CardBody>
                <Radio classNames={radioClassNames} value="region1">
                  South China (Guangzhou, Shenzhen)
                </Radio>
                <Spacer y={1} />
                <Radio classNames={radioClassNames} value="region2">
                  North China (Beijing)
                </Radio>
                <Spacer y={1} />
                <Radio classNames={radioClassNames} value="region3">
                  East China (Shanghai)
                </Radio>
                <Spacer y={1} />
                <Radio classNames={radioClassNames} value="region4">
                  Southeast Asia (Singapore, Jakarta)
                </Radio>
                <Spacer y={1} />
                <Radio classNames={radioClassNames} value="region5">
                  South Asia Pacific (Mumbai)
                </Radio>
                <Spacer y={1} />
                <Radio classNames={radioClassNames} value="region6">
                  Northeast Asia (Seoul, Tokyo)
                </Radio>
                <Spacer y={1} />
                <Radio classNames={radioClassNames} value="region27">
                  Bangkok (Thailand)
                </Radio>
                <Spacer y={1} />
                <Radio classNames={radioClassNames} value="region28">
                  Sydney (Australia)
                </Radio>
                <Spacer y={1} />
                <Radio classNames={radioClassNames} value="region29">
                  Hong Kong (China)
                </Radio>
                <Spacer y={1} />
                <Radio classNames={radioClassNames} value="region30">
                  Taipei (Taiwan)
                </Radio>
              </CardBody>
            </Card>
          </Tab>
        </Tabs>
      </div>
    </RadioGroup>

          <BattleButton
            className="col-span-12 mx-0 my-2 px-2 items-center justify-center text-center"
            color="primary"
            name="auto-choose-region"
            size="md"
            startContent={<QuestionIcon />}
          >
           Automatically select the region with lowest latency
          </BattleButton>
        </form>
      </>
    );
  },
);

ChooseRegionForm.displayName = "ChooseRegionForm";

export default ChooseRegionForm;
