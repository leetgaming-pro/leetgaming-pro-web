"use client";

import type { InputProps, SelectProps } from "@nextui-org/react";

import React from "react";
import { Accordion, AccordionItem, Avatar, Card, CardBody, CardHeader, Checkbox, CheckboxGroup, Input, Radio, RadioGroup, Select, SelectItem, Spacer, Tab, Tabs } from "@nextui-org/react";
import { cn } from "@nextui-org/react";

import companyTypes from "./company-types";
import states from "./states";
import companyIndustries from "./company-industries";
import { title } from "../primitives";

import { useTheme } from "next-themes";
import { useWizard } from "./wizard-context";

import { DateRangePicker } from "@nextui-org/react";
import { parseAbsoluteToLocal, Time, ZonedDateTime } from "@internationalized/date";
import { I18nProvider } from "@react-aria/i18n";
import BattleButton from "../filters/ctas/material-button/battle-button";
import { PlusIcon } from "../icons";

import { TimeInput } from "@nextui-org/react";
import { useDateFormatter } from "@react-aria/i18n";


export type ScheduleInformationFormProps = React.HTMLAttributes<HTMLFormElement>;

export const CustomRadio = (props: any) => {
  const { children, ...otherProps } = props;

  return (
    <Radio
      {...otherProps}
      classNames={{
        base: cn(
          "inline-flex m-0 bg-content1 hover:bg-content2 items-center justify-between",
          "flex-row-reverse max-w-[300px] cursor-pointer rounded-none gap-4 p-4 border-2 border-transparent",
          "data-[selected=true]:border-[#FF4654] dark:data-[selected=true]:border-[#DCFF37]",
          "hover:border-[#FF4654]/30 dark:hover:border-[#DCFF37]/30",
          "transition-all duration-200",
        ),
      }}
    >
      {children}
    </Radio>
  );
};


function formatDateToTimezone(date: Date, timeZone: string): string { const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', timeZone, timeZoneName: 'short', }; return new Intl.DateTimeFormat('en-US', options).format(date); }
const ScheduleInformationForm = React.forwardRef<HTMLFormElement, ScheduleInformationFormProps>(
  ({ className, ...props }, ref) => {
    const { updateState } = useWizard();
    const inputProps: Pick<InputProps, "labelPlacement" | "classNames"> = {
      labelPlacement: "outside",
      classNames: {
        label:
          "text-small font-medium text-default-700 group-data-[filled-within=true]:text-default-700",
      },
    };
    let { theme } = useTheme();

    if (!theme || theme === "system") {
      theme = "light";
    }

    const [selected, setSelected] = React.useState<string[]>([]);
    let [value, setValue] = React.useState(parseAbsoluteToLocal("2024-04-08T18:45:22Z"));

    let formatter = useDateFormatter({ dateStyle: "short", timeStyle: "long" });


    const now = new Date()

    let [date, setDate] = React.useState({
      start: parseAbsoluteToLocal(now.toISOString()),
      end: parseAbsoluteToLocal(new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()),
    });

    const selectProps: Pick<SelectProps, "labelPlacement" | "classNames"> = {
      labelPlacement: "outside",
      classNames: {
        label: "text-small font-medium text-default-700 group-data-[filled=true]:text-default-700",
      },
    };



    return (
      <>
        <div className="flex flex-col items-center text-center mb-6">
          <h1 className={title({ color: theme === "dark" ? "battleLime" : "battleNavy" })}>Schedule Preferences</h1>
          <div className="py-2 text-default-500 max-w-md">
            Set your availability to find matches when you&apos;re ready to compete
          </div>
        </div>

        <Tabs 
          aria-label="Schedule Options" 
          className="w-full" 
          variant="solid"
          classNames={{
            tabList: "bg-[#F5F0E1] dark:bg-[#1a1a1a] p-1 rounded-none gap-1 shadow-sm border border-[#FF4654]/20 dark:border-[#DCFF37]/20",
            tab: cn(
              "text-sm font-semibold rounded-none px-3 py-2",
              "text-[#34445C] dark:text-[#F5F0E1]/80",
              "data-[hover=true]:text-[#FF4654] dark:data-[hover=true]:text-[#DCFF37] data-[hover=true]:bg-[#FF4654]/10 dark:data-[hover=true]:bg-[#DCFF37]/10",
              "data-[selected=true]:bg-gradient-to-r data-[selected=true]:from-[#FF4654] data-[selected=true]:to-[#FFC700]",
              "dark:data-[selected=true]:from-[#DCFF37] dark:data-[selected=true]:to-[#34445C]",
              "data-[selected=true]:text-[#F5F0E1] dark:data-[selected=true]:text-[#1a1a1a]",
              "data-[selected=true]:shadow-md"
            ),
            cursor: "bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] rounded-none",
          }}
        >

          <Tab key="quick-match" title="⚡ Play Now">
            <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
              <CardBody className="p-6">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] rounded-none"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)' }}>
                    <span className="text-3xl">⚡</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#34445C] dark:text-[#DCFF37]">Ready to Play Now</h3>
                    <p className="text-default-500 mt-1">Jump into a match immediately</p>
                  </div>
                  <BattleButton
                    className="w-full max-w-xs bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] text-white dark:text-[#1a1a1a] font-bold rounded-none"
                    color="primary"
                    name="play-now"
                    size="lg"
                    onPress={() => updateState({ scheduleType: 'now' })}
                  >
                    Find Match Now
                  </BattleButton>
                </div>
              </CardBody>
            </Card>
          </Tab>

          <Tab key="time-frames" title="📅 Time Window">
            <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
              <CardBody className="p-6">
                <div className="flex flex-col gap-4">
                  <I18nProvider locale="en-US">
                    <DateRangePicker
                      label="Available Time Window"
                      value={date}
                      className="w-full"
                      classNames={{
                        base: "rounded-none",
                        inputWrapper: "rounded-none border-[#34445C]/30 dark:border-[#DCFF37]/30",
                      }}
                      onChange={(newDate) => {
                        setDate(newDate);
                        updateState({
                          scheduleType: 'window',
                          scheduleStart: newDate.start.toDate(),
                          scheduleEnd: newDate.end.toDate(),
                        });
                      }}
                    />
                  </I18nProvider>

                  <div className="flex items-center gap-2 p-3 bg-[#34445C]/5 dark:bg-[#DCFF37]/5 rounded-none border-l-2 border-[#FF4654] dark:border-[#DCFF37]">
                    <span className="text-sm text-default-600">
                      💡 Tip: Set a wider window for faster matchmaking
                    </span>
                  </div>

                  <BattleButton
                    className="w-full bg-[#34445C]/80 dark:bg-[#1a1a1a] text-white dark:text-[#DCFF37] border border-[#FF4654]/30 dark:border-[#DCFF37]/30 rounded-none"
                    color="primary"
                    name="add-more-schedule"
                    size="md"
                    startContent={<PlusIcon />}
                  >
                    Add Another Time Slot
                  </BattleButton>
                </div>
              </CardBody>
            </Card>
          </Tab>

          <Tab key="recurrence" title="🔄 Weekly">
            <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
              <CardHeader className="flex flex-col gap-4 p-6 pb-2">
                <TimeInput 
                  label="Preferred Time" 
                  value={value} 
                  onChange={setValue}
                  classNames={{
                    inputWrapper: "rounded-none border-[#34445C]/30 dark:border-[#DCFF37]/30",
                  }}
                />
                <p className="text-default-500 text-sm">
                  {value instanceof ZonedDateTime
                    ? `Your local time: ${formatDateToTimezone(value.toDate(), Intl.DateTimeFormat().resolvedOptions().timeZone)}`
                    : "Select your preferred play time"}
                </p>
              </CardHeader>
              <CardBody className="p-6 pt-2">
                <CheckboxGroup
                  label="Select Your Play Days"
                  value={selected}
                  classNames={{
                    label: "text-[#34445C] dark:text-[#DCFF37] font-semibold mb-2",
                  }}
                  onValueChange={(newSelected) => {
                    setSelected(newSelected);
                    updateState({ scheduleType: 'weekly', weeklyRoutine: newSelected });
                  }}
                >
                  <div className="grid grid-cols-2 gap-2">
                    {['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map((day) => (
                      <Checkbox 
                        key={day}
                        value={day}
                        classNames={{
                          base: cn(
                            "rounded-none border border-default-200 dark:border-[#DCFF37]/20 p-3 m-0 w-full max-w-full",
                            "hover:bg-[#FF4654]/5 dark:hover:bg-[#DCFF37]/5",
                            "data-[selected=true]:bg-[#FF4654]/10 dark:data-[selected=true]:bg-[#DCFF37]/10",
                            "data-[selected=true]:border-[#FF4654] dark:data-[selected=true]:border-[#DCFF37]",
                          ),
                          wrapper: "before:border-[#FF4654] dark:before:border-[#DCFF37] after:bg-[#FF4654] dark:after:bg-[#DCFF37]",
                        }}
                      >
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                      </Checkbox>
                    ))}
                  </div>
                </CheckboxGroup>
                
                {selected.length > 0 && (
                  <div className="mt-4 p-3 bg-[#34445C]/5 dark:bg-[#DCFF37]/5 rounded-none border-l-2 border-[#FF4654] dark:border-[#DCFF37]">
                    <p className="text-sm text-default-600">
                      ✓ Available on: <span className="font-semibold text-[#34445C] dark:text-[#DCFF37]">{selected.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(", ")}</span>
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>
          </Tab>
        </Tabs>
      </>
    );
  },
);

ScheduleInformationForm.displayName = "ScheduleInformationForm";

export default ScheduleInformationForm;
