"use client";

import React from "react";
import { Checkbox, Link, RadioGroup, Radio, Spacer, CardFooter, Chip } from "@nextui-org/react";
import { cn } from "@nextui-org/react";
import { Icon } from "@iconify/react";

import { Tabs, Tab, Card, CardBody } from "@nextui-org/react";import { NetworkFavorite, QuestionIcon } from "../logo/icons/aerodynamic-harpoon";
import BattleButton from "../filters/ctas/material-button/battle-button";
import { title } from "../primitives";

import { useTheme } from "next-themes";
import { useWizard } from "./wizard-context";

export type ChooseRegionFormProps = React.HTMLAttributes<HTMLFormElement>;

const ChooseRegionForm = React.forwardRef<HTMLFormElement, ChooseRegionFormProps>(
  ({ className, ...props }, ref) => {
    const { updateState } = useWizard();
    // LeetGaming brand colors: lime (#DCFF37), orange (#FF6B35), navy (#34445C)
    const radioClassNames = {
      base: cn(
        "inline-flex m-0 bg-default-50 dark:bg-[#111111] items-center justify-between",
        "flex-row-reverse w-full max-w-full cursor-pointer rounded-none p-4 border-2 border-transparent",
        "hover:border-[#FF6B35]/30 dark:hover:border-[#DCFF37]/30 hover:bg-[#FF6B35]/5 dark:hover:bg-[#DCFF37]/5",
        "data-[selected=true]:border-[#FF6B35] dark:data-[selected=true]:border-[#DCFF37]",
        "data-[selected=true]:bg-[#FF6B35]/10 dark:data-[selected=true]:bg-[#DCFF37]/10",
        "transition-all duration-200",
      ),
      control: "bg-[#FF6B35] dark:bg-[#DCFF37] text-white dark:text-[#1a1a1a]",
      wrapper: "group-data-[selected=true]:border-[#FF6B35] dark:group-data-[selected=true]:border-[#DCFF37]",
      label: "text-small text-default-600 dark:text-slate-300 font-medium",
      labelWrapper: "m-0",
    };

    let { theme } = useTheme();

    if (!theme) {
      theme = "light";
    }

    return (
      <>
        <div className="text-center mb-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Icon icon="solar:global-bold-duotone" className="text-[#FF6B35] dark:text-[#DCFF37]" width={32} />
            <h1 className={title({color: theme === "dark" ? "battleLime" : "battleNavy"})}>Select Region</h1>
          </div>
          <div className="text-base leading-5 text-default-500">
            Choose the server closest to you for optimal performance
          </div>
        </div>
        <form
          ref={ref}
          className={cn("w-full flex grid grid-cols-12 flex-col py-8 items-center justify-center text-center", className)}
          {...props}
        >
       <RadioGroup
      className="col-span-12 items-center justify-center text-center"
      classNames={{
        wrapper: "gap-3",
      }}
      defaultValue="region1"
      name="region"
      onValueChange={(value) => updateState({ region: value })}
    >
      <div className="flex w-full flex-col">
        <Tabs
          aria-label="Region selection"
          className="w-full"
          variant="solid"
          classNames={{
            tabList: "bg-slate-100 dark:bg-[#1a1a1a] p-1 rounded-none gap-1",
            tab: "text-xs font-medium rounded-none data-[selected=true]:bg-[#34445C] dark:data-[selected=true]:bg-[#DCFF37] data-[selected=true]:text-white dark:data-[selected=true]:text-[#1a1a1a]",
            cursor: "bg-[#34445C] dark:bg-[#DCFF37] rounded-none",
          }}
        >
          <Tab key="south-america" title="S.America">
            <Card>
              <CardBody>
                <Radio classNames={radioClassNames} value="region11">
                  Brazil East (São Paulo)
                  <Spacer y={1} />
                  <span className="text-secondary text-sm flex items-center">
                    <small> Recommended</small>
                    <Spacer x={1} />
                    <NetworkFavorite size={18} color="foreground" />
                  </span>
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

          <div className="col-span-12 mt-4">
            <BattleButton
              className="w-full max-w-md mx-auto bg-gradient-to-r from-[#FF6B35] to-[#34445C] dark:from-[#DCFF37] dark:to-[#34445C] hover:opacity-90 transition-opacity rounded-none"
              color="primary"
              name="auto-choose-region"
              size="md"
              startContent={<Icon icon="solar:bolt-bold" className="text-white dark:text-[#1a1a1a]" width={20} />}
            >
              <span className="text-white dark:text-[#1a1a1a] font-semibold">Auto-Select Best Server</span>
            </BattleButton>
            <p className="text-xs text-default-400 mt-2">Ping test to find your optimal region</p>
          </div>
        </form>
      </>
    );
  },
);

ChooseRegionForm.displayName = "ChooseRegionForm";

export default ChooseRegionForm;
