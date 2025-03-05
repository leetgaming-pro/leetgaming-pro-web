import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@nextui-org/navbar";
import { Link } from "@nextui-org/link";

import { link as linkStyles } from "@nextui-org/theme";

import { siteConfig } from "@/config/site";
import NextLink from "next/link";
import clsx from "clsx";

import { ThemeSwitch } from "@/components/theme-switch";
import {
  GithubIcon,
} from "@/components/icons";

import { LoginButton } from './login-button';
import SessionButton from './session-button';
import { useSession } from 'next-auth/react';
import SearchInput from "./search/search-modal/search-modal";

import DefaultLogo from './logo/logo-default';
import { useTheme } from "next-themes";
import { electrolize } from "@/config/fonts";
import ContentWrapper from "@/components/atoms/content-wrapper";

export const Navbar = () => {

  let { theme, setTheme } = useTheme();

  if (theme === null || theme === undefined) {
    theme = "dark";
  }

  let SessionArea;

  const { data: session } = useSession()

  // console.log('##session##', JSON.stringify(session))
  if (session) {
    SessionArea = SessionButton;
  } else {
    SessionArea = LoginButton;
  }

  const searchInput = SearchInput();

  return (
    <NextUINavbar
      maxWidth="full"
      classNames={{ wrapper: 'justify-center' }}
      className="z-50 justify-center"
      height={16}
      position="sticky"
      isBordered={true}
      isBlurred={true}
      style={{ backgroundImage: `url('/blur-glow-pry-gh.svg')` }}
    >
      <ContentWrapper as="div" className="flex-row justify-center">
        <NavbarContent className="basis-1/5 sm:basis-full justify-center">
          <NavbarBrand as="li" className=" max-w-fit">
            <NextLink className="lg:flex flex justify-left items-left align-left" href="/">
              {/* <Logo /> */}

              <DefaultLogo  onClick={ () => window.location.href = "/" } />
            </NextLink>
            {/* <NavBarSection /> */}
          </NavbarBrand>
          <ul className="hidden lg:flex justify-start ml-2 h-16 justify-center align-items align-center">
            {siteConfig.navItems.map((item) => (
              <NavbarItem key={item.href}
                          style={{
                            height: "100%",
                            backgroundColor: item.href === "/match-making" ? "#DCFF37" : (item.href === "/cloud" ? "#34445C" : ""),
                            minWidth: "105px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            fontSize: "13px",
                            color: item.href === "/match-making" ? "rgb(52, 68, 92)" : (item.href === "/cloud" ? "#F5F5F5" : ""),
                          }}
              >
                <NextLink
                  className={clsx(
                    "data-[active=true]:text-primary data-[active=true]:font-medium justify-center align-items align-center w-full text-center " + electrolize.className
                  )}

                  href={item.href}

                  onClick={ () => window.location.href = item.href }
                >
                  {item.label}
                </NextLink>
              </NavbarItem>
            ))}
          </ul>
        </NavbarContent>

        <NavbarContent
          className="hidden sm:flex basis-1/5 flex justify-end sm:basis-full"
          justify="end"
        >
          <NavbarItem className="hidden sm:flex gap-2">
            {/* <Link isExternal href={siteConfig.links.twitter} aria-label="Twitter">
            <TwitterIcon className="text-default-500" />
          </Link> */}
            {/* <Link isExternal href={siteConfig.links.discord} aria-label="Discord">
            <DiscordIcon className="text-default-500" />
          </Link> */}
            {/* <Link isExternal href={siteConfig.links.github} aria-label="Github">
            <GithubIcon className="text-default-500" />
          </Link> */}
            <ThemeSwitch />
          </NavbarItem>
          <NavbarItem className="hidden lg:flex">{searchInput}</NavbarItem>


          {/* sponsor button! */}
          {/* <NavbarItem className="hidden md:flex">
					<Button
            isExternal
						as={Link}
						className="text-sm font-normal text-default-600 bg-default-100"
						href={siteConfig.links.sponsor}
						startContent={<HeartFilledIcon className="text-danger" />}
						variant="flat"
					>
						Sponsor
					</Button>
				</NavbarItem>  */}


          <NavbarItem className="hidden lg:flex">
            <SessionArea />
          </NavbarItem>


        </NavbarContent>

        <NavbarContent className="sm:hidden basis-1" justify="end">
          <Link isExternal href={siteConfig.links.github} aria-label="Github">
            <GithubIcon className="text-default-500" />
          </Link>
          <ThemeSwitch />
          <NavbarMenuToggle />
        </NavbarContent>

        <NavbarMenu>
          {searchInput}
          <div className="mx-4 mt-2 flex flex-col">
            {siteConfig.navMenuItems.map((item, index) => (
              <NavbarMenuItem key={`${item}-${index}`} className="h-4">
                <Link
                  color={
                    index === 2
                      ? "primary"
                      : index === siteConfig.navMenuItems.length - 1
                        ? "danger"
                        : "foreground"
                  }
                  href="#"
                  size="sm"
                >
                  {item.label}
                </Link>
              </NavbarMenuItem>
            ))}
          </div>
        </NavbarMenu>
      </ContentWrapper>
    </NextUINavbar>
  );
};
