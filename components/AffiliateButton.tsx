import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AffiliateButtonProps {
  amount: number;
  url: string;
}

export function AffiliateButton({ amount, url }: AffiliateButtonProps) {
  return (
    <TooltipProvider delay={150}>
      <Tooltip>
        <TooltipTrigger
          render={
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={cn(
                buttonVariants(),
                "w-full md:w-auto min-w-[140px] rounded-[6px] text-[14px] font-semibold bg-brand-primary hover:bg-brand-primaryDark text-white transition-colors border-none" 
              )}
            />
          }
        >
          Open Account &rarr;
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[200px] text-center bg-brand-textPrimary text-white shadow-md border-none p-2 rounded-md">
          <p className="text-xs">
            {amount > 0
              ? `We earn ₱${amount} if you open this account. This doesn't affect the rates we show.`
              : "No referral fee — we're not paid by this bank. Rate shown is unbiased."}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
