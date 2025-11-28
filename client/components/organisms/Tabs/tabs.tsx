import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

interface TabsListProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
 variant?:"default" |"pills" |"underline";
}

const TabsList = React.forwardRef<
 React.ElementRef<typeof TabsPrimitive.List>,
 TabsListProps
>(({ className, variant ="default", ...props }, ref) => {
 const variantStyles = {
 default:"bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-sm border-0",
 pills:"bg-transparent border-0 gap-2",
 underline:"bg-transparent border-b border-slate-200 dark:border-slate-800 rounded-none gap-1"
 };

 return (
 <div className="relative w-full overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
 <div className="flex justify-start sm:justify-center min-w-max">
 <TabsPrimitive.List
 ref={ref}
 className={cn(
"inline-flex h-auto items-center p-1 text-slate-600 dark:text-slate-400 rounded-lg",
 variantStyles[variant],
 className,
 )}
 {...props}
 />
 </div>
 {/* Scroll fade indicators */}
 <div className="pointer-events-none absolute top-0 left-0 h-full w-8 bg-gradient-to-r from-background to-transparent opacity-0 sm:opacity-100" />
 <div className="pointer-events-none absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-background to-transparent opacity-0 sm:opacity-100" />
 </div>
 );
});
TabsList.displayName = TabsPrimitive.List.displayName;

interface TabsTriggerProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
 icon?: LucideIcon;
 variant?:"default" |"pills" |"underline";
}

const TabsTrigger = React.forwardRef<
 React.ElementRef<typeof TabsPrimitive.Trigger>,
 TabsTriggerProps
>(({ className, children, icon: Icon, variant ="default", ...props }, ref) => {
 const baseStyles ="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-semibold ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 min-h-[40px] sm:min-h-[44px] relative overflow-hidden group transition-all duration-200";
 
 const variantStyles = {
 default: cn(
"text-slate-700 dark:text-slate-300",
"hover:bg-slate-100/80 dark:hover:bg-slate-800/80",
"hover:text-slate-900 dark:hover:text-slate-100",
"data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800",
"data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-50",
"data-[state=active]:shadow-md",
"data-[state=active]:font-bold",
"data-[state=active]:border data-[state=active]:border-slate-200/60 dark:data-[state=active]:border-slate-700/60"
 ),
 pills: cn(
"rounded-full px-4 sm:px-5",
"text-slate-600 dark:text-slate-400",
"bg-slate-100/50 dark:bg-slate-800/50",
"",
" dark:",
" dark:",
"",
"",
"data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:via-violet-500 data-[state=active]:to-purple-600",
"data-[state=active]:text-white dark:data-[state=active]:text-white",
"data-[state=active]: data-[state=active]:",
"data-[state=active]:border data-[state=active]:border-white/20",
"data-[state=active]:translate-y-0"
 ),
 underline: cn(
"rounded-none px-4 border-b-2 border-transparent",
"text-slate-600 dark:text-slate-400",
"",
" dark:",
" dark:",
"data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400",
"data-[state=active]:border-indigo-600 dark:data-[state=active]:border-indigo-400",
"data-[state=active]:font-semibold"
 )
 };

 return (
 <TabsPrimitive.Trigger
 ref={ref}
 className={cn(
 baseStyles,
 variantStyles[variant],
 className,
 )}
 {...props}
 >
 {Icon && (
 <Icon 
 className={cn(
"h-4 w-4 sm:h-5 sm:w-5",
"group-data-[state=active]:"
 )} 
 />
 )}
 <span className="relative z-10">{children}</span>
 </TabsPrimitive.Trigger>
 );
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
 React.ElementRef<typeof TabsPrimitive.Content>,
 React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
 <TabsPrimitive.Content
 ref={ref}
 className={cn(
"mt-3 sm:mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2",
" fade-in-50 slide-in-from-bottom-2",
 className,
 )}
 {...props}
 />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
export type { TabsListProps, TabsTriggerProps };
