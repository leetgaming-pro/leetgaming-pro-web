import React from "react";
import {Breadcrumbs, BreadcrumbItem, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button} from "@nextui-org/react";
import { ChevronDownIcon } from '@/components/icons';

export default function BreadcrumbMatch() {
  return (
    <Breadcrumbs
      itemClasses={{
        item: "px-2",
        separator: "px-0",
      }}
    >
      <BreadcrumbItem href="#home">Replay</BreadcrumbItem>
      <BreadcrumbItem href="#music">Community</BreadcrumbItem>
      <BreadcrumbItem href="#league">A-Team</BreadcrumbItem>
      <BreadcrumbItem href="#match-details">Match Details</BreadcrumbItem>
      <BreadcrumbItem
        classNames={{
          item: "px-0",
        }}
      >
        <Dropdown>
          <DropdownTrigger>
            <Button
              className="h-6 pr-2 text-small"
              endContent={<ChevronDownIcon className="text-default-500" />}
              radius="full"
              size="sm"
              variant="light"
            >
              TeamA vs TeamB (Match 1)
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Routes">
            <DropdownItem href="#song-1">
              TeamA vs TeamB (Match 2)
            </DropdownItem>
            <DropdownItem href="#song2">
              TeamC vs TeamX
            </DropdownItem>
            <DropdownItem href="#song3">
              A-TEAM vs TeamB (Match 1, Best of 3)
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </BreadcrumbItem>
    </Breadcrumbs>
  );
}


// <Breadcrumbs
//       itemClasses={{
//         item: "px-2",
//         separator: "px-0",
//       }}
//     >
//       <BreadcrumbItem href="#home">Replay</BreadcrumbItem>
//       <BreadcrumbItem href="#music">Featured</BreadcrumbItem>
//       <BreadcrumbItem href="#league">S League - Finals</BreadcrumbItem>
//       <BreadcrumbItem href="#match-details">Match Details</BreadcrumbItem>
//       <BreadcrumbItem
//         classNames={{
//           item: "px-0",
//         }}
//       >
//         <Dropdown>
//           <DropdownTrigger>
//             <Button
//               className="h-6 pr-2 text-small"
//               endContent={<ChevronDownIcon className="text-default-500" />}
//               radius="full"
//               size="sm"
//               variant="light"
//             >
//               TeamA vs TeamB (Match 1)
//             </Button>
//           </DropdownTrigger>
//           <DropdownMenu aria-label="Routes">
//             <DropdownItem href="#song-1">
//               TeamA vs TeamB (Match 2)
//             </DropdownItem>
//             <DropdownItem href="#song2">
//               TeamC vs TeamX
//             </DropdownItem>
//             <DropdownItem href="#song3">
//               A-TEAM vs TeamB (Match 1, Best of 3)
//             </DropdownItem>
//           </DropdownMenu>
//         </Dropdown>
//       </BreadcrumbItem>
//     </Breadcrumbs>