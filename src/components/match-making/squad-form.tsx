"use client";

import type { InputProps } from "@nextui-org/react";

import React from "react";
import { Input, Checkbox, Link, Spacer, Card, Accordion, AccordionItem, Avatar, Tab, CardBody, Tabs, Chip, User } from "@nextui-org/react";
import { cn } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { SearchIcon } from "../icons";
import { title } from "../primitives";
import { useTheme } from "next-themes";

export type SignUpFormProps = React.HTMLAttributes<HTMLFormElement>;

const SignUpForm = React.forwardRef<HTMLFormElement, SignUpFormProps>(
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


    const [isSelected, setIsSelected] = React.useState(false);


    const user = {
      name: "Pedro Savelis",
      avatar: "https://avatars.githubusercontent.com/u/3760203?v=4",
      username: "sound",
      url: "https://github.com/psavelis",
      role: "CTO & Co-Founder",
      status: "Online now",
    };

    const defaultContent =
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";


    const teamMock = {
      displayName: "Eth3ernity*",
      tag: "ETH3",
      url: "leetgaming.pro/teams/ethernity",
      avatar: "https://avatars.githubusercontent.com/u/168373520?s=200&v=4",
      members: [
        { nickname: "sound", avatar: "https://avatars.githubusercontent.com/u/3760203?v=4", type: "Owner", role: "AWPER" }, // Role: ??? AWPER, Lurker etc?
        { nickname: "sound", avatar: "https://avatars.githubusercontent.com/u/3760203?v=4", type: "Owner", role: "AWPER" }, // Role: ??? AWPER, Lurker etc?
        { nickname: "sound", avatar: "https://avatars.githubusercontent.com/u/3760203?v=4", type: "Owner", role: "AWPER" }, // Role: ??? AWPER, Lurker etc?
        { nickname: "sound", avatar: "https://avatars.githubusercontent.com/u/3760203?v=4", type: "Owner", role: "AWPER" }, // Role: ??? AWPER, Lurker etc?
        { nickname: "sound", avatar: "https://avatars.githubusercontent.com/u/3760203?v=4", type: "Owner", role: "AWPER" }, // Role: ??? AWPER, Lurker etc?
      ],
      description: defaultContent
    }

    const teams = [teamMock]



    return (
      <>
        <div className="w-full text-3xl font-bold leading-9 text-default-foreground flex items-center justify-center">

          <h1 className={title({ color: theme === "dark" ? "foreground" : "battleNavy" })}>Setup your Squad</h1>
        </div>
        <div className="py-2 text-medium text-default-500">
          Choose a team or pick your friends to play with.
        </div>

        <Tabs aria-label="Options" className="w-full" variant="underlined">

          <Tab key="create-team" title="Pick-up your party">
            <form
              ref={ref}
              {...props}
              className={cn("flex grid grid-cols-12 flex-col gap-4 py-8 w-[500px]", className)}
            >
              <Input

                startContent={
                  <div>
                    <Icon className="text-default-500" icon="solar:users-group-two-rounded-outline" width={20} />
                    <Spacer x={5} />
                  </div>
                }
                endContent={
                  <SearchIcon />
                }
                className="col-span-12"
                // label="Nickname"
                name="nickname"
                placeholder="Type to search for your friends or team"
                {...inputProps}
              />


              {/* <Checkbox
                defaultSelected
                className="col-span-12 m-0 p-2 text-left"
                color="secondary"
                name="terms-and-privacy-agreement"
                size="md"
              >
                I read and agree with the
                <Link className="mx-1 text-secondary underline" href="#" size="md">
                  Terms
                </Link>
                <span>and</span>
                <Link className="ml-1 text-secondary underline" href="#" size="md">
                  Privacy Policy
                </Link>
                .
              </Checkbox> */}
            </form>

            <Checkbox
              aria-label={user.name}
              classNames={{
                base: cn(
                  "inline-flex w-full max-w-md bg-content1",
                  "hover:bg-content2 items-center justify-start",
                  "cursor-pointer rounded-lg gap-2 p-4 border-2 border-transparent",
                  "data-[selected=true]:border-primary",
                ),
                label: "w-full",
              }}
              isSelected={isSelected}
              onValueChange={setIsSelected}
            >
              <div className="w-full flex justify-between gap-2">
                <User
                  avatarProps={{ size: "md", src: user.avatar }}
                  description={
                    <Link isExternal href={user.url} size="sm">
                      @{user.username}
                    </Link>
                  }
                  name={user.name}
                />
                <div className="flex flex-col items-end gap-1">
                  <span className="text-tiny text-default-500">{user.role}</span>
                  <Chip color="success" size="sm" variant="flat">
                    {user.status}
                  </Chip>
                </div>
              </div>
            </Checkbox>

            <Spacer y={32} />

            <Card className="col-span-12 m-0 p-2 text-center">
              <div className="col-span-12 m-0 p-2 text-center">
                Don&lsquo;t have a team yet?
                <Link className="ml-2 text-secondary underline" href="#" size="md">
                  Create a new team
                </Link>
              </div>
            </Card>

          </Tab>

          <Tab key="your-teams" title="Your Teams">
            <Card className="w-[580px]">
              <CardBody>

                {teams.map((team) => (
                  <Accordion key={team.displayName} selectionMode="multiple">
                    <AccordionItem
                      key="1"
                      aria-label={team.displayName}
                      startContent={
                        <Avatar
                          isBordered
                          color="primary"
                          radius="lg"
                          src={team.avatar}
                        />
                      }
                      subtitle={`${team.displayName} (${team.members.length} member)`}
                      title={team.tag}
                    >
                      {defaultContent}

                      {team.members.map((member) => (
                        <div key={member.nickname} className="flex items-center gap-2">
                          <Spacer y={2} />
                          <Card className="w-1/2 border" style={{ borderRadius: "50px" }}>
                            <div key={member.nickname} className="flex items-center gap-2">
                              <Avatar alt={member.nickname.charAt(0).toUpperCase()} src={member.avatar} />
                              <span>{member.nickname}</span>
                            </div>

                          </Card>
                        </div>
                      ))}
                    </AccordionItem>

                  </Accordion>
                ))
                }


              </CardBody>
            </Card>
          </Tab>
        </Tabs>
      </>
    );
  },
);

SignUpForm.displayName = "SignUpForm";

export default SignUpForm;
