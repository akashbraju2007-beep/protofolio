import { createFileRoute } from "@tanstack/react-router";
import { PortfolioExperience } from "@/components/portfolio/PortfolioExperience";
import { PortfolioWelcome } from "@/components/portfolio/PortfolioWelcome";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Akash B Raju — Full Stack Developer at NIAT" },
      {
        name: "description",
        content:
          "The interactive portfolio of Akash B Raju, a full stack developer and creative digital architect at NIAT Institution.",
      },
      { property: "og:title", content: "Akash B Raju — Interactive Developer Portfolio" },
      {
        property: "og:description",
        content:
          "Explore Akash's full-stack work through live code, generative art, 3D skills, and an AI portfolio guide.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <PortfolioWelcome>
      <PortfolioExperience />
    </PortfolioWelcome>
  );
}
