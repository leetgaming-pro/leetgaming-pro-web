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
          "flex-row-reverse max-w-[300px] cursor-pointer rounded-lg gap-4 p-4 border-2 border-transparent",
          "data-[selected=true]:border-primary",
        ),
      }}
    >
      {children}
    </Radio>
  );
};

const defaultContent =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

function formatDateToTimezone(date: Date, timeZone: string): string { const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', timeZone, timeZoneName: 'short', }; return new Intl.DateTimeFormat('en-US', options).format(date); }
const ScheduleInformationForm = React.forwardRef<HTMLFormElement, ScheduleInformationFormProps>(
  ({ className, ...props }, ref) => {
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
        <h1 className={title({ color: theme === "dark" ? "foreground" : "battleNavy" })}>Schedule Preferences</h1>
        <div className="py-4 text-default-500">
          Please provide your available time slots and preferred schedule
        </div>

        <Tabs aria-label="Options" className="w-full" variant="underlined">

          <Tab key="time-frames" title="Time Window">
            <Card>
              <CardBody>
                <div className="w-full  h-[200px]  font-bold flex flex-col items-center justify-center text-center">

                  <div className="w-full h-full  font-bold  flex-col items-center justify-center text-center">
                    <I18nProvider locale="ja-JP">
                      <DateRangePicker label="Available Time Window" value={date} onChange={setDate} />
                    </I18nProvider>

                    <Spacer y={2} />
                      <BattleButton
                                className="col-span-12 mx-0 my-2 px-2 items-center justify-center text-center"
                                color="primary"
                                name="add-more-schedule"
                                size="md"
                                startContent={<PlusIcon  />}
                              >
                               Add more ...
                              </BattleButton>

                    {/* <Spacer y={2} />

              <I18nProvider locale="ja-JP">
                <DateRangePicker label="Available Time Window" value={date} onChange={setDate} />
              </I18nProvider>

              <Spacer y={2} />

              <I18nProvider locale="ja-JP">
                <DateRangePicker label="Available Time Window" value={date} onChange={setDate} />
              </I18nProvider> */}


                  </div>

                  {/* </form> */}
                </div>
              </CardBody>
            </Card>
          </Tab>

          <Tab key="recurrence" title="Weekly Routine">
            <Card>
              <CardHeader className="flex flex-col gap-4">
                <TimeInput label="Time" value={value} onChange={setValue} />
                <p className="text-default-500 text-sm">
                  {value instanceof ZonedDateTime
                    ? formatDateToTimezone(value.toDate(), 'America/Sao_Paulo') ||
                    "--"
                    : ""}
                </p>

              </CardHeader>
              <CardBody>


                <div className="flex flex-col gap-3">
                  <CheckboxGroup
                    color="warning"
                    label="Select Weekdays"
                    value={selected}
                    onValueChange={setSelected}
                  >
                    <Checkbox value="sunday">Sunday</Checkbox>
                    <Checkbox value="monday">Monday</Checkbox>
                    <Checkbox value="tuesday">Tuesday</Checkbox>
                    <Checkbox value="wednesday">Wednesday</Checkbox>
                    <Checkbox value="thursday">Thursday</Checkbox>
                    <Checkbox value="friday">Friday</Checkbox>
                    <Checkbox value="saturday">Saturday</Checkbox>

                  </CheckboxGroup>
                  <p className="text-default-500 text-small">Selected: {selected.join(", ")}</p>
                </div>

                <div className="w-full flex flex-row gap-2">
                  <div className="w-full flex flex-col gap-y-2">
                  </div>
                </div>

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
