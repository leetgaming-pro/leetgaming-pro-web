import type {ReviewType} from "./review";

import React from "react";

import Review from "./review";
import { cl } from "@/components/cl";

export type CardReviewProps = React.HTMLAttributes<HTMLDivElement> & ReviewType;

const CardReview = React.forwardRef<HTMLDivElement, CardReviewProps>(
  ({className, ...review}, ref) => (
    <div ref={ref} className={cl("rounded-medium bg-content1 p-5 shadow-small", className)}>
      <Review {...review} />
    </div>
  ),
);

CardReview.displayName = "CardReview";

export default CardReview;
