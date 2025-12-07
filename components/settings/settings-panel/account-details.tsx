"use client";

import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Avatar,
  Badge,
  Input,
  Autocomplete,
  AutocompleteItem,
  CardFooter,
  Skeleton,
} from "@nextui-org/react";
import {Icon} from "@iconify/react";

import countries from "./countries";

export interface AccountDetailsData {
  avatar?: string;
  name?: string;
  role?: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  country?: string;
  state?: string;
  address?: string;
  zipCode?: string;
}

interface AccountDetailsCardProps {
  className?: string;
  data?: AccountDetailsData;
  isLoading?: boolean;
  onSave?: (data: AccountDetailsData) => void;
  onCancel?: () => void;
  onAvatarChange?: () => void;
}

export default function AccountDetailsCard({
  className,
  data,
  isLoading = false,
  onSave,
  onCancel,
  onAvatarChange,
}: AccountDetailsCardProps) {
  const [formData, setFormData] = React.useState<AccountDetailsData>(data || {});

  React.useEffect(() => {
    if (data) {
      setFormData(data);
    }
  }, [data]);

  if (isLoading) {
    return (
      <Card className={`max-w-xl p-2 ${className || ''}`}>
        <CardHeader className="flex flex-col items-start px-4 pb-0 pt-4">
          <Skeleton className="h-6 w-32 rounded-lg mb-4" />
          <div className="flex gap-4 py-4">
            <Skeleton className="h-14 w-14 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-32 rounded-lg" />
              <Skeleton className="h-4 w-40 rounded-lg" />
            </div>
          </div>
        </CardHeader>
        <CardBody className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className={`max-w-xl p-2 ${className || ''}`}>
      <CardHeader className="flex flex-col items-start px-4 pb-0 pt-4">
        <p className="text-large">Account Details</p>
        <div className="flex gap-4 py-4">
          <Badge
            disableOutline
            classNames={{
              badge: "w-5 h-5",
            }}
            color="primary"
            content={
              <Button
                isIconOnly
                className="p-0 text-primary-foreground"
                radius="full"
                size="sm"
                variant="light"
                onPress={onAvatarChange}
              >
                <Icon icon="solar:pen-2-linear" />
              </Button>
            }
            placement="bottom-right"
            shape="circle"
          >
            <Avatar className="h-14 w-14" src={data?.avatar} showFallback />
          </Badge>
          <div className="flex flex-col items-start justify-center">
            <p className="font-medium">{data?.name || "User"}</p>
            <span className="text-small text-default-500">{data?.role || "Member"}</span>
          </div>
        </div>
        <p className="text-small text-default-400">
          The photo will be used for your profile, and will be visible to other users of the
          platform.
        </p>
      </CardHeader>
      <CardBody className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="Username"
          labelPlacement="outside"
          placeholder="Enter username"
          value={formData.username || ""}
          onValueChange={(value) => setFormData({ ...formData, username: value })}
        />
        <Input
          label="Email"
          labelPlacement="outside"
          placeholder="Enter email"
          value={formData.email || ""}
          onValueChange={(value) => setFormData({ ...formData, email: value })}
        />
        <Input
          label="First Name"
          labelPlacement="outside"
          placeholder="Enter first name"
          value={formData.firstName || ""}
          onValueChange={(value) => setFormData({ ...formData, firstName: value })}
        />
        <Input
          label="Last Name"
          labelPlacement="outside"
          placeholder="Enter last name"
          value={formData.lastName || ""}
          onValueChange={(value) => setFormData({ ...formData, lastName: value })}
        />
        <Input
          label="Phone Number"
          labelPlacement="outside"
          placeholder="Enter phone number"
          value={formData.phoneNumber || ""}
          onValueChange={(value) => setFormData({ ...formData, phoneNumber: value })}
        />
        <Autocomplete
          defaultItems={countries}
          label="Country"
          labelPlacement="outside"
          placeholder="Select country"
          showScrollIndicators={false}
          selectedKey={formData.country}
          onSelectionChange={(key) => setFormData({ ...formData, country: key as string })}
        >
          {(item) => (
            <AutocompleteItem
              key={item.code}
              startContent={
                <Avatar
                  alt="Country Flag"
                  className="h-6 w-6"
                  src={`https://flagcdn.com/${item.code.toLowerCase()}.svg`}
                />
              }
              value={item.code}
            >
              {item.name}
            </AutocompleteItem>
          )}
        </Autocomplete>
        <Input
          label="State"
          labelPlacement="outside"
          placeholder="Enter state"
          value={formData.state || ""}
          onValueChange={(value) => setFormData({ ...formData, state: value })}
        />
        <Input
          label="Address"
          labelPlacement="outside"
          placeholder="Enter address"
          value={formData.address || ""}
          onValueChange={(value) => setFormData({ ...formData, address: value })}
        />
        <Input
          label="Zip Code"
          labelPlacement="outside"
          placeholder="Enter zip code"
          value={formData.zipCode || ""}
          onValueChange={(value) => setFormData({ ...formData, zipCode: value })}
        />
      </CardBody>

      <CardFooter className="mt-4 justify-end gap-2">
        <Button radius="full" variant="bordered" onPress={onCancel}>
          Cancel
        </Button>
        <Button color="primary" radius="full" onPress={() => onSave?.(formData)}>
          Save Changes
        </Button>
      </CardFooter>
    </Card>
  );
}
