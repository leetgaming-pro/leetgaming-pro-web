import React from "react";
import { Slider } from '@nextui-org/react';

export default function Component(props: any) {
  return (
    <div className="my-auto flex flex-col gap-2">
      <h3 className="text-medium font-medium leading-8 text-default-600">Select Range</h3>
      <Slider
        onChange={props.onChange}
        animation="opacity"
        aria-label="Filter"
        range={{
          min: 0,
          defaultValue: [1, 10],
          max: 100,
          step: 50,
        }}
        {...props}
      />
    </div>
  );
}
