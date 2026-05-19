export type SiteHeaderBarProps = {
  brandAria: string;
  mainNavAria: string;
  mobileMenuAria: string;
  drawerLinksNavAria: string;
  openMenuLabel: string;
  closeMenuLabel: string;
  challenge: string;
  solution: string;
  program: string;
  about: string;
  resources: string;
  joinBootcamp: string;
  bootcampPath: string;
};

export type HeaderNavigationLink = {
  key: "challenge" | "solution" | "program" | "about" | "resources";
  href: string;
  label: string;
};
