export const navLinks = [
  { label: "Home", to: "/" },
  {
    label: "About",
    children: [
      { label: "About Us", to: "/about" },
      { label: "Governing Body", to: "/committee" },
      { label: "Future Plans", to: "/future-plan" },
    ],
  },
  { label: "Durga Puja", to: "/durga-puja" },
  {
    label: "Activities",
    children: [
      { label: "Sports", to: "/sports" },
      { label: "Social Work", to: "/social" },
      { label: "Health Camps", to: "/health" },
      { label: "Library", to: "/library" },
    ],
  },
  { label: "Gallery", to: "/gallery" },
  { label: "Members", to: "/members" },
  { label: "Contact", to: "/contact" },
];
