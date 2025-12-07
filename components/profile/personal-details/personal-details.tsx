"use client";

import React from "react";
import {Card, CardHeader, CardBody, Button, Avatar, Skeleton} from "@nextui-org/react";

import CellValue from "./cell-value";

export interface PersonalDetailsData {
  fullName?: string;
  birthday?: string;
  country?: {
    name: string;
    flagUrl: string;
  };
  state?: string;
  address?: string;
  zipCode?: string;
  phoneNumber?: string;
  email?: string;
  passportId?: string;
  ssn?: string;
  legalStatus?: string;
  role?: string;
}

interface PersonalDetailsProps {
  data?: PersonalDetailsData;
  isLoading?: boolean;
  onEdit?: () => void;
}

export default function PersonalDetails({ data, isLoading = false, onEdit }: PersonalDetailsProps) {
  if (isLoading) {
    return (
      <Card className="w-full max-w-lg p-2">
        <CardHeader className="justify-between px-4">
          <div className="flex flex-col items-start gap-2">
            <Skeleton className="h-6 w-32 rounded-lg" />
            <Skeleton className="h-4 w-48 rounded-lg" />
          </div>
          <Skeleton className="h-10 w-16 rounded-lg" />
        </CardHeader>
        <CardBody className="space-y-4 px-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <Skeleton className="h-4 w-24 rounded-lg" />
              <Skeleton className="h-4 w-32 rounded-lg" />
            </div>
          ))}
        </CardBody>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="w-full max-w-lg p-2">
        <CardHeader className="justify-center px-4">
          <p className="text-default-500">No personal details available</p>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg p-2">
      <CardHeader className="justify-between px-4">
        <div className="flex flex-col items-start">
          <p className="text-large">Personal Details</p>
          <p className="text-small text-default-500">Manage your personal details</p>
        </div>
        <Button color="primary" onPress={onEdit}>Edit</Button>
      </CardHeader>
      <CardBody className="space-y-2 px-6">
        {data.fullName && <CellValue label="Full Name" value={data.fullName} />}
        {data.birthday && <CellValue label="Birthday" value={data.birthday} />}
        {data.country && (
          <CellValue
            label="Country"
            value={
              <div className="flex gap-2">
                <p>{data.country.name}</p>
                <Avatar alt={data.country.name} className="h-6 w-6" src={data.country.flagUrl} />
              </div>
            }
          />
        )}
        {data.state && <CellValue label="State" value={data.state} />}
        {data.address && <CellValue label="Address" value={data.address} />}
        {data.zipCode && <CellValue label="Zip Code" value={data.zipCode} />}
        {data.phoneNumber && <CellValue label="Phone Number" value={data.phoneNumber} />}
        {data.email && <CellValue label="Email" value={data.email} />}
        {data.passportId && <CellValue label="Passport / ID" value={data.passportId} />}
        {data.ssn && <CellValue label="SSN" value={data.ssn} />}
        {data.legalStatus && <CellValue label="Legal Status" value={data.legalStatus} />}
        {data.role && <CellValue label="Role" value={data.role} />}
      </CardBody>
    </Card>
  );
}
