import { BentoGrid } from "@/components/ui/bento-grid";
import { BentoCard } from "@/components/ui/bento-card";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ProjectsCard } from "@/components/dashboard/projects-card";

async function Page() {
  return (
    <BentoGrid>
      <BentoGrid cols={12} span={12}>
        <ProjectsCard span={12} />
        <ProjectsCard span={6} />
        <ProjectsCard span={6} />
      </BentoGrid>
      <div className="lg:col-span-4 space-y-4">
        <BentoCard>
          <Collapsible defaultOpen={true}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="lg"
                className="group w-full justify-start transition-none hover:bg-accent hover:text-accent-foreground cursor-pointer text-base font-semibold"
              >
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  className="transition-transform size-4 group-data-[state=open]:rotate-90"
                />
                Notifications
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-5 pt-1 mt-1 border-l border-olive-300">
              ouai
            </CollapsibleContent>
          </Collapsible>
          <Collapsible defaultOpen={true} className="mt-4">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="lg"
                className="group w-full justify-start transition-none hover:bg-accent hover:text-accent-foreground cursor-pointer text-base font-semibold"
              >
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  className="transition-transform size-4 group-data-[state=open]:rotate-90"
                />
                Tâches à réaliser
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-5 pt-1 mt-1 border-l border-olive-300">
              <p>ouai</p>
              <p>plusieurs lignes ici pour tester la hauteur</p>
              <p>ouai</p>
              <p>ouai</p>
            </CollapsibleContent>
          </Collapsible>
        </BentoCard>

        <BentoCard>
          <p className="p-4 text-sm text-muted-foreground italic text-center">
            Un autre bloc indépendant ici
          </p>
        </BentoCard>
      </div>
    </BentoGrid>
  );
}

export default Page;
