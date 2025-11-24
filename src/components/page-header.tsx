import { cn } from "@/lib/utils";

type PageHeaderProps = {
    title: string;
    description?: string;
    className?: string;
    children?: React.ReactNode;
};

export function PageHeader({ title, description, className, children }: PageHeaderProps) {
    return (
        <div className={cn("flex items-start justify-between", className)}>
            <div className="grid gap-1">
                <h1 className="font-headline text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
                    {children && <div className="flex-shrink-0">{children}</div>}
                    <span className="flex-grow">{title}</span>
                </h1>
                {description && <p className="text-lg text-muted-foreground">{description}</p>}
            </div>
        </div>
    );
}
