import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight, type LucideIcon } from 'lucide-react';
import { SectionHub } from '@/components/layout/SectionHub';
import { ProductTrustBar } from '@/components/product/ProductTrustBar';
import type { ProductNavigationItem } from '@/lib/product-navigation';
import { cn } from '@/lib/utils';

interface ProductHubAction {
  href: string;
  label: string;
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary';
}

interface ProductHubQuickStartLink {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  eyebrow?: string;
  ctaLabel?: string;
}

interface ProductHubSectionLink {
  id: string;
  label: string;
}

interface ProductHubTrustItem {
  title: string;
  description: string;
  icon: LucideIcon;
  href?: string;
  linkLabel?: string;
}

interface ProductHubMethodologyCta {
  eyebrow: string;
  title: string;
  description: string;
  primaryAction: ProductHubAction;
  secondaryAction?: ProductHubAction;
}

interface ProductHubTemplateProps {
  title: string;
  description: string;
  breadcrumbItems: { label: string; href: string }[];
  activeProductId: string;
  productNavigationItems: ProductNavigationItem[];
  sectionLinks?: ProductHubSectionLink[];
  hero: {
    eyebrow: string;
    icon: LucideIcon;
    title: string;
    directAnswer: string;
    marketFact: {
      label: string;
      value: string;
      description: string;
    };
    actions: ProductHubAction[];
  };
  featuredSlot?: ReactNode;
  trustBar: {
    eyebrow: string;
    title?: string;
    description?: string;
    items: ProductHubTrustItem[];
  };
  quickStart: {
    eyebrow: string;
    title: string;
    description?: string;
    links: ProductHubQuickStartLink[];
    gridClassName?: string;
  };
  methodologyCta?: ProductHubMethodologyCta;
  children: ReactNode;
  containerClassName?: string;
}

export function ProductHubTemplate({
  title,
  description,
  breadcrumbItems,
  activeProductId,
  productNavigationItems,
  sectionLinks,
  hero,
  featuredSlot,
  trustBar,
  quickStart,
  methodologyCta,
  children,
  containerClassName,
}: ProductHubTemplateProps) {
  const HeroIcon = hero.icon;

  return (
    <SectionHub
      title={title}
      description={description}
      breadcrumbItems={breadcrumbItems}
      containerClassName={containerClassName ?? 'max-w-6xl'}
      titleClassName="not-italic"
    >
      <section className="space-y-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
            Products
          </p>
          <h2 className="text-xl font-bold tracking-tight text-brand-textPrimary dark:text-white sm:text-2xl">
            Move between Truva comparison desks
          </h2>
        </div>

        <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0">
          {productNavigationItems.map((item) => {
            const isActive = item.id === activeProductId;
            const Icon = item.icon;

            return (
              <Link
                key={item.id}
                href={item.href ?? '#'}
                className={cn(
                  'min-w-[16rem] snap-start rounded-[1.4rem] border bg-white p-4 shadow-[0_14px_40px_-34px_rgba(15,23,42,0.24)] transition-all dark:bg-white/[0.04] sm:min-w-0',
                  item.href ? 'hover:-translate-y-0.5' : 'pointer-events-none opacity-80',
                  isActive
                    ? 'border-brand-primary/30 bg-brand-primary-light/50 shadow-[0_18px_48px_-38px_rgba(0,82,255,0.35)] dark:border-brand-primary/30 dark:bg-brand-primary/10'
                    : 'border-brand-border/80 hover:border-brand-primary/20 dark:border-white/10',
                )}
              >
                <div className="flex h-full flex-col gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/15">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em]',
                        item.status === 'live'
                          ? 'bg-brand-primary/10 text-brand-primary'
                          : item.status === 'preview'
                            ? 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-200'
                            : 'bg-brand-surface text-brand-textSecondary dark:bg-white/[0.08] dark:text-gray-300',
                      )}
                    >
                      {item.status === 'live' ? (isActive ? 'Current' : 'Live') : item.status === 'preview' ? 'Preview' : 'Soon'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-bold tracking-tight text-brand-textPrimary dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
                      {item.description}
                    </p>
                  </div>

                  <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-brand-primary">
                    {isActive
                      ? 'Current desk'
                      : item.status === 'preview'
                        ? 'Open preview'
                        : item.status === 'coming-soon'
                          ? 'Coming soon'
                          : 'Open desk'}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {sectionLinks && sectionLinks.length > 0 ? (
        <section className="sticky top-[76px] z-20 -mx-4 border-y border-brand-border/70 bg-white/95 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-slate-950/95 sm:mx-0 sm:rounded-full sm:border sm:px-4">
          <div className="flex gap-2 overflow-x-auto sm:flex-wrap sm:justify-start">
            {sectionLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className="whitespace-nowrap rounded-full border border-brand-border bg-brand-surface px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-textSecondary transition-colors hover:border-brand-primary/20 hover:text-brand-primary dark:border-white/10 dark:bg-white/[0.05] dark:text-gray-300"
              >
                {link.label}
              </a>
            ))}
          </div>
        </section>
      ) : null}

      <section
        id="overview"
        className={cn(
          'grid gap-6 scroll-mt-32',
          featuredSlot ? 'lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)]' : '',
        )}
      >
        <div className="rounded-[1.8rem] border border-brand-border bg-white p-6 shadow-[0_22px_70px_-48px_rgba(15,23,42,0.28)] dark:border-white/10 dark:bg-white/[0.04] sm:p-7">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/15 bg-brand-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary dark:border-brand-primary/20 dark:bg-brand-primary/15">
              <HeroIcon className="h-4 w-4" />
              {hero.eyebrow}
            </div>

            <div className="space-y-3">
              <h2 className="max-w-3xl text-3xl font-bold leading-tight tracking-tight text-brand-textPrimary dark:text-white sm:text-4xl">
                {hero.title}
              </h2>
              <p className="max-w-2xl text-base leading-relaxed text-brand-textSecondary dark:text-gray-300">
                {hero.directAnswer}
              </p>
            </div>

            <div className="rounded-[1.35rem] border border-brand-primary/15 bg-brand-primary-light/40 p-4 dark:border-brand-primary/20 dark:bg-brand-primary/10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-primary">
                {hero.marketFact.label}
              </p>
              <p className="mt-2 text-lg font-bold tracking-tight text-brand-textPrimary dark:text-white sm:text-xl">
                {hero.marketFact.value}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
                {hero.marketFact.description}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {hero.actions.map((action, index) => {
                const ActionIcon = action.icon;
                const variant = action.variant ?? (index === 0 ? 'primary' : 'secondary');

                return (
                  <Link
                    key={`${action.href}-${action.label}`}
                    href={action.href}
                    className={cn(
                      'inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-transform',
                      variant === 'primary'
                        ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20 hover:-translate-y-0.5'
                        : 'border border-brand-border bg-brand-surface text-brand-textPrimary hover:border-brand-primary/20 hover:text-brand-primary dark:border-white/10 dark:bg-white/5 dark:text-gray-100',
                    )}
                  >
                    {ActionIcon ? <ActionIcon className="h-4 w-4" /> : null}
                    {action.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {featuredSlot}
      </section>

      <ProductTrustBar
        eyebrow={trustBar.eyebrow}
        title={trustBar.title}
        description={trustBar.description}
        items={trustBar.items}
      />

      <section id="start-here" className="space-y-5 scroll-mt-32">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
            {quickStart.eyebrow}
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white sm:text-3xl">
            {quickStart.title}
          </h2>
          {quickStart.description ? (
            <p className="max-w-2xl text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
              {quickStart.description}
            </p>
          ) : null}
        </div>

        <div className={cn('grid gap-5 md:grid-cols-3', quickStart.gridClassName)}>
          {quickStart.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group rounded-[1.6rem] border border-brand-border/80 bg-white p-5 shadow-[0_18px_48px_-40px_rgba(15,23,42,0.32)] transition-all hover:-translate-y-1 hover:border-brand-primary/25 dark:border-white/10 dark:bg-white/[0.04]"
            >
              <div className="flex h-full flex-col gap-4">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/15">
                  <link.icon className="h-5 w-5" />
                </div>

                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-primary">
                    {link.eyebrow ?? 'Start here'}
                  </p>
                  <h3 className="text-xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
                    {link.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
                    {link.description}
                  </p>
                </div>

                <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-brand-primary">
                  {link.ctaLabel ?? 'Open'}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {children}

      {methodologyCta ? (
        <section id="methodology" className="scroll-mt-32 rounded-[1.75rem] border border-brand-border bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
                {methodologyCta.eyebrow}
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white sm:text-3xl">
                {methodologyCta.title}
              </h2>
              <p className="text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
                {methodologyCta.description}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {[methodologyCta.primaryAction, methodologyCta.secondaryAction]
                .filter((action): action is ProductHubAction => Boolean(action))
                .map((action, index) => {
                  const ActionIcon = action.icon;
                  const variant = action.variant ?? (index === 0 ? 'primary' : 'secondary');

                  return (
                    <Link
                      key={`${action.href}-${action.label}`}
                      href={action.href}
                      className={cn(
                        'inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-transform',
                        variant === 'primary'
                          ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20 hover:-translate-y-0.5'
                          : 'border border-brand-border bg-brand-surface text-brand-textPrimary hover:border-brand-primary/20 hover:text-brand-primary dark:border-white/10 dark:bg-white/5 dark:text-gray-100',
                      )}
                    >
                      {ActionIcon ? <ActionIcon className="h-4 w-4" /> : null}
                      {action.label}
                    </Link>
                  );
                })}
            </div>
          </div>
        </section>
      ) : null}
    </SectionHub>
  );
}
