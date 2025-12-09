"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Spacer,
  Spinner,
  Divider,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import LaunchYourSquadButton from "@/components/teams/team-form/launch-your-squad-button";

/**
 * Team Creation Page
 * 
 * Allows users to create a new team/squad with customization options.
 */
export default function CreateTeamPage() {
  const { status } = useSession();
  const router = useRouter();
  const [teamName, setTeamName] = useState("");
  const [teamTag, setTeamTag] = useState("");
  const [description, setDescription] = useState("");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin?callbackUrl=/teams/create");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-950">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create Your Team</h1>
          <p className="text-gray-400">
            Build your squad and compete in tournaments
          </p>
        </div>

        {/* Creation Form Card */}
        <Card className="bg-gray-800/50 border border-gray-700">
          <CardHeader className="flex gap-3 px-6 py-4">
            <Icon icon="lucide:users" className="text-primary text-2xl" />
            <div>
              <h2 className="text-lg font-semibold text-white">Team Details</h2>
              <p className="text-sm text-gray-400">Fill in your team information</p>
            </div>
          </CardHeader>
          <Divider className="bg-gray-700" />
          <CardBody className="px-6 py-6 gap-6">
            {/* Team Name */}
            <Input
              label="Team Name"
              placeholder="Enter your team name"
              value={teamName}
              onValueChange={setTeamName}
              variant="bordered"
              classNames={{
                input: "text-white",
                label: "text-gray-400",
              }}
              startContent={
                <Icon icon="lucide:flag" className="text-gray-400" />
              }
              isRequired
            />

            {/* Team Tag */}
            <Input
              label="Team Tag"
              placeholder="3-5 character tag (e.g., TSM)"
              value={teamTag}
              onValueChange={(value) => setTeamTag(value.toUpperCase().slice(0, 5))}
              variant="bordered"
              classNames={{
                input: "text-white uppercase",
                label: "text-gray-400",
              }}
              startContent={
                <Icon icon="lucide:hash" className="text-gray-400" />
              }
              description="This will appear next to player names"
              maxLength={5}
            />

            {/* Description */}
            <Input
              label="Description"
              placeholder="Tell others about your team"
              value={description}
              onValueChange={setDescription}
              variant="bordered"
              classNames={{
                input: "text-white",
                label: "text-gray-400",
              }}
              startContent={
                <Icon icon="lucide:file-text" className="text-gray-400" />
              }
            />

            <Spacer y={2} />

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                variant="flat"
                className="flex-1"
                onPress={() => router.back()}
              >
                Cancel
              </Button>
              <LaunchYourSquadButton />
            </div>

            {/* Alternative: Use LaunchYourSquadButton component */}
            <div className="text-center text-gray-500 text-sm">
              or use the quick launch option below
            </div>
          </CardBody>
        </Card>

        {/* Tips Card */}
        <Card className="bg-gray-800/30 border border-gray-700/50 mt-6">
          <CardBody className="px-6 py-4">
            <div className="flex items-start gap-3">
              <Icon icon="lucide:lightbulb" className="text-yellow-500 text-xl mt-0.5" />
              <div>
                <h3 className="text-white font-medium mb-1">Pro Tips</h3>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li>• Choose a memorable team name that represents your squad</li>
                  <li>• Keep your tag short - it appears in match results</li>
                  <li>• You can invite members after creating the team</li>
                </ul>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
