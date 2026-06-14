import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "myfreehouseplans.com",
    short_name: "House Plans",
    description: "Smart house plan discovery, plot checks and professional PDF, CAD and BIM files.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#020617",
    icons: [{ src: "/brand-mark.svg", sizes: "any", type: "image/svg+xml" }]
  };
}
