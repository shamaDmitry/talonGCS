import { Sun, Moon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme, themes } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

export function ModeToggle() {
  const { setTheme, theme: currentTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />

          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {Object.values(themes).map((theme) => {
          return (
            <DropdownMenuItem
              key={theme.value}
              onClick={() => setTheme(theme)}
              className={cn("focus:bg-primary focus:text-primary-foreground", {
                "bg-primary text-primary-foreground":
                  currentTheme.value === theme.value,
              })}
            >
              {<theme.icon />}

              {theme.name}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
