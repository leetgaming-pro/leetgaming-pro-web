"use client";

import type { InputProps } from "@nextui-org/react";

import React, { useEffect, useState, useCallback } from "react";
import { Input, Checkbox, Link, Spacer, Card, Accordion, AccordionItem, Avatar, Tab, CardBody, Tabs, Chip, User, Spinner } from "@nextui-org/react";
import { cn } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { SearchIcon } from "../icons";
import { title } from "../primitives";
import { useTheme } from "next-themes";
import { useWizard } from "./wizard-context";
import { useSession } from "next-auth/react";

interface TeamMember {
  nickname: string;
  avatar: string;
  type: string;
  role: string;
}

interface Team {
  id: string;
  displayName: string;
  tag: string;
  url: string;
  avatar: string;
  members: TeamMember[];
  description: string;
}

export type SignUpFormProps = React.HTMLAttributes<HTMLFormElement>;

const SignUpForm = React.forwardRef<HTMLFormElement, SignUpFormProps>(
  ({ className, ...props }, ref) => {
    const { updateState } = useWizard();
    const { data: session } = useSession();
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    
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

    // Get user info from session
    const user = {
      name: session?.user?.name || "Guest",
      avatar: session?.user?.image || session?.user?.steam?.avatarmedium || "/default-avatar.png",
      username: session?.user?.steam?.personaname || session?.user?.email?.split("@")[0] || "player",
      url: session?.user?.steam?.profileurl || "#",
      role: "Player",
      status: session ? "Online" : "Offline",
    };

    // Fetch user's teams from API
    const fetchTeams = useCallback(async () => {
      if (!session?.user) {
        setTeams([]);
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch('/api/squads');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            const formattedTeams: Team[] = data.data.map((squad: any) => ({
              id: squad.id,
              displayName: squad.name || squad.display_name || "Unnamed Team",
              tag: squad.symbol || squad.tag || "TEAM",
              url: `/teams/${squad.id}`,
              avatar: squad.logo_uri || "/team-default.png",
              members: squad.members?.map((m: any) => ({
                nickname: m.nickname || m.display_name || "Unknown",
                avatar: m.avatar_uri || "/default-avatar.png",
                type: m.role_type || "Member",
                role: m.game_role || "Player",
              })) || [],
              description: squad.description || "",
            }));
            setTeams(formattedTeams);
          }
        }
      } catch (error) {
        console.error("Failed to fetch teams:", error);
      } finally {
        setLoading(false);
      }
    }, [session]);

    useEffect(() => {
      fetchTeams();
    }, [fetchTeams]);



    return (
      <>
        <div className="w-full text-3xl font-bold leading-9 text-default-foreground flex items-center justify-center">

          <h1 className={title({ color: theme === "dark" ? "battleLime" : "battleNavy" })}>Setup your Squad</h1>
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
                name="search"
                placeholder="Search for players or teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                <Link className="mx-1 text-secondary underline" href="/legal/terms" size="md">
                  Terms
                </Link>
                <span>and</span>
                <Link className="ml-1 text-secondary underline" href="/legal/privacy" size="md">
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
                  "cursor-pointer rounded-none gap-2 p-4 border-2 border-transparent",
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
                <Link className="ml-2 text-secondary underline" href="/teams/create" size="md">
                  Create a new team
                </Link>
              </div>
            </Card>

          </Tab>

          <Tab key="your-teams" title="Your Teams">
            <Card className="w-[580px]">
              <CardBody>
                {loading ? (
                  <div className="flex items-center justify-center p-8">
                    <Spinner size="lg" label="Loading your teams..." />
                  </div>
                ) : teams.length === 0 ? (
                  <div className="text-center p-8">
                    <Icon icon="solar:users-group-two-rounded-outline" className="w-16 h-16 mx-auto text-default-300 mb-4" />
                    <p className="text-default-500 mb-4">You haven&apos;t joined any teams yet.</p>
                    <Link href="/teams/create" className="text-primary underline">
                      Create your first team
                    </Link>
                  </div>
                ) : (
                  teams.map((team) => (
                    <Accordion
                      key={team.id}
                      selectionMode="multiple"
                      onSelectionChange={() => updateState({ squadId: team.id })}
                    >
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
                        subtitle={`${team.displayName} (${team.members.length} member${team.members.length !== 1 ? 's' : ''})`}
                        title={team.tag}
                      >
                        {team.description && <p className="text-sm text-default-500 mb-2">{team.description}</p>}

                        {team.members.map((member, idx) => (
                          <div key={`${member.nickname}-${idx}`} className="flex items-center gap-2">
                            <Spacer y={2} />
                            <Card className="w-1/2 border border-[#DCFF37]/20 dark:border-[#DCFF37]/30" style={{ borderRadius: "0px" }}>
                              <div className="flex items-center gap-2 p-2">
                                <Avatar alt={member.nickname.charAt(0).toUpperCase()} src={member.avatar} size="sm" />
                                <span className="text-sm">{member.nickname}</span>
                                <Chip size="sm" variant="flat" className="ml-auto">{member.role}</Chip>
                              </div>
                            </Card>
                          </div>
                        ))}
                      </AccordionItem>
                    </Accordion>
                  ))
                )}
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
