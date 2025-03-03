import React from "react";
import {Button} from "@nextui-org/react";
import { cl } from "@/components/cl";

export default function App(props: any) {
  return (
    <div>
        <Button  radius="full" {...props} className="battle-button" />
    </div>
  );
}
